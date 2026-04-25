import { useQuery } from '@tanstack/react-query';
import { positionsService } from '../services/positions.service';

export const POSITIONS_KEY = (companyId?: string) =>
  companyId ? ['positions', companyId] : ['positions'];

export function usePositions(companyId?: string) {
  return useQuery({
    queryKey: POSITIONS_KEY(companyId),
    queryFn: () => positionsService.getAll(companyId),
    select: (data) => data.positions,
    enabled: true,
  });
}
