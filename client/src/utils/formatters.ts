/**
 * Formats a numerical value as Indian Rupee (INR) currency.
 * e.g. 79990 -> ₹79,990, 129999 -> ₹1,29,999
 */
export function formatINR(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null) return '₹0';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatINRWithDecimals(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null) return '₹0.00';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Calculates percentage discount between MRP (compareAtPrice) and selling price
 * e.g. compareAt 7990, price 1999 -> "75% off"
 */
export function getDiscountPercentage(price: number, compareAtPrice?: number | null): string | null {
  if (!compareAtPrice || compareAtPrice <= price) return null;
  const pct = Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
  return `${pct}% off`;
}
