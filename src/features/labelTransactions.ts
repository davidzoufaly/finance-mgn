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
 * @param existingTransactions - The existing transactions.
 * @param newTransactions - The new transactions.
 * @param labeledTransactions - The transactions returned by the LLM.
 * @param promptFilename - The name of the prompt file for error context.
 * @throws An error if integrity checks fail.
 */
export const integrityChecks = (
  existingTransactions: Transaction[],
  newTransactions: Transaction[],
  labeledTransactions: Transaction[],
  promptFilename: string,
): void => {
  const allTransactionsPreLabeled = [...newTransactions, ...existingTransactions];

  // Integrity check for number of rows
  if (allTransactionsPreLabeled.length !== labeledTransactions.length) {
    throw new Error(
      `❌  Some transactions were lost by LLM process for ${promptFilename}: pre-LLM ${allTransactionsPreLabeled.length} vs. post-LLM ${labeledTransactions.length}`,
    );
  }

  // Integrity check for persisted values
  const summaryOfTransactionsPreLabeled = sumValuesAtIndex(allTransactionsPreLabeled, 1);
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

  const transactions = sortByDateDesc([...newTransactions, ...existingTransactions]);

  // Read prompt logic from files
  const genericPromptLogic = fs.readFileSync('./src/static/prompts/generic-prompt.txt', 'utf8');
  const specificPromptLogic = fs.readFileSync(`./src/static/prompts/${promptFilename}.txt`, 'utf8');

  const openai = new OpenAI({
    apiKey: openaiToken,
  });

  // Construct the prompt for the LLM
  const prompt = `${genericPromptLogic}\n${specificPromptLogic}\n${transactions
    .map((item) => item.join(' | '))
    .join('\n')}`;

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
  integrityChecks(existingTransactions, newTransactions, resultObject.transactions, promptFilename);

  console.log(
    `🚀  Transaction categories added for ${promptFilename}, consuming ${resultObject.tokens} OpenAI tokens`,
  );

  return resultObject.transactions;
};
