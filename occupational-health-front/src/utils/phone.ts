/**
 * Formats a Venezuelan phone number on blur.
 * e.g. "04145652189" → "0414-5652189"
 * Always splits at position 4: first 4 digits = prefix, rest = number.
 */
export function autoFormatPhone(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (digits.length <= 4) return digits;
  return `${digits.slice(0, 4)}-${digits.slice(4)}`;
}
