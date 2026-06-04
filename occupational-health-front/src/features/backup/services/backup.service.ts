import { apiClient } from '@/lib/axios';

export const backupService = {
  export: async (): Promise<void> => {
    const response = await apiClient.get('/backup/export', { responseType: 'blob' });
    const url = URL.createObjectURL(
      new Blob([response.data as BlobPart], { type: 'application/octet-stream' }),
    );
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    const h = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = String(h % 12 || 12).padStart(2, '0');
    const filename = `Respaldo-${day}-${month}-${year}-${hour12}-${minutes}${period}`;

    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.pgdump`;
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
