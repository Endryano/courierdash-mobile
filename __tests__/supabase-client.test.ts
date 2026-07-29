import { afterEach, describe, expect, jest, test } from '@jest/globals';

describe('Supabase client module', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    Object.defineProperty(global, 'fetch', { configurable: true, value: originalFetch });
    jest.resetModules();
  });

  test('creates the exported singleton without a network request', () => {
    jest.resetModules();
    jest.doMock('@react-native-async-storage/async-storage', () =>
      require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
    );
    jest.doMock('@/config/environment', () => ({
      getSupabaseEnvironment: () => ({
        supabaseUrl: 'https://example.supabase.co',
        supabaseAnonKey: 'test-public-key',
      }),
    }));

    const fetchMock = jest.fn();
    Object.defineProperty(global, 'fetch', { configurable: true, value: fetchMock });

    let clientModule: typeof import('@/lib/supabase/client') | undefined;
    jest.isolateModules(() => {
      clientModule = require('@/lib/supabase/client') as typeof import('@/lib/supabase/client');
    });

    expect(clientModule?.supabase).toBeDefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
