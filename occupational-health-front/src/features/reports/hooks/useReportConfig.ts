import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { reportConfigService } from '../services/report-config.service';

const CONFIG_KEY = ['report-config'] as const;

export function useReportConfig() {
  return useQuery({
    queryKey: CONFIG_KEY,
    queryFn: () => reportConfigService.get(),
  });
}

export function useUpdateSelloMedico() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (selloMedico: string | null) => reportConfigService.updateSello(selloMedico),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CONFIG_KEY });
      toast.success('Sello médico actualizado.');
    },
    onError: () => toast.error('Error al guardar el sello médico'),
  });
}
