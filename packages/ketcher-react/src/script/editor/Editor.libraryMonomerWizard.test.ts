import {
  Atom,
  Bond,
  KetMonomerClass,
  MonomerItemType,
  Struct,
} from 'ketcher-core';
import Editor from './Editor';

describe('opening library monomers in the wizard', () => {
  const makeItem = (): MonomerItemType => {
    const struct = new Struct();
    struct.atoms.set(4, new Atom({ label: 'C' }));
    struct.atoms.set(8, new Atom({ label: 'O' }));
    struct.bonds.add(new Bond({ begin: 4, end: 8, type: 1 }));
    return {
      label: 'A',
      struct,
      props: {
        id: 'original',
        Name: 'Alanine',
        MonomerName: 'A',
        MonomerNaturalAnalogCode: 'A',
        MonomerClass: KetMonomerClass.AminoAcid,
        modificationTypes: ['Natural amino acid'],
      },
      attachmentPoints: [
        { attachmentAtom: 4, leavingGroup: { atoms: [8] }, label: 'R1' },
      ],
    };
  };

  const makeEditor = () => {
    const originalStruct = new Struct();
    const editor = Object.create(Editor.prototype) as Editor;
    Object.assign(editor, {
      render: {
        ctab: { molecule: originalStruct },
        monomerCreationState: null,
      },
      event: { monomerWizardStateChange: { dispatch: jest.fn() } },
      struct: jest.fn((value?: Struct) => {
        if (value) editor.render.ctab.molecule = value;
        return editor.render.ctab.molecule;
      }),
      openMonomerCreationWizard: jest.fn(() => {
        editor.render.monomerCreationState = {
          assignedAttachmentPoints: new Map(),
          problematicAttachmentPoints: new Set(),
          potentialAttachmentPoints: new Map(),
          attachmentAtomIdsWithExternalBonds: new Map(),
        };
      }),
    });
    return { editor, originalStruct };
  };

  it.each(['library', 'duplicate'] as const)(
    'loads %s into an isolated structure with remapped attachment points',
    (mode) => {
      const { editor, originalStruct } = makeEditor();
      const item = makeItem();

      editor.openLibraryMonomerCreationWizard(item, mode);

      expect(editor.openMonomerCreationWizard).toHaveBeenCalledWith(
        { atoms: [0, 1], bonds: [0] },
        expect.objectContaining({
          symbol: mode === 'library' ? 'A' : 'A_Copy',
          libraryOnly: true,
          ...(mode === 'library' ? { originalMonomerItem: item } : {}),
        }),
        [
          expect.objectContaining({
            atomId: 0,
            leaveAtomId: 1,
            attachmentPointNumber: 1,
          }),
        ],
        expect.anything(),
      );
      expect(Reflect.get(editor, 'originalStruct')).toBe(originalStruct);
      expect(
        editor.monomerCreationState?.attachmentAtomIdsWithExternalBonds,
      ).toBeUndefined();
      expect(Array.from(item.struct.atoms.keys())).toEqual([4, 8]);
      expect(editor.struct()).not.toBe(item.struct);
    },
  );

  it('refuses unresolved entries without changing the structure', () => {
    const { editor, originalStruct } = makeEditor();
    const item = makeItem();
    item.props.unresolved = true;
    expect(() =>
      editor.openLibraryMonomerCreationWizard(item, 'library'),
    ).toThrow('no editable structure');
    expect(editor.struct()).toBe(originalStruct);
    expect(editor.openMonomerCreationWizard).not.toHaveBeenCalled();
  });
});
