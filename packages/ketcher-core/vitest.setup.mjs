import { vi } from 'vitest';

vi.stubGlobal('ketcher', {});
vi.mock('paper', () => ({}));

// happy-dom defines getBBox on SVGGraphicsElement and returns an empty box.
// Tests stub SVGElement.prototype.getBBox, which happy-dom's method would
// shadow, so remove it and let the stubs apply.
delete globalThis.SVGGraphicsElement.prototype.getBBox;
