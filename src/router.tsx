import { Navigate, createBrowserRouter } from 'react-router';
import { RouteError } from './shared/RouteError/RouteError';
import { Layout } from './shared/Layout/Layout';
import { ProtectedRoute } from './shared/ProtectedRoute/ProtectedRoute';

export const router = createBrowserRouter([
  {
    Component: Layout,
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
        path: '/login',
        lazy: async () => {
          const { Login } = await import('./pages/Login/Login');
          return { Component: Login };
        },
      },
      {
        // Only mutating pages require a token, matching the backend's
        // GET-is-public decision (see its ADR 0017) - the list stays outside
        // this wrapper.
        Component: ProtectedRoute,
        children: [
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
        ],
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
