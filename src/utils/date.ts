import type { Transaction } from '@types';

/**
 * Sorts an array of `Transaction` objects in descending order based on their date.
 *
 * Assumes that the date is stored as a string in the format "MM/DD/YYYY" at the second position (index 1) of each `Transaction` tuple or array.
 *
 * @param arr - The array of `Transaction` objects to sort.
 * @returns A new array of `Transaction` objects sorted from newest to oldest by date.
 */
export const sortByDateDesc = (arr: Transaction[]): Transaction[] => {
  const parseDate = (str: string) => {
    const [month, day, year] = str.split('/').map(Number);
    return new Date(year, month - 1, day).getTime();
  };
  return arr.sort((a, b) => {
    const dateA = parseDate(a[2]);
    const dateB = parseDate(b[2]);
    return dateB - dateA;
  });
};
