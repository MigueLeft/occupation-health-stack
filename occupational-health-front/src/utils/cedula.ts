const VALID_CEDULA_PREFIXES = new Set(['V', 'E']);

/**
 * Called on blur: defaults to 'V' prefix if only digits are entered.
 * e.g. "27736710" → "V-27736710"
 * e.g. "E27736710" → "E-27736710"
 */
export function autoFormatCedula(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return trimmed;

  const firstChar = trimmed[0].toUpperCase();
  const prefix = VALID_CEDULA_PREFIXES.has(firstChar) ? firstChar : 'V';
  const digits = trimmed.replace(/\D/g, '');

  if (!digits) return trimmed;
  return `${prefix}-${digits}`;
}

export function formatCedula(cedula: string): string {
  const match = cedula.match(/^([A-Za-z])-?(\d+)$/);
  if (!match) return cedula;
  const [, prefix, digits] = match;
  const formatted = digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${prefix.toUpperCase()}-${formatted}`;
}

export function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}
