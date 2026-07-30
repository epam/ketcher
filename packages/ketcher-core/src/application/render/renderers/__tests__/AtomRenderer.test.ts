import { AtomRenderer } from '../AtomRenderer';
import { AtomLabel } from 'domain/constants';
import { AtomList } from 'domain/entities/atomList';

/**
 * Helper to call a getter on AtomRenderer without going through the
 * full constructor (which requires a live D3/SVG canvas and editor instance).
 * We set `this.atom` directly on the prototype context.
 */
function callGetter<K extends keyof AtomRenderer>(
  getterName: K,
  atom: Partial<AtomRenderer['atom']>,
): AtomRenderer[K] {
  const descriptor = Object.getOwnPropertyDescriptor(
    AtomRenderer.prototype,
    getterName,
  );
  if (!descriptor?.get) {
    throw new Error(`No getter found for ${String(getterName)}`);
  }
  // Call the getter with a context whose `atom` property is the mock atom
  return descriptor.get.call({ atom }) as AtomRenderer[K];
}

describe('AtomRenderer.labelText', () => {
  it('returns the element label for a regular atom', () => {
    const atom = {
      properties: {},
      label: AtomLabel.C,
    };
    expect(callGetter('labelText', atom as any)).toBe('C');
  });

  it('returns the alias when the atom has an alias', () => {
    const atom = {
      properties: { alias: 'MyAlias' },
      label: AtomLabel.C,
    };
    expect(callGetter('labelText', atom as any)).toBe('MyAlias');
  });

  it('returns bracket notation for an atom-list atom', () => {
    // Elements: C=6, N=7, O=8
    const atomList = new AtomList({ notList: false, ids: [6, 7, 8] });
    const atom = {
      properties: { atomList },
      label: AtomLabel.LHash,
    };
    expect(callGetter('labelText', atom as any)).toBe('[C,N,O]');
  });

  it('returns negated bracket notation for a not-list atom', () => {
    const atomList = new AtomList({ notList: true, ids: [6, 7, 8] });
    const atom = {
      properties: { atomList },
      label: AtomLabel.LHash,
    };
    expect(callGetter('labelText', atom as any)).toBe('![C,N,O]');
  });

  it('returns the generic label string for a generic atom', () => {
    const atom = {
      properties: {},
      label: AtomLabel.Q,
    };
    expect(callGetter('labelText', atom as any)).toBe('Q');
  });
});

describe('AtomRenderer.isGenericLabel', () => {
  it('returns false for a regular element atom', () => {
    const atom = { label: AtomLabel.C, properties: {} };
    expect(callGetter('isGenericLabel', atom as any)).toBe(false);
  });

  it('returns true for a generic atom label', () => {
    for (const label of [
      AtomLabel.A,
      AtomLabel.AH,
      AtomLabel.Q,
      AtomLabel.QH,
      AtomLabel.M,
      AtomLabel.MH,
      AtomLabel.X,
      AtomLabel.XH,
    ]) {
      const atom = { label, properties: {} };
      expect(callGetter('isGenericLabel', atom as any)).toBe(true);
    }
  });

  it('returns false for atom-list marker label', () => {
    const atom = { label: AtomLabel.LHash, properties: {} };
    expect(callGetter('isGenericLabel', atom as any)).toBe(false);
  });
});
