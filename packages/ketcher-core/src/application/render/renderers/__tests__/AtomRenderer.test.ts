import { select } from 'd3';
import { AtomRenderer } from '../AtomRenderer';
import {
  AtomLabel,
  type CoreAtomLabel,
  type GenericAtomLabel,
} from 'domain/constants';
import { AtomList } from 'domain/entities/atomList';
import { type Atom, AtomRadical } from 'domain/entities/CoreAtom';
import { provideEditorInstance } from 'application/editor/editorSingleton';

// The singleton needs a live canvas; isLabelVisible only reads its viewModel.
jest.mock('application/editor/editorSingleton', () => ({
  provideEditorInstance: jest.fn(),
}));

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

describe('AtomRenderer.isLabelVisible', () => {
  const getIsLabelVisible = (atom: object, neighborCount: number) => {
    const halfEdges = Array.from({ length: neighborCount }, (_, index) => ({
      direction: { x: Math.cos(index), y: Math.sin(index) },
    }));
    (provideEditorInstance as jest.Mock).mockReturnValue({
      viewModel: { atomsToHalfEdges: new Map([[atom, halfEdges]]) },
    });
    const descriptor = Object.getOwnPropertyDescriptor(
      AtomRenderer.prototype,
      'isLabelVisible',
    );
    if (!descriptor?.get) {
      throw new Error('No getter found for isLabelVisible');
    }
    return descriptor.get.call({
      atom,
      isAtomTerminal: neighborCount <= 1,
    });
  };

  const plainCarbon = {
    label: AtomLabel.C,
    hasCharge: false,
    hasRadical: false,
    hasAlias: false,
    hasExplicitValence: false,
    hasExplicitIsotope: false,
  };

  it('hides the label of a carbon with several bonds and a good valence', () => {
    expect(getIsLabelVisible({ ...plainCarbon, hasBadValence: false }, 3)).toBe(
      false,
    );
  });

  it('shows the label of a carbon with a bad valence', () => {
    expect(getIsLabelVisible({ ...plainCarbon, hasBadValence: true }, 6)).toBe(
      true,
    );
  });
});

describe('AtomRenderer.appendRadical', () => {
  const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

  // Draws the radical into a real SVG group, as if the element letter of the
  // label was laid out at the given box
  const drawRadical = (
    radical: AtomRadical,
    elementLabelBBox?: Pick<DOMRect, 'x' | 'width'>,
  ) => {
    const rootNode = document.createElementNS(SVG_NAMESPACE, 'g');
    const appendRadical = Reflect.get(AtomRenderer.prototype, 'appendRadical');

    appendRadical.call({
      atom: { hasRadical: true, properties: { radical } },
      labelColor: '#000',
      rootElement: select(rootNode),
      elementLabelElement: elementLabelBBox && {
        node: () => ({ getBBox: () => elementLabelBBox }),
      },
    });

    return rootNode;
  };

  const getDotPositions = (rootNode: SVGElement) =>
    [...rootNode.querySelectorAll('circle')].map((dot) =>
      Number(dot.getAttribute('cx')),
    );

  it('centers a singlet over the element letter when an isotope shifts it', () => {
    const rootNode = drawRadical(AtomRadical.Single, { x: 11, width: 10 });

    expect(getDotPositions(rootNode)).toEqual([19, 13]);
  });

  it('centers a doublet over the element letter', () => {
    const rootNode = drawRadical(AtomRadical.Doublet, { x: 11, width: 10 });

    expect(getDotPositions(rootNode)).toEqual([16]);
  });

  it('centers a triplet over the element letter', () => {
    const rootNode = drawRadical(AtomRadical.Triplet, { x: 11, width: 10 });

    expect(rootNode.querySelector('path')?.getAttribute('d')).toBe(
      'M 16 -5 L 18 -10 L 20 -5 M 10 -5 L 12 -10 L 14 -5',
    );
  });

  it('keeps the radical on the atom point when there is no element letter', () => {
    const rootNode = drawRadical(AtomRadical.Doublet);

    expect(getDotPositions(rootNode)).toEqual([0]);
  });
});
