import { useQuery } from '@tanstack/react-query';
import { companiesService } from '../services/companies.service';

export const COMPANIES_KEY = ['companies'] as const;

export function useCompanies() {
  return useQuery({
    queryKey: COMPANIES_KEY,
    queryFn: () => companiesService.getAll(),
    select: (data) => data.companies,
  });
}
