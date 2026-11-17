import { createRequire } from 'node:module';
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

vi.mock('paper', () => ({ default: {} }));

// Tests run against ketcher-core's ES build. That build turns the
// `typeof require` guard of raphael-ext.ts into `typeof __require`, a marker
// Rolldown emits for CommonJS detection and never defines in ES output. Node
// has no `__require` either, so Raphaël would stay undefined and every Render
// construction would throw. Vitest does provide a real `require`, so declare
// the marker and let the ES build take that branch, as the CommonJS build does.
vi.stubGlobal('__require', createRequire(import.meta.url));

vi.stubGlobal(
  'ResizeObserver',
  vi.fn(function () {
    return {
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    };
  }),
);
