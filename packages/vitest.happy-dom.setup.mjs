// Shared by every package whose Vitest environment is happy-dom. It undoes the
// places where happy-dom differs from the DOM the tests were written against.

// happy-dom defines getBBox on SVGGraphicsElement and returns an empty box.
// Tests stub SVGElement.prototype.getBBox, which happy-dom's method would
// shadow, so remove it and let the stubs apply.
delete globalThis.SVGGraphicsElement.prototype.getBBox;

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
globalThis.MutationObserver = CaseSensitiveMutationObserver;
