import fs from 'node:fs';
import { getOpenAIModel, openaiToken } from '@constants';
import type { Transaction } from '@types';
import { sortByDateDesc } from '@utils';
import OpenAI from 'openai';
import { z } from 'zod';

// Define the Zod schema for validating LLM output
export const TransactionSchema = z.object({
  transactions: z.array(z.array(z.string())), // Array of transactions, each represented as an array of strings
  tokens: z.number(), // Number of tokens consumed by the LLM
});

export type TransactionData = z.infer<typeof TransactionSchema>;

/**
 * Sums the values at a specific index in an array of transactions.
 *
 * @param array - The array of transactions.
 * @param index - The index of the value to sum.
 * @returns The sum of the values at the specified index.
 */
export const sumValuesAtIndex = (array: Transaction[], index: number): number =>
  array.reduce((acc, item) => acc + Number.parseFloat(item[index]), 0.0);

/**
 * Validates and parses the LLM output using Zod.
 *
 * @param llmOutput - The raw JSON string output from the LLM.
 * @param promptFilename - The name of the prompt file for error context.
 * @returns The validated and parsed `TransactionData` object.
 * @throws An error if the output is invalid or misformatted.
 */
export const getValidatedLLMResult = (llmOutput: string, promptFilename: string): TransactionData => {
  try {
    // Parse and validate the JSON output
    const result = TransactionSchema.safeParse(JSON.parse(llmOutput));

    if (!result.success) {
      // Throw a detailed error if validation fails
      throw new Error(
        `❌  Output for ${promptFilename} returned from LLM is misformatted:\n${JSON.stringify(
          result.error.format(),
          null,
          2,
        )}`,
      );
    }

    return result.data;
  } catch (error) {
    throw new Error(
      `❌  Failed to parse or validate JSON output for ${promptFilename}\nError: ${
        error.message
      }\nOutput: ${llmOutput}`,
      { cause: error },
    );
  }
};

/**
 * Performs integrity checks on transactions before and after LLM processing.
 *
 * @param newTransactions - The new transactions.
 * @param labeledTransactions - The transactions returned by the LLM.
 * @param promptFilename - The name of the prompt file for error context.
 * @throws An error if integrity checks fail.
 */
export const integrityChecks = (
  newTransactions: Transaction[],
  labeledTransactions: Transaction[],
  promptFilename: string,
): void => {
  // Integrity check for number of rows
  if (newTransactions.length !== labeledTransactions.length) {
    throw new Error(
      `❌  Some transactions were lost by LLM process for ${promptFilename}: pre-LLM ${newTransactions.length} vs. post-LLM ${labeledTransactions.length}`,
    );
  }

  // Integrity check for persisted values
  const summaryOfTransactionsPreLabeled = sumValuesAtIndex(newTransactions, 1);
  const summaryOfTransactionsPostLabeled = sumValuesAtIndex(labeledTransactions, 1);

  if (summaryOfTransactionsPostLabeled !== summaryOfTransactionsPreLabeled) {
    throw new Error(
      `❌  Some transaction values were modified by LLM process for ${promptFilename}: pre-LLM ${summaryOfTransactionsPreLabeled} vs. post-LLM ${summaryOfTransactionsPostLabeled}`,
    );
  }

  console.log(`🎏  LLM did not mess up ${promptFilename} data`);
};

/**
 * Labels transactions using an LLM.
 *
 * @param existingTransactions - The existing transactions.
 * @param newTransactions - The new transactions.
 * @param promptFilename - The name of the prompt file.
 * @returns A promise that resolves to the labeled transactions.
 * @throws An error if the labeling process fails.
 */
export const labelTransactions = async (
  existingTransactions: Transaction[],
  newTransactions: Transaction[],
  promptFilename: string,
): Promise<Transaction[]> => {
  const openaiModel = getOpenAIModel();

  if (!openaiToken || !openaiModel) {
    throw new Error('❌ OpenAI token OR model is not configured. Set it in .env file');
  }

  // Read prompt logic from files
  const genericPromptLogic = fs.readFileSync('./src/static/prompts/generic-prompt.txt', 'utf8');
  const specificPromptLogic = fs.readFileSync(`./src/static/prompts/${promptFilename}.txt`, 'utf8');

  const openai = new OpenAI({
    apiKey: openaiToken,
  });

  // To not overwhelm the LLM, we limit the number of existing transactions to the newest 150
  const newest150existingTransactions = existingTransactions
    .slice(0, 150)
    .map((item) => item.join(' | '))
    .join('\n');

  // Construct the prompt for the LLM
  const prompt = `
    ${genericPromptLogic}\n
    ${specificPromptLogic}\n
    Existing transactions:\n
    ${newest150existingTransactions}\n
    New transactions:\n
    ${newTransactions.map((item) => item.join(' | ')).join('\n')}
  `;

  console.log(`🧠  Prompting LLM to add transaction categories for ${promptFilename}...`);

  const completion = openai.chat.completions.create({
    model: openaiModel,
    store: false,
    messages: [{ role: 'system', content: prompt }],
  });

  const output = await completion;
  const llmOutput = output.choices[0].message.content || '';
  const resultObject = getValidatedLLMResult(llmOutput, promptFilename);

  // Perform integrity checks
  integrityChecks(newTransactions, resultObject.transactions, promptFilename);

  console.log(
    `🚀  Transaction categories added for ${promptFilename}, consuming ${resultObject.tokens} OpenAI tokens`,
  );
  const transactions = sortByDateDesc([...resultObject.transactions, ...existingTransactions]);

  return transactions;
};

/**
 * Labels transactions using an LLM with retry logic.
 *
 * @param existingTransactions - The existing transactions.
 * @param newTransactions - The new transactions.
 * @param promptFilename - The name of the prompt file.
 * @param maxTries - Maximum retry attempts (default: 2, for a total of 3 attempts).
 * @returns A promise that resolves to the labeled transactions.
 * @throws An error if the labeling process fails after all retries.
 */
export const labelTransactionsWithRetry = async (
  existingTransactions: Transaction[],
  newTransactions: Transaction[],
  promptFilename: string,
  maxTries = 3,
): Promise<Transaction[]> => {
  let attempts = 0;
  let lastError: Error | null = null;

  while (attempts <= maxTries) {
    attempts++;

    try {
      // Log retry attempt if not the first attempt
      if (attempts > 1) {
        console.log(`🔄  Retry attempt ${attempts - 1} for labeling ${promptFilename} transactions...`);
      }

      // Call the original labelTransactions function
      return await labelTransactions(existingTransactions, newTransactions, promptFilename);
    } catch (error) {
      lastError = error;

      // If we've reached the max retries, give up
      if (attempts > maxTries) {
        console.error(`❌  Failed to label transactions after ${maxTries} attempts: ${error.message}`);
        break;
      }

      // Log the error but continue with retry
      console.warn(`⚠️  Attempt ${attempts}/${maxTries} failed: ${error.message}`);

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  // If all attempts failed, throw the last error
  throw (
    lastError ||
    new Error(`❌  Failed to label transactions after ${maxTries} attempts`, { cause: lastError })
  );
};
