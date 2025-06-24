import fs from 'node:fs';
import type { Transaction } from '@types';

export const createEmailBody = (
  finalExpenses: Transaction[],
  finalIncomes: Transaction[],
  finalInvestments: Transaction[],
  sheetId: string,
) => {
  // Add this after writing to Google Sheets is complete
  const expensesTotal = finalExpenses
    .reduce((sum, transaction) => sum + Number.parseFloat(transaction[2]), 0)
    .toFixed(2);
  const incomesTotal = finalIncomes
    .reduce((sum, transaction) => sum + Number.parseFloat(transaction[2]), 0)
    .toFixed(2);
  const investmentsTotal = finalInvestments
    .reduce((sum, transaction) => sum + Number.parseFloat(transaction[2]), 0)
    .toFixed(2);

  // Create a nicely formatted summary text for email
  const summaryContent = `## Monthly Financial Report

### Transaction Summary

**Expenses**: ${finalExpenses.length} transactions totaling ${expensesTotal}
**Incomes**: ${finalIncomes.length} transactions totaling ${incomesTotal}
**Investments**: ${finalInvestments.length} transactions totaling ${investmentsTotal}

### Google Sheet
[View Complete Financial Data](https://docs.google.com/spreadsheets/d/${sheetId}/edit)

### Processing Date
${new Date().toLocaleDateString()}
`;

  fs.writeFileSync('email-body.txt', summaryContent);
  console.log('📧 Email body saved to email-body.txt');
};
