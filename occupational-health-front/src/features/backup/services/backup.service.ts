import { apiClient } from '@/lib/axios';

export const backupService = {
  export: async (): Promise<void> => {
    const response = await apiClient.get('/backup/export', { responseType: 'blob' });
    const url = URL.createObjectURL(
      new Blob([response.data as BlobPart], { type: 'application/octet-stream' }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup-${new Date().toISOString().slice(0, 10)}.pgdump`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  },

  restore: async (file: File): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);
    await apiClient.post('/backup/restore', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
