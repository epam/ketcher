/**
 * Maps an object type to a structurally identical type with all `readonly`
 * modifiers removed.
 *
 * Used to assign a `static readonly` field that must be wired from outside the
 * declaring class — e.g. an operation's inverse constructor, which is set in a
 * separate module to avoid a circular dependency between the paired classes.
 */
export type Writable<T> = { -readonly [P in keyof T]: T[P] };
