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
// never matches (the DOM spec compares names case-sensitively). Each observed
// target gets its own happy-dom observer without the filter, and its records
// are filtered here.
const HappyDomMutationObserver = globalThis.MutationObserver;
class CaseSensitiveMutationObserver {
  #callback;
  #registrations = new Map();

  constructor(callback) {
    this.#callback = callback;
  }

  observe(target, options = {}) {
    this.#registrations.get(target)?.observer.disconnect();
    const { attributeFilter, ...rest } = options;
    const names = attributeFilter && new Set(attributeFilter);
    const keep = (records) =>
      names
        ? records.filter(
            (record) =>
              record.type !== 'attributes' || names.has(record.attributeName),
          )
        : records;
    const observer = new HappyDomMutationObserver((records) => {
      const kept = keep(records);
      if (kept.length > 0) this.#callback(kept, this);
    });
    observer.observe(target, names ? { ...rest, attributes: true } : options);
    this.#registrations.set(target, { observer, keep });
  }

  disconnect() {
    this.#registrations.forEach(({ observer }) => observer.disconnect());
    this.#registrations.clear();
  }

  takeRecords() {
    return [...this.#registrations.values()].flatMap(({ observer, keep }) =>
      keep(observer.takeRecords()),
    );
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
