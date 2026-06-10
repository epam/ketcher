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

type MockHalfBond = {
  bid: number;
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

const getTerminalRGroupAtoms = (editor: Editor) => {
  return Reflect.get(editor, 'terminalRGroupAtoms');
};

const createMockEditorForRGroupBond = (
  bondType: number = Bond.PATTERN.TYPE.SINGLE,
  bondStereo: number = Bond.PATTERN.STEREO.NONE,
  terminalRGroupNeighborHalfBondId = 10,
  selectionAtoms: number[] | null = [0, 1],
) => {
  const atomMap = new Map<number, MockAtom>([
    [
      0,
      {
        sgs: new Set(),
        attachmentPoints: null,
        rglabel: 1,
        neighbors: [terminalRGroupNeighborHalfBondId],
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
        type: bondType,
        stereo: bondStereo,
      },
    ],
  ]);

  const halfBondMap = new Map<number, MockHalfBond>([
    [10, { bid: 0 }],
    [20, { bid: 0 }],
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
    halfBonds: {
      get: (halfBondId: number) => halfBondMap.get(halfBondId),
    },
    rgroups: {
      some: () => false,
    },
  };

  const editor = {
    terminalRGroupAtoms: [] as number[],
    potentialLeavingAtomsForAutoAssignment: [],
    potentialLeavingAtomsForManualAssignment: [],
    isMonomerCreationWizardActive: false,
    struct: () => currentStruct,
    selection: () =>
      selectionAtoms === null ? null : { atoms: [...selectionAtoms] },
  } as unknown as Editor;

  return editor;
};

describe('Editor.isMonomerCreationWizardEnabled', () => {
  beforeEach(() => {
    jest.spyOn(window, 'dispatchEvent').mockImplementation(() => true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('disables monomer creation for explicit R-group with non-compliant bond stereo', () => {
    const editor = createMockEditorForRGroupBond(
      Bond.PATTERN.TYPE.SINGLE,
      Bond.PATTERN.STEREO.EITHER,
    );

    const isEnabled = getIsMonomerCreationWizardEnabled(editor);

    expect(isEnabled).toBe(false);
    expect(getTerminalRGroupAtoms(editor).length).toBe(0);
  });

  it('disables monomer creation for explicit R-group with non-SINGLE bond type', () => {
    const editor = createMockEditorForRGroupBond(
      Bond.PATTERN.TYPE.DOUBLE,
      Bond.PATTERN.STEREO.NONE,
    );

    const isEnabled = getIsMonomerCreationWizardEnabled(editor);

    expect(isEnabled).toBe(false);
    expect(getTerminalRGroupAtoms(editor).length).toBe(0);
  });

  it('keeps monomer creation enabled for explicit R-group with allowed bond stereo', () => {
    const editor = createMockEditorForRGroupBond(
      Bond.PATTERN.TYPE.SINGLE,
      Bond.PATTERN.STEREO.UP,
    );

    const isEnabled = getIsMonomerCreationWizardEnabled(editor);

    expect(isEnabled).toBe(true);
    const terminalRGroupAtoms = getTerminalRGroupAtoms(editor);
    expect(terminalRGroupAtoms.length).toBe(1);
    expect(terminalRGroupAtoms[0][0]).toBe(0);
  });

  it.each([Bond.PATTERN.STEREO.NONE, Bond.PATTERN.STEREO.DOWN])(
    'keeps monomer creation enabled for explicit R-group with allowed bond stereo %s',
    (allowedStereo) => {
      const editor = createMockEditorForRGroupBond(
        Bond.PATTERN.TYPE.SINGLE,
        allowedStereo,
      );

      const isEnabled = getIsMonomerCreationWizardEnabled(editor);

      expect(isEnabled).toBe(true);
      const terminalRGroupAtoms = getTerminalRGroupAtoms(editor);
      expect(terminalRGroupAtoms.length).toBe(1);
      expect(terminalRGroupAtoms[0][0]).toBe(0);
    },
  );

  it('disables monomer creation for terminal R-group atom without matching bond', () => {
    const editor = createMockEditorForRGroupBond(
      Bond.PATTERN.TYPE.SINGLE,
      Bond.PATTERN.STEREO.NONE,
      999,
    );

    const isEnabled = getIsMonomerCreationWizardEnabled(editor);

    expect(isEnabled).toBe(false);
    expect(getTerminalRGroupAtoms(editor).length).toBe(0);
  });

  it('uses whole-structure atoms when selection is null', () => {
    const editor = createMockEditorForRGroupBond(
      Bond.PATTERN.TYPE.SINGLE,
      Bond.PATTERN.STEREO.NONE,
      10,
      null,
    );

    const isEnabled = getIsMonomerCreationWizardEnabled(editor);

    expect(isEnabled).toBe(true);
    const terminalRGroupAtoms = getTerminalRGroupAtoms(editor);
    expect(terminalRGroupAtoms.length).toBe(1);
    expect(terminalRGroupAtoms[0][0]).toBe(0);
  });
});
