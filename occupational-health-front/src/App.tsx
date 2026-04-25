import { RouterProvider } from '@tanstack/react-router';
import { router } from '@/router';

// Componente raíz: provee el router a toda la aplicación
export default function App() {
  return <RouterProvider router={router} />;
}
