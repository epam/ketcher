import { AtomRenderer } from '../AtomRenderer';
import {
  AtomLabel,
  type CoreAtomLabel,
  type GenericAtomLabel,
} from 'domain/constants';
import { AtomList } from 'domain/entities/atomList';
import type { Atom } from 'domain/entities/CoreAtom';

/**
 * Helper to call a getter on AtomRenderer without going through the
 * full constructor (which requires a live D3/SVG canvas and editor instance).
 * We set `this.atom` directly on the prototype context using a partial mock.
 */
function callGetter<K extends keyof AtomRenderer>(
  getterName: K,
  atom: Pick<Atom, 'label' | 'properties'>,
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

function mockAtom(
  label: CoreAtomLabel,
  properties: Atom['properties'] = {},
): Pick<Atom, 'label' | 'properties'> {
  return { label, properties };
}

describe('AtomRenderer.labelText', () => {
  it('returns the element label for a regular atom', () => {
    expect(callGetter('labelText', mockAtom(AtomLabel.C))).toBe('C');
  });

  it('returns the alias when the atom has an alias', () => {
    expect(
      callGetter('labelText', mockAtom(AtomLabel.C, { alias: 'MyAlias' })),
    ).toBe('MyAlias');
  });

  it('returns bracket notation for an atom-list atom', () => {
    // Elements: C=6, N=7, O=8
    const atomList = new AtomList({ notList: false, ids: [6, 7, 8] });
    expect(
      callGetter('labelText', mockAtom('L#' as GenericAtomLabel, { atomList })),
    ).toBe('[C,N,O]');
  });

  it('returns negated bracket notation for a not-list atom', () => {
    const atomList = new AtomList({ notList: true, ids: [6, 7, 8] });
    expect(
      callGetter('labelText', mockAtom('L#' as GenericAtomLabel, { atomList })),
    ).toBe('![C,N,O]');
  });

  it('returns the generic label string for a generic atom', () => {
    expect(callGetter('labelText', mockAtom('Q' as GenericAtomLabel))).toBe(
      'Q',
    );
  });
});

describe('AtomRenderer.isGenericLabel', () => {
  it('returns false for a regular element atom', () => {
    expect(callGetter('isGenericLabel', mockAtom(AtomLabel.C))).toBe(false);
  });

  it('returns true for all 8 atom generic labels', () => {
    const genericLabels: GenericAtomLabel[] = [
      'A',
      'AH',
      'Q',
      'QH',
      'M',
      'MH',
      'X',
      'XH',
    ];
    for (const label of genericLabels) {
      expect(callGetter('isGenericLabel', mockAtom(label))).toBe(true);
    }
  });

  it('returns false for atom-list marker label', () => {
    expect(
      callGetter('isGenericLabel', mockAtom('L#' as GenericAtomLabel)),
    ).toBe(false);
  });
});
