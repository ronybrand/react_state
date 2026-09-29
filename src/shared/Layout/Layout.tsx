'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Footer } from '../Footer/Footer';
import { Icon } from '../Icon/Icon';
import { authService } from '../../services/authService';
import { isTokenValid } from '../../lib/tokenStorage';

// Vite original wrapped react-router's <Outlet/> - Next's App Router has no
// nested-route outlet, so this now takes `children` and is rendered from
// app/layout.tsx around {children} directly.
export function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();

  function handleLogout() {
    authService.logout();
    router.push('/login');
  }

  return (
    <div className="flex min-h-screen flex-col">
      <nav className="bg-brand flex items-center justify-between px-4 py-3">
        <Link href="/" className="font-display text-lg font-semibold text-white">
          State CRUD - React/Java
        </Link>
        {isTokenValid() && (
          <button
            type="button"
            aria-label="Sair"
            title="Sair"
            className="cursor-pointer text-white"
            onClick={handleLogout}
          >
            <Icon name="box-arrow-right" />
          </button>
        )}
      </nav>
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
