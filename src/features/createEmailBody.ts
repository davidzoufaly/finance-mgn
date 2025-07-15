import fs from 'node:fs';
import path from 'node:path';
import { getLastMonth } from '@constants';
import { sumValuesAtIndex } from '@utils';
import type { Transaction } from '@types';
import { formatCzechCurrency } from '@utils';

/**
 * Compares total incomes versus total expenses and calculates financial metrics.
 *
 * @param incomes - Array of income transactions where each transaction contains financial data
 * @param expenses - Array of expense transactions where each transaction contains financial data
 *
 * @returns An object containing calculated financial metrics including:
 * - `incomesTotal`: Total income amount formatted as Czech currency
 * - `expensesTotal`: Total expense amount formatted as Czech currency
 * - `netIncome`: Net income (incomes - expenses) formatted as Czech currency
 * - `savingsRate`: Percentage of income saved, formatted to 1 decimal place
 * - `expenseRatio`: Percentage of income spent, formatted to 1 decimal place
 * - `isPositive`: Boolean indicating if net income is positive
 * - `status`: String describing financial status ('Surplus', 'Deficit', or 'Break Even')
 *
 */
export const compareIncomesVsExpenses = (incomes: Transaction[], expenses: Transaction[]) => {
  const incomesTotal = sumValuesAtIndex(incomes, 1);
  const expensesTotal = sumValuesAtIndex(expenses, 1);

  const netIncome = incomesTotal - expensesTotal;
  const savingsRate = incomesTotal > 0 ? ((netIncome / incomesTotal) * 100).toFixed(1) : '0.0';
  const expenseRatio = incomesTotal > 0 ? ((expensesTotal / incomesTotal) * 100).toFixed(1) : '0.0';

  return {
    incomesTotal: formatCzechCurrency(incomesTotal),
    expensesTotal: formatCzechCurrency(expensesTotal),
    netIncome: formatCzechCurrency(netIncome),
    savingsRate,
    expenseRatio,
    isPositive: netIncome > 0,
    status: netIncome > 0 ? 'Surplus' : netIncome < 0 ? 'Deficit' : 'Break Even',
  };
};

/**
 * Replaces template placeholders in a string with provided values.
 *
 * @param template - The template string containing placeholders in `{{VARIABLE}}` format
 * @param variables - Object mapping placeholder names to replacement values
 *
 * @returns The template string with all placeholders replaced by their corresponding values
 */
export const replaceTemplateVariables = (template: string, variables: Record<string, string>): string => {
  return Object.entries(variables).reduce((result, [key, value]) => {
    return result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }, template);
};

/**
 * Creates an HTML email body with financial report data and saves it to a file.
 *
 * This function generates a comprehensive financial report email by:
 * 1. Calculating financial metrics using income/expense comparison
 * 2. Reading an HTML template file with placeholders
 * 3. Replacing template placeholders with dynamic financial data
 * 4. Saving the final HTML content to 'email-body.txt'
 *
 * @param finalExpenses - Array of processed expense transactions
 * @param finalIncomes - Array of processed income transactions
 * @param finalInvestments - Array of processed investment transactions
 * @param sheetId - Google Sheets document ID for generating the view link
 *
 * @throws Will throw an error if the HTML template file cannot be read
 * @throws Will throw an error if the output file cannot be written
 *
 * @remarks
 * The function expects an HTML template file to exist at `src/static/email-template.html`.
 * The template should contain placeholders like `{{EXPENSES_TOTAL}}`, `{{NET_INCOME}}`, etc.
 *
 */
export const createEmailBody = (
  finalExpenses: Transaction[],
  finalIncomes: Transaction[],
  finalInvestments: Transaction[],
  sheetId: string,
) => {
  const comparison = compareIncomesVsExpenses(finalIncomes, finalExpenses);

  const investmentsTotal = sumValuesAtIndex(finalInvestments, 1);

  const templatePath = path.join(process.cwd(), 'src', 'static', 'email-template.html');
  const htmlTemplate = fs.readFileSync(templatePath, 'utf8');

  const templateVariables = {
    LAST_MONTH: getLastMonth(),
    CURRENT_DATE_TIME: new Date().toLocaleString(),
    EXPENSES_COUNT: finalExpenses.length.toString(),
    EXPENSES_TOTAL: comparison.expensesTotal,
    INCOMES_COUNT: finalIncomes.length.toString(),
    INCOMES_TOTAL: comparison.incomesTotal,
    INVESTMENTS_COUNT: finalInvestments.length.toString(),
    INVESTMENTS_TOTAL: formatCzechCurrency(investmentsTotal),
    NET_INCOME: comparison.netIncome,
    NET_INCOME_CLASS: comparison.isPositive ? 'positive' : 'negative',
    STATUS: comparison.status,
    SAVINGS_RATE: comparison.savingsRate,
    EXPENSE_RATIO: comparison.expenseRatio,
    STATUS_BACKGROUND: comparison.isPositive ? '#d4edda' : '#f8d7da',
    STATUS_EMOJI: comparison.isPositive ? '✅' : '⚠️',
    STATUS_MESSAGE: comparison.isPositive
      ? 'You had a positive month!'
      : 'You spent more than you earned this month',
    SHEET_ID: sheetId,
  };

  const htmlContent = replaceTemplateVariables(htmlTemplate, templateVariables);

  fs.writeFileSync('email-body.txt', htmlContent);
  console.log('📧  Email body saved to email-body.txt (HTML format with template)');
};
