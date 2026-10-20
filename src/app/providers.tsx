'use client';

import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../queryClient';
import { Layout } from '../shared/Layout/Layout';
import { SessionExpiredListener } from '../shared/SessionExpiredListener/SessionExpiredListener';
import { TranslationProvider } from '../i18n/TranslationProvider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <TranslationProvider>
      <QueryClientProvider client={queryClient}>
        <SessionExpiredListener />
        <Layout>{children}</Layout>
      </QueryClientProvider>
    </TranslationProvider>
  );
}
