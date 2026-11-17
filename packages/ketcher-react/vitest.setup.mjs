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

// happy-dom lowercases `attributeFilter` names but compares them with the
// attribute name as written, so a camelCase SVG attribute such as `viewBox`
// never matches (the DOM spec compares names case-sensitively). Observe
// without the filter and apply it to the records instead.
const HappyDomMutationObserver = globalThis.MutationObserver;
class CaseSensitiveMutationObserver extends HappyDomMutationObserver {
  #filters = new Map();

  constructor(callback) {
    super((records, observer) => {
      const kept = records.filter(
        (record) => record.type !== 'attributes' || this.#accepts(record),
      );
      if (kept.length > 0) callback(kept, observer);
    });
  }

  observe(target, options = {}) {
    const { attributeFilter, ...rest } = options;
    if (attributeFilter) {
      this.#filters.set(target, new Set(attributeFilter));
      super.observe(target, { ...rest, attributes: true });
    } else {
      this.#filters.set(target, null);
      super.observe(target, options);
    }
  }

  disconnect() {
    this.#filters.clear();
    super.disconnect();
  }

  // The nearest observed target decides, as each target has its own options.
  #accepts(record) {
    for (let node = record.target; node; node = node.parentNode) {
      if (this.#filters.has(node)) {
        const names = this.#filters.get(node);
        return !names || names.has(record.attributeName);
      }
    }
    return true;
  }
}
vi.stubGlobal('MutationObserver', CaseSensitiveMutationObserver);

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
