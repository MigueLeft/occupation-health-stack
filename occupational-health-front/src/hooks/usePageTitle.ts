import { useEffect } from 'react';

// Establece el título de la pestaña del navegador
export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} | Salud Ocupacional`;
  }, [title]);
}
