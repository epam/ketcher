import { vi } from 'vitest';
import {
  assert,
  Atom,
  Bond,
  KetMonomerClass,
  KetSerializer,
  MacromoleculesConverter,
  Peptide,
  resetEditorInstance,
  setEditorInstance,
  Struct,
  Vec2,
  type CoreEditor,
} from 'ketcher-core';
import { Subscription } from 'subscription';
import Editor from './Editor';

// A chain of four carbons, optionally wrapped in S-groups
const chainWithSGroups = (sgroups: Array<Record<string, unknown>> = []) =>
  new KetSerializer().deserialize(
    JSON.stringify({
      root: { nodes: [{ $ref: 'mol0' }] },
      mol0: {
        type: 'molecule',
        atoms: [0, 1, 2, 3].map((x) => ({
          label: 'C',
          location: [x, x % 2 ? 0.5 : 0, 0],
        })),
        bonds: [
          { type: 1, atoms: [0, 1] },
          { type: 1, atoms: [1, 2] },
          { type: 1, atoms: [2, 3] },
        ],
        sgroups,
      },
    }),
  );

const dataSGroup = {
  type: 'DAT',
  atoms: [1, 2],
  fieldName: 'name',
  fieldData: 'value',
};

const createEditor = (struct: Struct, selectedAtoms: number[]) => {
  const editor = Object.create(Editor.prototype) as Editor;
  Object.assign(editor, {
    render: {
      ctab: { molecule: struct },
      monomerCreationState: null,
      update: vi.fn(),
    },
    event: { monomerWizardStateChange: new Subscription<boolean>() },
    struct: vi.fn((value?: Struct) => value ?? struct),
    selection: vi.fn(() => ({
      atoms: selectedAtoms,
      bonds: [...struct.bonds.keys()].filter((bondId) => {
        const bond = struct.bonds.get(bondId);
        return (
          bond &&
          selectedAtoms.includes(bond.begin) &&
          selectedAtoms.includes(bond.end)
        );
      }),
    })),
    subscribeToChangeEventInMonomerCreationWizard: vi.fn(),
    selectedToOriginalAtomsIdMap: new Map(),
    historyStack: [],
    historyPtr: 0,
  });
  return editor;
};

const isMonomerCreationEnabled = (editor: Editor): boolean =>
  Reflect.get(Editor.prototype, 'isMonomerCreationWizardEnabled', editor);

describe('Monomer creation from a selection with S-groups (#7637)', () => {
  beforeEach(() => {
    vi.spyOn(globalThis, 'dispatchEvent').mockImplementation(() => true);
    setEditorInstance({} as unknown as CoreEditor);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    resetEditorInstance();
  });

  it.each([
    ['a data S-group', dataSGroup],
    [
      'a contracted abbreviation',
      {
        type: 'SUP',
        atoms: [1, 2, 3],
        name: 'Pr',
        expanded: false,
        attachmentPoints: [{ attachmentAtom: 1 }],
      },
    ],
  ])('enables creation when the selection holds %s whole', (_, sgroup) => {
    const editor = createEditor(chainWithSGroups([sgroup]), [1, 2, 3]);

    expect(isMonomerCreationEnabled(editor)).toBe(true);
  });

  it('keeps creation disabled when an S-group is only partly selected', () => {
    const editor = createEditor(chainWithSGroups([dataSGroup]), [2, 3]);

    expect(isMonomerCreationEnabled(editor)).toBe(false);
  });

  it('keeps creation disabled when the selection holds a monomer', () => {
    const struct = new Struct();
    const monomerStruct = new Struct();
    monomerStruct.atoms.add(new Atom({ label: 'C', pp: new Vec2(0, 0) }));
    monomerStruct.atoms.add(new Atom({ label: 'C', pp: new Vec2(1, 0) }));
    monomerStruct.bonds.add(new Bond({ begin: 0, end: 1, type: 1 }));
    MacromoleculesConverter.convertMonomerToMonomerMicromolecule(
      new Peptide({
        label: 'A',
        props: {
          Name: 'Alanine',
          MonomerName: 'A',
          MonomerFullName: 'Alanine',
          MonomerNaturalAnalogCode: 'A',
          MonomerClass: KetMonomerClass.AminoAcid,
        },
        struct: monomerStruct,
        attachmentPoints: [],
      }),
      struct,
    );
    struct.initHalfBonds();
    struct.initNeighbors();
    const editor = createEditor(struct, [...struct.atoms.keys()]);

    expect(isMonomerCreationEnabled(editor)).toBe(false);
  });

  it('loads only the chemistry of the selected S-groups into the wizard', () => {
    const struct = chainWithSGroups([
      dataSGroup,
      {
        type: 'SUP',
        atoms: [3],
        name: 'Me',
        expanded: false,
        attachmentPoints: [{ attachmentAtom: 3 }],
      },
    ]);
    const editor = createEditor(struct, [0, 1, 2, 3]);

    expect(isMonomerCreationEnabled(editor)).toBe(true);
    editor.openMonomerCreationWizard();

    const wizardStruct = vi
      .mocked(editor.struct)
      .mock.calls.map(([value]) => value)
      .find((value) => value instanceof Struct);
    assert(wizardStruct, 'the wizard was not given a structure');
    expect(wizardStruct.atoms.size).toBe(4);
    expect(wizardStruct.bonds.size).toBe(3);
    expect(wizardStruct.sgroups.size).toBe(0);
    expect(wizardStruct.functionalGroups.size).toBe(0);
    expect(
      [...wizardStruct.atoms.values()].every((atom) => !atom.sgs.size),
    ).toBe(true);
  });
});
