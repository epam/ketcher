import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

vi.mock('paper', () => ({ default: {} }));

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
