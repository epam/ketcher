import { CoreEditor, FlexMode } from 'application/editor';
import { EditorHistory } from 'application/editor/EditorHistory';
import { MACROMOLECULES_BOND_TYPES } from 'application/editor/tools/types';
import { Struct, Vec2 } from 'domain/entities';
import { AttachmentPointName } from 'domain/types';
import { KetSerializer } from 'domain/serializers/ket';
import { KetMonomerClass } from 'domain/constants/monomers';
import { Nucleotide } from 'domain/entities/Nucleotide';
import { MacromoleculesConverter } from 'application/editor/MacromoleculesConverter';
import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import { replaceMonomer } from 'domain/entities/DrawingEntitiesManager.replaceMonomer';
import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import { KetAmbiguousMonomerTemplateSubType } from 'application/formatters/types/ket';
import { AmbiguousMonomer } from 'domain/entities/AmbiguousMonomer';
import { ServerFormatter } from 'application/formatters/serverFormatter';
import { SupportedFormat } from 'application/formatters/structFormatter.types';
import { ChemicalMimeType, type StructService } from 'domain/services';
import { mock } from 'jest-mock-extended';
import { coreEditorTheme, polymerEditorTheme } from '../../mock-data';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../helpers/dom';

globalThis.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

SVGElement.prototype.getBBox = jest
  .fn()
  .mockReturnValue({ x: 0, y: 0, width: 12, height: 12 });

