import fs from 'node:fs';
import path from 'node:path';
import type { Transaction } from '@types';

const compareIncomesVsExpenses = (incomes: Transaction[], expenses: Transaction[]) => {
  const incomesTotal = incomes.reduce((sum, transaction) => sum + Number.parseFloat(transaction[2]), 0);
  const expensesTotal = expenses.reduce((sum, transaction) => sum + Number.parseFloat(transaction[2]), 0);

  const netIncome = incomesTotal - expensesTotal;
  const savingsRate = incomesTotal > 0 ? ((netIncome / incomesTotal) * 100).toFixed(1) : '0.0';
  const expenseRatio = incomesTotal > 0 ? ((expensesTotal / incomesTotal) * 100).toFixed(1) : '0.0';

  return {
    incomesTotal: incomesTotal.toFixed(2),
    expensesTotal: expensesTotal.toFixed(2),
    netIncome: netIncome.toFixed(2),
    savingsRate,
    expenseRatio,
    isPositive: netIncome > 0,
    status: netIncome > 0 ? 'Surplus' : netIncome < 0 ? 'Deficit' : 'Break Even',
  };
};

const replaceTemplateVariables = (template: string, variables: Record<string, string>): string => {
  return Object.entries(variables).reduce((result, [key, value]) => {
    return result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }, template);
};

export const createEmailBody = (
  finalExpenses: Transaction[],
  finalIncomes: Transaction[],
  finalInvestments: Transaction[],
  sheetId: string,
) => {

  const comparison = compareIncomesVsExpenses(finalIncomes, finalExpenses);

  const investmentsTotal = finalInvestments
    .reduce((sum, transaction) => sum + Number.parseFloat(transaction[2]), 0)
    .toFixed(2);

  const templatePath = path.join(process.cwd(), 'src', 'static', 'email-template.html');
  const htmlTemplate = fs.readFileSync(templatePath, 'utf8');

  const templateVariables = {
    CURRENT_DATE: new Date().toLocaleDateString(),
    CURRENT_TIME: new Date().toLocaleTimeString(),
    EXPENSES_COUNT: finalExpenses.length.toString(),
    EXPENSES_TOTAL: comparison.expensesTotal,
    INCOMES_COUNT: finalIncomes.length.toString(),
    INCOMES_TOTAL: comparison.incomesTotal,
    INVESTMENTS_COUNT: finalInvestments.length.toString(),
    INVESTMENTS_TOTAL: investmentsTotal,
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
  console.log('📧 Email body saved to email-body.txt (HTML format with template)');
};

export { compareIncomesVsExpenses };
