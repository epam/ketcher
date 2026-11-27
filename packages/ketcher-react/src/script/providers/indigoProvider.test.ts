import { vi } from 'vitest';

import type { StructService } from 'ketcher-core';
import type { IndigoProvider as IndigoProviderClass } from './indigoProvider';

const loadIndigoProvider = async (): Promise<typeof IndigoProviderClass> => {
  vi.resetModules();

  const module = await import('./indigoProvider');

  return module.IndigoProvider;
};

describe('IndigoProvider', () => {
  it('returns undefined before the Indigo service instance is set', async () => {
    const IndigoProvider = await loadIndigoProvider();

    expect(IndigoProvider.getIndigo()).toBeUndefined();
  });

  it('returns the Indigo service instance that was set', async () => {
    const IndigoProvider = await loadIndigoProvider();
    const indigo = {
      info: vi.fn(),
    } as unknown as StructService;

    IndigoProvider.setIndigo(indigo);

    expect(IndigoProvider.getIndigo()).toBe(indigo);
    expect(IndigoProvider.getIndigo()?.info).toBe(indigo.info);
  });
});
