import OpenAI from "openai";
import { openaiToken } from "../constants/constants.mjs";
import fs from "fs";

// helper function
const sumValuesAtIndex = (array, index) => array.reduce((acc, item) => acc + parseFloat(item[index]), 0.0);

const getValidatedLLMResult = (llmOutput, promptFilename) => {
  let resultObject;
  try {
    resultObject = JSON.parse(llmOutput);
  } catch (error) {
    throw new Error(
      `❌  Failed to parse JSON output for ${promptFilename}\nError: ${error.message}\nOutput: ${llmOutput}`,
      { cause: err },
    );
  }

  // Output check
  if (
    !resultObject.transactions &&
    !resultObject.tokens &&
    !Array.isArray(resultObject.transactions) &&
    resultObject.transactions.length === 0
  ) {
    throw new Error(`❌  Output for ${promptFilename} returned from LLM is misformatted:\n${resultObject}`);
  }

  return resultObject;
};

const integrityChecks = (existingTransactions, newTransactions, labeledTransactions, promptFilename) => {
  const allTransactionsPreLabeled = [...newTransactions, ...existingTransactions];

  // integrity check for number of rows
  if (allTransactionsPreLabeled.length !== labeledTransactions.length) {
    throw new Error(
      `❌  Some transactions were lost by LLM process for ${promptFilename}: pre-LLM ${existingTransactions.length} vs. post-LLM ${labeledTransactions.length}`,
    );
  }

  // integrity check for persisted values
  const summaryOfTransactionsPreLabeled = sumValuesAtIndex(allTransactionsPreLabeled, 1);
  const summaryOfTransactionsPostLabeled = sumValuesAtIndex(labeledTransactions, 1);

  if (summaryOfTransactionsPostLabeled !== summaryOfTransactionsPreLabeled) {
    throw new Error(
      `❌  Some transactions values were modified by LLM process ${promptFilename}: pre-LLM ${summaryOfTransactionsPreLabeled} vs. post-LLM ${summaryOfTransactionsPostLabeled}`,
    );
  }

  console.log(`🎏  LLM did not mess up ${promptFilename} data`);
};

export const labelTransactions = async (existingTransactions, newTransactions, promptFilename) => {
  if (!openaiToken) throw new Error("❌ OpenAI token is not configured. Set it in .env file");

  const transactions = [...newTransactions, ...existingTransactions];

  try {
    const genericPromptLogic = fs.readFileSync("./src/prompts/generic-prompt.txt", "utf8");
    const specificPromptLogic = fs.readFileSync(`./src/prompts/${promptFilename}.txt`, "utf8");

    const openai = new OpenAI({
      apiKey: openaiToken,
    });

    const prompt = `${genericPromptLogic}\n${specificPromptLogic}\n${transactions
      .map((item) => item.join(" | "))
      .join("\n")}`;

    console.log(`🧠  Prompting LLM to add transaction categories for ${promptFilename}...`);

    const completion = openai.chat.completions.create({
      model: "o3-mini",
      store: false,
      messages: [{ role: "system", content: prompt }],
    });

    const output = await completion;
    const llmOutput = output.choices[0].message.content;
    const resultObject = getValidatedLLMResult(llmOutput, promptFilename);

    // throws error if fails
    integrityChecks(existingTransactions, newTransactions, resultObject.transactions, promptFilename);

    console.log(
      `🚀  Transaction categories added for ${promptFilename}, consuming ${resultObject.tokens} OpenAI tokens`,
    );

    return resultObject.transactions;
  } catch (error) {
    throw error;
  }
};
