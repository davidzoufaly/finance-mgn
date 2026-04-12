import fs from 'node:fs';
import { airAttachmentPassword, attachmentFilePath } from '@constants';
import type { TransactionObject } from '@types';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import type { PDFDocumentProxy, TextItem, TextMarkedContent } from 'pdfjs-dist/types/src/display/api';

/**
 * Type guard to check if an item is a TextItem.
 *
 * @param item - The item to check.
 * @returns True if the item is a TextItem.
 */
export const isTextItem = (item: unknown): item is TextItem => {
  return typeof item === 'object' && item !== null && 'str' in item;
};

/**
 * Type guard to check if content.items is an array of TextItem.
 *
 * @param items - The items to check.
 * @returns True if all items are TextItem[].
 */
export const isTextItemArray = (items: unknown[]): items is TextItem[] => {
  return items.every(isTextItem);
};

/**
 * Extracts transactions from the document items by identifying the relevant range.
 *
 * @param documentItems - The array of document items to process.
 * @returns A filtered array of document items containing transactions.
 * @throws An error if the document items are not of the expected type.
 */
export const findTransactions = (documentItems: (TextItem | TextMarkedContent)[]): TextItem[] => {
  if (!isTextItemArray(documentItems)) {
    throw new Error('❌ Invalid content.items: Expected TextItem[]');
  }

  const preUselessWord = documentItems.findIndex((item) => item.str === 'Poplatky');
  const postUselessWord =
    documentItems.findIndex((item) => item.str.includes('Pokračování') || item.str === 'Vklad') - 1;

  if (preUselessWord === -1 || postUselessWord === -1) {
    return [];
  }

  return documentItems.slice(preUselessWord + 1, postUselessWord);
};

/**
 * Processes raw transaction rows into structured transaction objects.
 *
 * @param transactions - The array of raw transaction rows.
 * @returns An array of structured transaction objects.
 */
export const processTransactions = (transactions: string[][]): TransactionObject[] => {
  return transactions.map((row) => {
    // Identify the value (last item)
    const value = row[row.length - 1].replace(/\s/g, '');

    // Identify the second date (first valid date after the first empty or non-date entry)
    const dates = row.filter((item) => /^\d{2}\.\d{2}\.\d{4}$/.test(item)); // Extract valid dates
    const accountingDate = dates[0];

    // Remove first date and value from the merged string
    const filteredItems = row.filter(
      (item) => item !== dates[0] && item !== accountingDate && item !== value,
    );

    return {
      trailingSpace: ' ',
      value: Number.parseFloat(value),
      date: accountingDate,
      source: 'air',
      bankAccount: '',
      label: filteredItems.join(' '),
    };
  });
};

/**
 * Splits document items into rows based on the "0,00" fee value.
 *
 * @param documentItems - The array of document items to process.
 * @returns An array of rows, each containing transaction data.
 */
export const splitByZeroZero = (documentItems: TextItem[]): string[][] => {
  const rows: TextItem[][] = [];
  let currentRow: TextItem[] = [];

  for (const documentItem of documentItems) {
    currentRow.push(documentItem);

    // Parse rows based on fee value which is always 0,00
    if (documentItem.str === '0,00') {
      rows.push(currentRow);
      currentRow = []; // Start a new row
    }
  }

  // Add any remaining items as the last row
  if (currentRow.length > 0) {
    rows.push(currentRow);
  }

  // Remove unused items (last two -> blank space and transaction fee)
  const textLines = rows.map((itemArray) => itemArray.map((item) => item.str).slice(0, itemArray.length - 2));

  return textLines;
};

/**
 * Processes a single page of the PDF document to extract transactions.
 *
 * @param pageNum - The page number to process.
 * @param doc - The PDF document proxy object.
 * @returns A promise that resolves to an array of processed transactions.
 */
export const processPage = async (pageNum: number, doc: PDFDocumentProxy): Promise<TransactionObject[]> => {
  const page = await doc.getPage(pageNum);
  const content = await page.getTextContent();
  const rawTransactions = findTransactions(content.items);
  const groupLines = splitByZeroZero(rawTransactions);
  const processedTransactions = processTransactions(groupLines);
  // Release page resources.
  page.cleanup();
  return processedTransactions;
};

/**
 * Parses AIR bank transactions from a PDF attachment.
 *
 * @returns A promise that resolves to an array of parsed transactions.
 * @throws An error if the PDF cannot be processed or if the attachment is missing.
 */
export const parseAirTransactions = async (): Promise<TransactionObject[]> => {
  try {
    const loadingTask = getDocument({
      url: attachmentFilePath,
      password: airAttachmentPassword,
    });

    return await loadingTask.promise.then(async (doc) => {
      console.log('💨  Parsing AIR bank transactions...');

      const numPages = doc.numPages;
      const finalTrans: TransactionObject[] = [];

      // Process each page of the document
      for (let i = 1; i <= numPages; i++) {
        const data = await processPage(i, doc);
        for (const item of data) {
          finalTrans.push(item);
        }
      }

      console.log(`💪  ${finalTrans.length} AIR bank transactions parsed`);

      // Delete the attachment after processing
      fs.unlinkSync(attachmentFilePath);
      console.log('🧨  Attachment successfully deleted');

      return finalTrans;
    });
  } catch (error) {
    // Ignore MissingPDFException as it is expected in some cases
    if (error.name !== 'MissingPDFException') {
      throw new Error(`❌  Error while parsing AIR bank transactions: ${error.message}`, { cause: error });
    }
    throw error;
  }
};
