const VALID_PREFIXES = new Set(['J', 'G', 'V', 'E', 'P']);

export function formatRif(rif: string): string {
  const match = rif.match(/^([A-Za-z])-?(\d+)-?(\d)$/);
  if (!match) return rif;
  return `${match[1].toUpperCase()}-${match[2]}-${match[3]}`;
}

/**
 * Called on blur: extracts digits (and optional leading letter) from raw input
 * and returns the canonical J-XXXXXXXXX-X format.
 * e.g. "3009871230" → "J-300987123-0"
 * e.g. "G1234567890" → "G-123456789-0"
 */
export function autoFormatRif(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return trimmed;

  const firstChar = trimmed[0].toUpperCase();
  const prefix = VALID_PREFIXES.has(firstChar) ? firstChar : 'J';
  const digits = trimmed.replace(/\D/g, '');

  if (digits.length < 2) return trimmed;

  const middle = digits.slice(0, -1);
  const check = digits.slice(-1);
  return `${prefix}-${middle}-${check}`;
}

// Extracts only digits for search comparison
export function normalizeRifSearch(value: string): string {
  return value.replace(/\D/g, '');
}
