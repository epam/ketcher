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

describe('AtomRenderer isotope and radical layout (#12616)', () => {
  const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

  // The element letter moves from `before` to `after` once the isotope is put
  // in front of it, as the browser lays the label out
  const appendIsotope = (
    elementLetterBoxes: Array<Pick<DOMRect, 'x' | 'width'>>,
    labelX: number,
  ) => {
    const textNode = document.createElementNS(SVG_NAMESPACE, 'text');
    textNode.setAttribute('x', String(labelX));
    const getBBox = jest.fn();
    elementLetterBoxes.forEach((box) => getBBox.mockReturnValueOnce(box));
    const appendExplicitIsotope = Reflect.get(
      AtomRenderer.prototype,
      'appendExplicitIsotope',
    );
    const getElementLabelCenterX = Reflect.get(
      AtomRenderer.prototype,
      'getElementLabelCenterX',
    );
    const renderer = {
      atom: { hasExplicitIsotope: true, properties: { isotope: 14 } },
      labelColor: '#000',
      textElement: select(textNode),
      elementLabelElement: { node: () => ({ getBBox }) },
      getElementLabelCenterX,
    };

    appendExplicitIsotope.call(renderer);

    return textNode;
  };

  it('keeps the element letter on the atom point when an isotope is added', () => {
    // the isotope pushed the letter 8 px to the right
    const textNode = appendIsotope(
      [
        { x: -5, width: 9 },
        { x: 3, width: 9 },
      ],
      -5,
    );

    expect(textNode.getAttribute('x')).toBe('-13');
    expect(textNode.firstElementChild?.textContent).toBe('14');
  });

  it('keeps the label where it is when the letter is not moved', () => {
    const textNode = appendIsotope(
      [
        { x: -4, width: 9 },
        { x: -4, width: 9 },
      ],
      5,
    );

    expect(textNode.getAttribute('x')).toBe('5');
  });

  it('draws the radical at the atom point, above the element letter', () => {
    const rootNode = document.createElementNS(SVG_NAMESPACE, 'g');
    const appendRadical = Reflect.get(AtomRenderer.prototype, 'appendRadical');

    appendRadical.call({
      atom: { hasRadical: true, properties: { radical: AtomRadical.Single } },
      labelColor: '#000',
      rootElement: select(rootNode),
    });

    expect(
      [...rootNode.querySelectorAll('circle')].map((dot) =>
        Number(dot.getAttribute('cx')),
      ),
    ).toEqual([3, -3]);
  });
});
