import { AtomRenderer } from '../AtomRenderer';
import {
  AtomLabel,
  type CoreAtomLabel,
  type GenericAtomLabel,
} from 'domain/constants';
import { AtomList } from 'domain/entities/atomList';
import type { Atom } from 'domain/entities/CoreAtom';
import { provideEditorInstance } from 'application/editor/editorSingleton';
import { Vec2 } from 'domain/entities/vec2';

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

describe('AtomRenderer.atomMappingLabelText', () => {
  it('formats a positive atom mapping number as molecules mode does', () => {
    expect(
      callGetter('atomMappingLabelText', mockAtom(AtomLabel.C, { aam: 7 })),
    ).toBe('.7.');
  });

  it('does not render a label when no atom mapping number is assigned', () => {
    expect(
      callGetter('atomMappingLabelText', mockAtom(AtomLabel.C, { aam: 0 })),
    ).toBeUndefined();
    expect(
      callGetter('atomMappingLabelText', mockAtom(AtomLabel.C)),
    ).toBeUndefined();
  });
});

describe('AtomRenderer atom mapping label placement', () => {
  it('places the mapping label in the largest sector with molecule-mode clearance', () => {
    const method = Object.getOwnPropertyDescriptor(
      AtomRenderer.prototype,
      'getAtomMappingLabelOffset',
    )?.value;
    if (typeof method !== 'function') {
      throw new Error('No method found for getAtomMappingLabelOffset');
    }

    const direction = new Vec2(0, -1);
    const getProjectedLabelDistance = jest.fn().mockReturnValue(12);
    const offset = method.call(
      {
        bisectLargestSector: jest.fn().mockReturnValue(direction),
        getProjectedLabelDistance,
      },
      20,
      10,
    ) as Vec2;

    expect(offset).toEqual(new Vec2(0, -12));
    expect(getProjectedLabelDistance).toHaveBeenCalledWith(20, 10, direction);
  });

  it('renders the mapping label without intercepting atom interactions', () => {
    const method = Object.getOwnPropertyDescriptor(
      AtomRenderer.prototype,
      'appendAtomMappingLabel',
    )?.value;
    if (typeof method !== 'function') {
      throw new Error('No method found for appendAtomMappingLabel');
    }

    const selection = {
      text: jest.fn(),
      attr: jest.fn(),
      node: jest.fn().mockReturnValue({
        getBBox: () => ({ width: 20, height: 10 }),
      }),
    };
    selection.text.mockReturnValue(selection);
    selection.attr.mockReturnValue(selection);

    const append = jest.fn().mockReturnValue(selection);
    const getAtomMappingLabelOffset = jest
      .fn()
      .mockReturnValue(new Vec2(0, -12));

    method.call({
      atomMappingLabelText: '.7.',
      rootElement: { append },
      labelColor: 'black',
      getAtomMappingLabelOffset,
    });

    expect(append).toHaveBeenCalledWith('text');
    expect(selection.text).toHaveBeenCalledWith('.7.');
    expect(selection.attr).toHaveBeenCalledWith('pointer-events', 'none');
    expect(selection.attr).toHaveBeenCalledWith('x', 0);
    expect(selection.attr).toHaveBeenCalledWith('y', -12);
    expect(getAtomMappingLabelOffset).toHaveBeenCalledWith(20, 10);
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
