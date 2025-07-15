/**
 * Formats a number as Czech currency with proper thousands separators and CZK suffix.
 *
 * @param amount - The numeric amount to format
 * @returns Formatted string in Czech currency format (e.g., "35 820 CZK")
 *
 * @example
 * ```typescript
 * formatCzechCurrency(35820);    // Returns: "35 820 CZK"
 * formatCzechCurrency(1500.50);  // Returns: "1 501 CZK" (rounded to nearest whole number)
 * formatCzechCurrency(0);        // Returns: "0 CZK"
 * ```
 */
export const formatCzechCurrency = (amount: number | string): string => {
  const numericAmount = typeof amount === 'string' ? Number.parseFloat(amount) : amount;

  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericAmount);
};
