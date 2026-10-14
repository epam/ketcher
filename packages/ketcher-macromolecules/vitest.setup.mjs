import { vi } from 'vitest';

vi.mock('paper', () => ({}));

await import('./src/setupTests.tsx');
