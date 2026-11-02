/**
 * Browser-safe replacement for Node.js's built-in `assert` module.
 *
 * `ketcher-core` is consumed by bundlers (e.g. Vite) that build for the
 * browser. Importing the Node.js `assert` module directly pulls in a
 * dependency chain (`assert` -> `util` -> `process`) that relies on Node.js
 * globals and crashes with `ReferenceError: process is not defined` unless
 * the consumer manually configures Node polyfills.
 *
 * This function mirrors the subset of Node's `assert(value, message)` API
 * used across the codebase: it throws when `value` is falsy and otherwise
 * acts as a TypeScript assertion function so callers keep type narrowing.
 */
export function assert(value: unknown, message?: string): asserts value {
  if (!value) {
    throw new Error(message ?? 'Assertion failed');
  }
}