describe('imported sequence IDs', () => {
  let editor: CoreEditor;
  const serializer = new KetSerializer();

  beforeEach(() => {
    const theme = {
      ...polymerEditorTheme,
      monomer: {
        color: {
          ...polymerEditorTheme.monomer.color,
          R: { regular: 'yellow' },
          P: { regular: 'yellow' },
        },
      },
    };
    editor = new CoreEditor({
      canvas: createPolymerEditorCanvas(),
      theme: coreEditorTheme,
      renderersContainer: createRenderersManager(theme),
      mode: new FlexMode(),
    });
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  const reloadCanvas = () => {
    const content = serializer.serialize(
      new Struct(),
      editor.drawingEntitiesManager,
    );
    const loaded = serializer.deserializeToDrawingEntities(content);
    if (!loaded) throw new Error('Unable to load fixture');
    editor.drawingEntitiesManager = loaded.drawingEntitiesManager;
    EditorHistory.getInstance(editor).update(loaded.modelChanges);
    editor.renderersContainer.update(loaded.modelChanges);
    return [...editor.drawingEntitiesManager.monomers.values()];
  };

  const loadPeptides = () => {
    const manager = editor.drawingEntitiesManager;
    const peptideMonomerItem = editor.monomersLibrary.find(
      (item) =>
        !('isAmbiguous' in item && item.isAmbiguous) &&
        item.label === 'A' &&
        item.props.MonomerClass === KetMonomerClass.AminoAcid,
    );
    if (!peptideMonomerItem) throw new Error('Alanine template not found');
    manager.addMonomer({ ...peptideMonomerItem, seqId: 7 }, new Vec2(0, 0));
    manager.addMonomer({ ...peptideMonomerItem, seqId: 12 }, new Vec2(3, 0));
    const [first, second] = manager.monomers.values();
    manager.createPolymerBond(
      first,
      second,
      AttachmentPointName.R2,
      AttachmentPointName.R1,
      MACROMOLECULES_BOND_TYPES.SINGLE,
    );
    return reloadCanvas();
  };

  const exportSequenceIds = () => {
    const manager = new DrawingEntitiesManager();
    editor.drawingEntitiesManager.mergeInto(manager);
    const content = JSON.parse(serializer.serialize(new Struct(), manager));
    return content.root.nodes.map(
      (node: { $ref: string }) => content[node.$ref].seqid,
    );
  };

  it('displays and exports the sequence IDs loaded from KET', () => {
    const monomers = loadPeptides();
    expect(monomers.map((monomer) => monomer.renderer?.enumeration)).toEqual([
      7, 12,
    ]);
    expect(exportSequenceIds()).toEqual([7, 12]);
  });

  it('sends active IDs to Indigo for Molfile export and omits them after a reset', async () => {
    loadPeptides();
    const service = mock<StructService>();
    service.convert.mockResolvedValue({
      struct: 'molfile',
      format: ChemicalMimeType.Mol,
    });
    const formatter = new ServerFormatter(
      service,
      serializer,
      SupportedFormat.molV3000,
    );
    const manager = editor.drawingEntitiesManager;
    await formatter.getStringFromStructureAsync(new Struct(), manager);
    expect(JSON.parse(service.convert.mock.calls[0][0].struct)).toMatchObject({
      monomer0: { seqid: 7 },
      monomer1: { seqid: 12 },
    });

    const [bond] = manager.polymerBonds.values();
    const command = manager.deletePolymerBond(bond);
    EditorHistory.getInstance(editor).update(command);
    editor.renderersContainer.update(command);
    await formatter.getStringFromStructureAsync(new Struct(), manager);
    const resetKet = JSON.parse(service.convert.mock.calls[1][0].struct);
    expect(resetKet.monomer0).not.toHaveProperty('seqid');
    expect(resetKet.monomer1).not.toHaveProperty('seqid');
  });

  it('keeps imported sequence IDs when moving a monomer', () => {
    const [first] = loadPeptides();
    const command = editor.drawingEntitiesManager.moveMonomer(
      first,
      new Vec2(5, 5),
    );
    EditorHistory.getInstance(editor).update(command);
    editor.renderersContainer.update(command);
    expect(exportSequenceIds()).toEqual([7, 12]);
  });

  it('keeps imported sequence IDs through the micromolecule model', () => {
    loadPeptides();
    const struct = new Struct();
    MacromoleculesConverter.convertDrawingEntitiesToStruct(
      editor.drawingEntitiesManager,
      struct,
    );
    const manager = new DrawingEntitiesManager();
    MacromoleculesConverter.convertStructToDrawingEntities(struct, manager);
    editor.drawingEntitiesManager = manager;
    expect(exportSequenceIds()).toEqual([7, 12]);
  });

  it('uses imported IDs in Sequence mode and retains them on layout changes', () => {
    const [, second] = loadPeptides();
    editor.events.selectMode.dispatch('sequence-layout-mode');
    expect(second.renderer).toBeInstanceOf(BaseSequenceItemRenderer);
    if (!(second.renderer instanceof BaseSequenceItemRenderer)) {
      throw new Error('Sequence renderer not found');
    }
    expect(second.renderer.counterElement?.text()).toBe('12');
    expect(exportSequenceIds()).toEqual([7, 12]);
    editor.events.selectMode.dispatch('flex-layout-mode');
    expect(second.renderer?.enumeration).toBe(12);
    expect(exportSequenceIds()).toEqual([7, 12]);
  });

  it('resets IDs when replacing a monomer, even when history is updated after rendering', () => {
    const [first] = loadPeptides();
    const command = replaceMonomer(
      editor.drawingEntitiesManager,
      first,
      first.monomerItem,
    );
    editor.renderersContainer.update(command);
    const history = EditorHistory.getInstance(editor);
    history.update(command);
    expect(exportSequenceIds()).toEqual([undefined, undefined]);
    history.undo();
    expect(exportSequenceIds()).toEqual([12, 7]);
    history.redo();
    expect(exportSequenceIds()).toEqual([undefined, undefined]);
  });

  it('uses the sequence ID of an RNA base and removes all triplet IDs on edit', () => {
    const nucleotide = Nucleotide.createOnCanvas('A', new Vec2(0, 0));
    if (!nucleotide) throw new Error('Unable to create RNA fixture');
    nucleotide.node.monomers.forEach((monomer, index) => {
      monomer.monomerItem.seqId = 20 + index;
    });
    const monomers = reloadCanvas();
    const base = monomers.find(
      (monomer) =>
        monomer.monomerItem.props.MonomerClass === KetMonomerClass.Base,
    );
    if (!base) throw new Error('RNA base not found');
    expect(base.renderer?.enumeration).toBe(base.monomerItem.seqId);
    expect(exportSequenceIds()).toEqual([21, 20, 22]);

    const command = editor.drawingEntitiesManager.deleteMonomer(base);
    EditorHistory.getInstance(editor).update(command);
    editor.renderersContainer.update(command);
    expect(exportSequenceIds()).toEqual([undefined, undefined]);
  });

  it('preserves sequence IDs for ambiguous monomers through KET and micro conversion', () => {
    const [first, second] = loadPeptides();
    editor.drawingEntitiesManager.addAmbiguousMonomer(
      {
        id: 'variant',
        label: '%',
        seqId: 40,
        isAmbiguous: true,
        subtype: KetAmbiguousMonomerTemplateSubType.ALTERNATIVES,
        monomers: [first, second],
        options: [{ templateId: first.monomerItem.props.id ?? '' }],
      },
      new Vec2(10, 0),
    );
    const monomers = reloadCanvas();
    const variant = monomers.find(
      (monomer) => monomer instanceof AmbiguousMonomer,
    );
    if (!variant) throw new Error('Ambiguous monomer not found');
    expect(variant.renderer?.enumeration).toBe(40);
    expect(exportSequenceIds()).toEqual([7, 12, 40]);

    const command = editor.drawingEntitiesManager.createPolymerBond(
      monomers[1],
      variant,
      AttachmentPointName.R2,
      AttachmentPointName.R1,
    );
    EditorHistory.getInstance(editor).update(command);
    editor.renderersContainer.update(command);
    expect(exportSequenceIds()).toEqual([undefined, undefined, undefined]);

    const struct = new Struct();
    MacromoleculesConverter.convertDrawingEntitiesToStruct(
      editor.drawingEntitiesManager,
      struct,
    );
    const manager = new DrawingEntitiesManager();
    MacromoleculesConverter.convertStructToDrawingEntities(struct, manager);
    editor.drawingEntitiesManager = manager;
    expect(exportSequenceIds()).toEqual([undefined, undefined, undefined]);
  });

  it('resets imported IDs when extending a sequence', () => {
    const [first, second] = loadPeptides();
    const manager = editor.drawingEntitiesManager;
    const command = manager.addMonomer(first.monomerItem, new Vec2(6, 0));
    const added = command.operations[0].monomer;
    if (!added) throw new Error('Added monomer not found');
    command.merge(
      manager.createPolymerBond(
        second,
        added,
        AttachmentPointName.R2,
        AttachmentPointName.R1,
      ),
    );
    EditorHistory.getInstance(editor).update(command);
    editor.renderersContainer.update(command);
    expect(exportSequenceIds()).toEqual([undefined, undefined, undefined]);
    expect(
      [first, second, added].map((monomer) => monomer.renderer?.enumeration),
    ).toEqual([1, 2, 3]);
  });

  it('does not reset numbering in an unrelated sequence', () => {
    loadPeptides();
    const manager = editor.drawingEntitiesManager;
    const [first] = manager.monomers.values();
    const command = manager.addMonomer(first.monomerItem, new Vec2(10, 0));
    EditorHistory.getInstance(editor).update(command);
    editor.renderersContainer.update(command);
    expect(exportSequenceIds()).toEqual([7, 12, 7]);
    const [bond] = manager.polymerBonds.values();
    const deletion = manager.deletePolymerBond(bond);
    EditorHistory.getInstance(editor).update(deletion);
    editor.renderersContainer.update(deletion);
    expect(exportSequenceIds()).toEqual([undefined, undefined, 7]);
  });

  it.each([false, true])(
    'clears sequence IDs on edit and restores them on undo (frozen items: %s)',
    (frozen) => {
      const monomers = loadPeptides();
      const manager = editor.drawingEntitiesManager;
      const [bond] = manager.polymerBonds.values();
      const command = manager.deletePolymerBond(bond);
      const history = EditorHistory.getInstance(editor);
      if (frozen) {
        monomers.forEach((monomer) => Object.freeze(monomer.monomerItem));
      }
      history.update(command);
      editor.renderersContainer.update(command);

      expect(exportSequenceIds()).toEqual([undefined, undefined]);
      expect(monomers.map((monomer) => monomer.renderer?.enumeration)).toEqual([
        1, 1,
      ]);

      if (frozen) {
        monomers.forEach((monomer) => Object.freeze(monomer.monomerItem));
      }
      history.undo();
      expect(exportSequenceIds()).toEqual([7, 12]);
      expect(monomers.map((monomer) => monomer.renderer?.enumeration)).toEqual([
        7, 12,
      ]);

      history.redo();
      expect(exportSequenceIds()).toEqual([undefined, undefined]);
    },
  );
});
