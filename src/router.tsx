import { Navigate, createBrowserRouter } from 'react-router';
import { RouteError } from './shared/RouteError/RouteError';

export const router = createBrowserRouter([
  {
    errorElement: <RouteError />,
    children: [
      {
        path: '/',
        lazy: async () => {
          const { StateList } = await import('./pages/StateList/StateList');
          return { Component: StateList };
        },
      },
      {
        path: '/state/new',
        lazy: async () => {
          const { CreateState } = await import('./pages/CreateState/CreateState');
          return { Component: CreateState };
        },
      },
      {
        path: '/state/:id/edit',
        lazy: async () => {
          const { EditState } = await import('./pages/EditState/EditState');
          return { Component: EditState };
        },
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
