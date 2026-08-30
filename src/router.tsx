import { Navigate, createBrowserRouter } from 'react-router';

export const router = createBrowserRouter([
  {
    path: '/',
    lazy: async () => {
      const { ListaEstado } = await import('./paginas/ListaEstado/ListaEstado');
      return { Component: ListaEstado };
    },
  },
  {
    path: '/estado/criar',
    lazy: async () => {
      const { CriarEstado } = await import('./paginas/CriarEstado/CriarEstado');
      return { Component: CriarEstado };
    },
  },
  {
    path: '/estado/editar/:id',
    lazy: async () => {
      const { EditarEstado } = await import('./paginas/EditarEstado/EditarEstado');
      return { Component: EditarEstado };
    },
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
