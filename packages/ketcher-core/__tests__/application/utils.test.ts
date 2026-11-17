import { Atom, Bond, Struct } from 'domain/entities';
import { getSelectionFromStruct } from 'application/editor';
import type { CoreEditor } from 'application/editor';
import {
  provideEditorInstance,
  resetEditorInstance,
  setEditorInstance,
} from 'application/editor/editorSingleton';
import { parseAndAddMacromoleculesOnCanvas } from 'application/utils';
import { EditorHistory } from 'application/editor/EditorHistory';
import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import type { StructService } from 'domain/services';
import type { BaseMonomer } from 'domain/entities/BaseMonomer';
import { ChemicalMimeType } from 'domain/services/struct/structService.types';
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
    resetEditorInstance();
  });

  it('does not replace the canvas when FASTA conversion fails', async () => {
    const drawingEntitiesManager = new DrawingEntitiesManager();
    const existingMonomer = {} as BaseMonomer;
    drawingEntitiesManager.monomers.set(1, existingMonomer);
    const deleteAllEntities = jest.spyOn(
      drawingEntitiesManager,
      'deleteAllEntities',
    );
    setEditorInstance({
      drawingEntitiesManager,
      ensureSequenceModeForLongSequence: jest.fn(),
    } as unknown as CoreEditor);
    const conversionError = new Error('FASTA conversion failed');
    const structService = {
      convert: jest.fn().mockRejectedValue(conversionError),
    } as unknown as StructService;

    await expect(
      parseAndAddMacromoleculesOnCanvas(
        '>sequence\nACGT',
        structService,
        false,
        ChemicalMimeType.DNAFasta,
        true,
      ),
    ).rejects.toBe(conversionError);

    expect(deleteAllEntities).not.toHaveBeenCalled();
    expect(drawingEntitiesManager.monomers.get(1)).toBe(existingMonomer);
  });

  it('reinitializes Sequence mode after adding a long structure', async () => {
    const incomingManager = {
      monomers: new Map(
        Array.from({ length: 3001 }, (_, index) => [index, {}]),
      ),
      mergeInto: jest.fn().mockReturnValue({ command: {} }),
    };
    const mode = {
      modeName: 'sequence-layout-mode',
      initialize: jest.fn(),
    };
    const targetEditor = {
      drawingEntitiesManager: new DrawingEntitiesManager(),
      ensureSequenceModeForLongSequence: jest.fn().mockReturnValue(true),
      isLongSequence: true,
      mode,
      renderersContainer: { update: jest.fn() },
      events: { layoutModeChange: { dispatch: jest.fn() } },
    };
    const activeEditor = {
      drawingEntitiesManager: new DrawingEntitiesManager(),
    } as unknown as CoreEditor;
    jest
      .spyOn(KetSerializer.prototype, 'deserializeToDrawingEntities')
      .mockReturnValue({
        modelChanges: {},
        drawingEntitiesManager: incomingManager,
      } as unknown as ReturnType<
        KetSerializer['deserializeToDrawingEntities']
      >);
    jest.spyOn(EditorHistory, 'getInstance').mockReturnValue({
      update: jest.fn(),
    } as unknown as EditorHistory);
    setEditorInstance(activeEditor);
    const structService = {} as StructService;

    await parseAndAddMacromoleculesOnCanvas(
      '{"root":{"nodes":[]}}',
      structService,
      false,
      undefined,
      false,
      targetEditor as unknown as CoreEditor,
    );

    expect(mode.initialize).toHaveBeenCalledWith(false, false, false);
    expect(provideEditorInstance()).toBe(activeEditor);
  });
});
