// intl-messageformat (a dependency of i18next-icu) ships ESM-only with no
// CJS build, which Jest's CJS test environment cannot require(). This mock
// implements just enough of its API — a constructor plus .format(values) —
// for plain ICU variable interpolation (e.g. "{symbol}"), which is all this
// repo's locale strings currently use. Wired via jest.config.js moduleNameMapper.
class IntlMessageFormatMock {
  constructor(message) {
    this.message = message;
  }

  format(values = {}) {
    return this.message.replace(/{\s*(\w+)\s*}/g, (match, name) =>
      Object.prototype.hasOwnProperty.call(values, name)
        ? String(values[name])
        : match,
    );
  }
}

module.exports = IntlMessageFormatMock;
module.exports.default = IntlMessageFormatMock;
