'use client';

import type { ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { Footer } from '@/shared/Footer/Footer';
import { Icon } from '@/shared/Icon/Icon';
import { authService } from '@/services/authService';
import { useTokenValid } from '@/hooks/useTokenValid';

// Vite original wrapped react-router's <Outlet/> - Next's App Router has no
// nested-route outlet, so this now takes `children` and is rendered from
// app/layout.tsx around {children} directly.
export function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations();
  // Hydration-safe (see useTokenValid): the logout button only appears once
  // the client knows the token state, never in the server HTML.
  const loggedIn = useTokenValid() === true;

  function handleLogout() {
    authService.logout();
    router.push('/login');
  }

  return (
    <div className="flex min-h-screen flex-col">
      <nav className="bg-brand flex items-center justify-between px-4 py-3">
        <Link href="/" className="font-display text-lg font-semibold text-white">
          {t('appTitle')}
        </Link>
        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label={t('languageSwitchLabel')}
            title={t('languageSwitchLabel')}
            className="cursor-pointer text-sm font-semibold text-white"
            onClick={() => router.replace(pathname, { locale: locale === 'pt' ? 'en' : 'pt' })}
          >
            {locale === 'pt' ? 'EN' : 'PT'}
          </button>
          {loggedIn && (
            <button
              type="button"
              aria-label={t('logoutLabel')}
              title={t('logoutLabel')}
              className="cursor-pointer text-white"
              onClick={handleLogout}
            >
              <Icon name="box-arrow-right" />
            </button>
          )}
        </div>
      </nav>
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
