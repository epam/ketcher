import { Atom, Bond, Struct } from 'domain/entities';
import { getSelectionFromStruct } from 'application/editor';
import { parseAndAddMacromoleculesOnCanvas } from 'application/utils';
import { ChemicalMimeType, StructService } from 'domain/services';
import * as editorSingleton from 'application/editor/editorSingleton';
import { EditorHistory } from 'application/editor/internal';
import { KetSerializer } from 'domain/serializers';

describe('getSelectionFromStruct', () => {
  it('should return empty selection for struct without selected items', () => {
    const struct = new Struct();
    const atomId = struct.atoms.add(
      new Atom({ label: 'C', pp: { x: 0, y: 0, z: 0 } }),
    );
    const atomId2 = struct.atoms.add(
      new Atom({ label: 'C', pp: { x: 1, y: 0, z: 0 } }),
    );
    struct.bonds.add(new Bond({ begin: atomId, end: atomId2, type: 1 }));

    const selection = getSelectionFromStruct(struct);

    expect(selection).toEqual({});
  });

  it('should return selection with selected atoms', () => {
    const struct = new Struct();
    const atom1 = new Atom({ label: 'C', pp: { x: 0, y: 0, z: 0 } });
    atom1.setInitiallySelected(true);
    const atomId1 = struct.atoms.add(atom1);

    const atom2 = new Atom({ label: 'C', pp: { x: 1, y: 0, z: 0 } });
    struct.atoms.add(atom2);

    const selection = getSelectionFromStruct(struct);

    expect(selection.atoms).toEqual([atomId1]);
    expect(selection.bonds).toBeUndefined();
  });

  it('should return selection with selected bonds', () => {
    const struct = new Struct();
    const atomId1 = struct.atoms.add(
      new Atom({ label: 'C', pp: { x: 0, y: 0, z: 0 } }),
    );
    const atomId2 = struct.atoms.add(
      new Atom({ label: 'C', pp: { x: 1, y: 0, z: 0 } }),
    );

    const bond = new Bond({ begin: atomId1, end: atomId2, type: 1 });
    bond.setInitiallySelected(true);
    const bondId = struct.bonds.add(bond);

    const selection = getSelectionFromStruct(struct);

    expect(selection.bonds).toEqual([bondId]);
    expect(selection.atoms).toBeUndefined();
  });

  it('should return selection with both selected atoms and bonds', () => {
    const struct = new Struct();

    const atom1 = new Atom({ label: 'C', pp: { x: 0, y: 0, z: 0 } });
    atom1.setInitiallySelected(true);
    const atomId1 = struct.atoms.add(atom1);

    const atom2 = new Atom({ label: 'C', pp: { x: 1, y: 0, z: 0 } });
    atom2.setInitiallySelected(true);
    const atomId2 = struct.atoms.add(atom2);

    const bond = new Bond({ begin: atomId1, end: atomId2, type: 1 });
    bond.setInitiallySelected(true);
    const bondId = struct.bonds.add(bond);

    const selection = getSelectionFromStruct(struct);

    expect(selection.atoms).toEqual([atomId1, atomId2]);
    expect(selection.bonds).toEqual([bondId]);
  });
});

describe('parseAndAddMacromoleculesOnCanvas', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should convert IDT input to KET with explicit input format', async () => {
    const idt = 'A*C*G*C*G*C*G*A*C*T*A*T*A*C*G*C*G*C*C*T';
    const modelChanges = { operations: [] };
    const mergeInto = jest.fn(() => ({ command: modelChanges }));
    const historyUpdate = jest.fn();
    const renderersUpdate = jest.fn();
    const editor = {
      drawingEntitiesManager: {},
      renderersContainer: { update: renderersUpdate },
    };
    const structService = {
      convert: jest.fn().mockResolvedValue({
        struct: '{"root":{"nodes":[]}}',
        format: ChemicalMimeType.KET,
      }),
    } as unknown as StructService;

    jest
      .spyOn(editorSingleton, 'provideEditorInstance')
      .mockReturnValue(
        editor as unknown as ReturnType<
          typeof editorSingleton.provideEditorInstance
        >,
      );
    jest.spyOn(EditorHistory, 'getInstance').mockReturnValue({
      update: historyUpdate,
    } as unknown as EditorHistory);
    jest
      .spyOn(KetSerializer.prototype, 'deserializeToDrawingEntities')
      .mockReturnValue({
        drawingEntitiesManager: { mergeInto },
      } as unknown as ReturnType<KetSerializer['deserializeToDrawingEntities']>);

    await parseAndAddMacromoleculesOnCanvas(idt, structService);

    expect(structService.convert).toHaveBeenCalledWith({
      struct: idt,
      output_format: ChemicalMimeType.KET,
      input_format: ChemicalMimeType.IDT,
    });
    expect(mergeInto).toHaveBeenCalledWith(editor.drawingEntitiesManager);
    expect(historyUpdate).toHaveBeenCalledWith(modelChanges, false);
    expect(renderersUpdate).toHaveBeenCalledWith(modelChanges);
  });
});
