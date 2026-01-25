/**
 * @file workspace-provider.tsx
 * @description Provider для ініціалізації Zustand workspace store
 * 
 * Чому окремий Provider:
 * - Гарантує правильну hydration (SSR → Client)
 * - Ініціалізує store один раз при mount
 * - Уникає race conditions
 */

'use client';

import { useEffect, useRef } from 'react';
import { initializeWorkspaceStore } from '@/shared/stores/workspace-store';
import type { Database } from '@/shared/lib/types/database';

type Workspace = Pick<
  Database['public']['Tables']['workspaces']['Row'],
  'id' | 'name' | 'slug'
>;

interface WorkspaceProviderProps {
  children: React.ReactNode;
  initialWorkspaces: Workspace[];
}

/**
 * Provider для ініціалізації workspace store
 * Використовується в root layout
 */
export function WorkspaceProvider({
  children,
  initialWorkspaces,
}: WorkspaceProviderProps) {
  // Використовуємо ref щоб ініціалізувати тільки один раз
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initializeWorkspaceStore(initialWorkspaces);
      initialized.current = true;
    }
  }, [initialWorkspaces]);

  return <>{children}</>;
}
