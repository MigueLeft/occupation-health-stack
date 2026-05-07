export type PeriodType = 'none' | 'monthly' | 'quarterly' | 'semiannual' | 'annual';

export interface DateRange { from: string; to: string; }

function pad(n: number): string { return String(n).padStart(2, '0'); }

export function computeDateRange(
  type: PeriodType, year: string, month: string, quarter: string, semester: string,
): DateRange | null {
  const y = parseInt(year, 10);
  if (type === 'none' || !year || isNaN(y)) return null;

  switch (type) {
    case 'monthly': {
      if (!month) return null;
      const m = parseInt(month, 10);
      const last = new Date(y, m, 0).getDate();
      return { from: `${year}-${pad(m)}-01`, to: `${year}-${pad(m)}-${pad(last)}` };
    }
    case 'quarterly': {
      if (!quarter) return null;
      const q = parseInt(quarter, 10);
      const sm = (q - 1) * 3 + 1;
      const em = q * 3;
      return { from: `${year}-${pad(sm)}-01`, to: `${year}-${pad(em)}-${pad(new Date(y, em, 0).getDate())}` };
    }
    case 'semiannual': {
      if (!semester) return null;
      const s = parseInt(semester, 10);
      const sm = s === 1 ? 1 : 7;
      const em = s === 1 ? 6 : 12;
      return { from: `${year}-${pad(sm)}-01`, to: `${year}-${pad(em)}-${pad(new Date(y, em, 0).getDate())}` };
    }
    case 'annual':
      return { from: `${year}-01-01`, to: `${year}-12-31` };
    default:
      return null;
  }
}

const currentYear = new Date().getFullYear();
export const YEAR_OPTIONS = Array.from({ length: currentYear - 2019 }, (_, i) => String(currentYear - i));

export const MONTH_OPTIONS = [
  { value: '1', label: 'Enero' }, { value: '2', label: 'Febrero' },
  { value: '3', label: 'Marzo' }, { value: '4', label: 'Abril' },
  { value: '5', label: 'Mayo' }, { value: '6', label: 'Junio' },
  { value: '7', label: 'Julio' }, { value: '8', label: 'Agosto' },
  { value: '9', label: 'Septiembre' }, { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' }, { value: '12', label: 'Diciembre' },
];

export const QUARTER_OPTIONS = [
  { value: '1', label: '1er Trimestre (Ene - Mar)' },
  { value: '2', label: '2do Trimestre (Abr - Jun)' },
  { value: '3', label: '3er Trimestre (Jul - Sep)' },
  { value: '4', label: '4to Trimestre (Oct - Dic)' },
];

export const SEMESTER_OPTIONS = [
  { value: '1', label: '1er Semestre (Ene - Jun)' },
  { value: '2', label: '2do Semestre (Jul - Dic)' },
];
