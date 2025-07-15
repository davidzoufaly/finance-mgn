import type { Transaction } from '@types';

/**
 * Sums the values at a specific index in an array of transactions.
 *
 * @param array - The array of transactions.
 * @param index - The index of the value to sum.
 * @returns The sum of the values at the specified index.
 */
export const sumValuesAtIndex = (array: Transaction[], index: number): number =>
  array.reduce((acc, item) => acc + Number.parseFloat(item[index]), 0.0);
