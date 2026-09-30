import { vi } from 'vitest';

vi.stubGlobal('ketcher', {});
vi.mock('paper', () => ({}));
