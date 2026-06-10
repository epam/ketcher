import { Bond } from 'ketcher-core';
import Editor from './Editor';

type MockBond = {
  begin: number;
  end: number;
  hb1: number;
  hb2: number;
  type: number;
  stereo: number;
};

type MockAtom = {
  sgs: Set<number>;
  attachmentPoints: null;
  rglabel: number | null;
  neighbors: number[];
  label: string;
  fragment: number;
};

const getIsMonomerCreationWizardEnabled = (editor: Editor): boolean => {
  return Reflect.get(
    Editor.prototype,
    'isMonomerCreationWizardEnabled',
    editor,
  ) as boolean;
};

const createMockEditorForRGroupBond = (bondStereo: number) => {
  const atomMap = new Map<number, MockAtom>([
    [
      0,
      {
        sgs: new Set(),
        attachmentPoints: null,
        rglabel: 1,
        neighbors: [10],
        label: 'R#',
        fragment: 0,
      },
    ],
    [
      1,
      {
        sgs: new Set(),
        attachmentPoints: null,
        rglabel: null,
        neighbors: [20],
        label: 'C',
        fragment: 0,
      },
    ],
  ]);

  const bondMap = new Map<number, MockBond>([
    [
      0,
      {
        begin: 0,
        end: 1,
        hb1: 10,
        hb2: 20,
        type: Bond.PATTERN.TYPE.SINGLE,
        stereo: bondStereo,
      },
    ],
  ]);

  const currentStruct = {
    atoms: {
      get: (atomId: number) => atomMap.get(atomId),
      keys: () => atomMap.keys(),
    },
    bonds: {
      filter: (
        predicate: (bondId: number, bond: MockBond) => boolean,
      ): MockBond[] =>
        Array.from(bondMap.entries())
          .filter(([bondId, bond]) => predicate(bondId, bond))
          .map(([, bond]) => bond),
      find: (predicate: (bondId: number, bond: MockBond) => boolean) => {
        for (const [bondId, bond] of bondMap.entries()) {
          if (predicate(bondId, bond)) {
            return bondId;
          }
        }

        return null;
      },
      get: (bondId: number) => bondMap.get(bondId),
    },
    rgroups: [] as Array<{ frags: Set<number> }>,
  };

  return {
    terminalRGroupAtoms: [],
    potentialLeavingAtomsForAutoAssignment: [],
    potentialLeavingAtomsForManualAssignment: [],
    isMonomerCreationWizardActive: false,
    struct: () => currentStruct,
    selection: () => ({ atoms: [0, 1] }),
  } as unknown as Editor;
};

describe('Editor.isMonomerCreationWizardEnabled', () => {
  beforeEach(() => {
    jest.spyOn(window, 'dispatchEvent').mockImplementation(() => true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('disables monomer creation for explicit R-group with non-compliant bond stereo', () => {
    const editor = createMockEditorForRGroupBond(Bond.PATTERN.STEREO.EITHER);

    const isEnabled = getIsMonomerCreationWizardEnabled(editor);

    expect(isEnabled).toBe(false);
  });

  it('keeps monomer creation enabled for explicit R-group with allowed bond stereo', () => {
    const editor = createMockEditorForRGroupBond(Bond.PATTERN.STEREO.UP);

    const isEnabled = getIsMonomerCreationWizardEnabled(editor);

    expect(isEnabled).toBe(true);
  });
});
