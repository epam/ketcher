import { CoreEditor, EditorHistory, SequenceMode } from 'application/editor';
import { MACROMOLECULES_BOND_TYPES } from 'application/editor/tools/types';
import { SequenceRenderer } from 'application/render/renderers/sequence/SequenceRenderer';
import { ChainsCollection } from 'domain/entities/monomer-chains/ChainsCollection';
import { Vec2 } from 'domain/entities';
import type { BaseMonomer } from 'domain/entities/BaseMonomer';
import { Nucleotide } from 'domain/entities/Nucleotide';
import { Nucleoside } from 'domain/entities/Nucleoside';
import { Phosphate } from 'domain/entities/Phosphate';
import { Sugar } from 'domain/entities/Sugar';
import { PolymerBond } from 'domain/entities/PolymerBond';
import { AttachmentPointName } from 'domain/types';
import { KetMonomerClass } from 'domain/constants/monomers';
import { getRnaPartLibraryItem } from 'domain/helpers/rna';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../../helpers/dom';

globalThis.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
SVGElement.prototype.getBBox = jest
  .fn()
  .mockReturnValue({ x: 0, y: 0, width: 12, height: 12 });

describe('SequenceMode insertion before a paired initial phosphate (#6748)', () => {
  let canvas: SVGSVGElement;
  let editor: CoreEditor;
  let mode: SequenceMode;

  beforeEach(() => {
    canvas = createPolymerEditorCanvas();
    for (const dimension of ['width', 'height']) {
      Object.defineProperty(canvas, dimension, {
        configurable: true,
        value: { baseVal: { value: 500 } },
      });
    }
    mode = new SequenceMode();
    editor = new CoreEditor({
      canvas,
      theme: {},
      renderersContainer: createRenderersManager({
        monomer: {
          color: {
            X: { regular: 'yellow' },
            R: { regular: 'yellow' },
            P: { regular: 'yellow' },
          },
        },
      }),
      mode,
    });
  });

  afterEach(() => {
    editor.destroy();
    canvas.remove();
  });

  const libraryPart = (alias: string, monomerClass: KetMonomerClass) => {
    const item = getRnaPartLibraryItem(editor, alias, monomerClass);
    if (!item) throw new Error(`Missing library item: ${alias}`);
    return item;
  };

  // Same graph as the issue's HELM, including the phosphate/base pair and
  // the CHEM linker. Use model identities to distinguish old and new phosphates.
  const buildStructure = () => {
    const manager = editor.drawingEntitiesManager;
    const initialPhosphate = manager.addMonomer(
      libraryPart('P', KetMonomerClass.Phosphate),
      new Vec2(-1.6, 0),
    ).operations[0].monomer;
    const firstA = Nucleotide.createOnCanvas('A', new Vec2(0, 0))?.node;
    const secondA = Nucleoside.createOnCanvas('A', new Vec2(3.2, 0))?.node;
    const firstU = Nucleotide.createOnCanvas('U', new Vec2(3.2, 3))?.node;
    const secondU = Nucleoside.createOnCanvas('U', new Vec2(-1.6, 3))?.node;
    const chem = manager.addMonomer(
      libraryPart('4aPEGMal', KetMonomerClass.CHEM),
      new Vec2(0, 3),
    ).operations[0].monomer;
    if (
      !initialPhosphate ||
      !firstA ||
      !secondA ||
      !firstU ||
      !secondU ||
      !chem
    ) {
      throw new Error('Could not build the issue structure');
    }
    const connect = (from: BaseMonomer, to: BaseMonomer) =>
      manager.createPolymerBond(
        from,
        to,
        AttachmentPointName.R2,
        AttachmentPointName.R1,
      );
    connect(initialPhosphate, firstA.sugar);
    connect(firstA.phosphate, secondA.sugar);
    connect(firstU.phosphate, chem);
    connect(chem, secondU.sugar);
    manager.createPolymerBond(
      secondA.rnaBase,
      firstU.rnaBase,
      AttachmentPointName.HYDROGEN,
      AttachmentPointName.HYDROGEN,
      MACROMOLECULES_BOND_TYPES.HYDROGEN,
    );
    manager.createPolymerBond(
      initialPhosphate,
      secondU.rnaBase,
      AttachmentPointName.HYDROGEN,
      AttachmentPointName.HYDROGEN,
      MACROMOLECULES_BOND_TYPES.HYDROGEN,
    );
    const chains = ChainsCollection.fromMonomers([
      ...manager.monomers.values(),
    ]);
    chains.rearrange();
    SequenceRenderer.show(chains);
    mode.turnOnEditMode();
    mode.turnOffSyncEditMode();
    SequenceRenderer.setCaretPositionByMonomer(initialPhosphate);
    return { initialPhosphate, firstA };
  };

  const graph = () => {
    const manager = editor.drawingEntitiesManager;
    return {
      monomers: [...manager.monomers.keys()].sort((a, b) => a - b),
      bonds: [...manager.polymerBonds.values()]
        .map((bond) => [
          bond.id,
          bond.firstMonomer.id,
          bond.firstMonomerAttachmentPoint,
          bond.secondMonomer?.id,
          bond.secondMonomerAttachmentPoint,
        ])
        .sort((a, b) => Number(a[0]) - Number(b[0])),
    };
  };

  const neighbor = (
    monomer: BaseMonomer,
    attachmentPoint: AttachmentPointName,
  ) => {
    const bond = monomer.attachmentPointsToBonds[attachmentPoint];
    return bond instanceof PolymerBond
      ? bond.getAnotherMonomer(monomer)
      : undefined;
  };

  it.each(['keyboard', 'library'] as const)(
    '%s insertion preserves the original graph through Undo/Redo',
    async (source) => {
      const { initialPhosphate } = buildStructure();
      const before = graph();
      const existingMonomers = new Set(before.monomers);
      const originalPhosphateBonds = {
        ...initialPhosphate.attachmentPointsToBonds,
      };
      expect(SequenceRenderer.currentEdittingNode?.senseNode?.monomer.id).toBe(
        initialPhosphate.id,
      );

      if (source === 'keyboard') {
        await mode.onKeyDown(
          new KeyboardEvent('keydown', { key: 'c', code: 'KeyC' }),
        );
      } else {
        mode.insertPresetFromLibrary({
          name: 'C',
          sugar: libraryPart('R', KetMonomerClass.Sugar),
          base: libraryPart('C', KetMonomerClass.Base),
          phosphate: libraryPart('P', KetMonomerClass.Phosphate),
        });
      }

      const added = [...editor.drawingEntitiesManager.monomers.values()].filter(
        (monomer) => !existingMonomers.has(monomer.id),
      );
      expect(added).toHaveLength(source === 'keyboard' ? 2 : 3);
      expect(
        added.filter((monomer) => monomer instanceof Phosphate),
      ).toHaveLength(source === 'keyboard' ? 0 : 1);
      const sugar = added.find((monomer) => monomer instanceof Sugar);
      expect(sugar).toBeDefined();
      expect(sugar && neighbor(sugar, AttachmentPointName.R3)?.label).toBe('C');
      const lastMonomer =
        source === 'keyboard'
          ? sugar
          : added.find((monomer) => monomer instanceof Phosphate);
      expect(neighbor(initialPhosphate, AttachmentPointName.R1)).toBe(
        lastMonomer,
      );
      expect(initialPhosphate.attachmentPointsToBonds.R2).toBe(
        originalPhosphateBonds.R2,
      );
      expect(initialPhosphate.hydrogenBonds).toHaveLength(1);
      const after = graph();
      expect(after.bonds).toEqual(expect.arrayContaining(before.bonds));
      expect(after.bonds).toHaveLength(
        before.bonds.length + (source === 'keyboard' ? 2 : 3),
      );

      const history = EditorHistory.getInstance(editor);
      history.undo();
      expect(graph()).toEqual(before);
      history.redo();
      expect(graph()).toEqual(after);
    },
  );

  it('preserves phosphate bridging and complementary insertion in SYNC mode', async () => {
    buildStructure();
    mode.turnOnSyncEditMode();
    const before = graph();
    await mode.onKeyDown(
      new KeyboardEvent('keydown', { key: 'c', code: 'KeyC' }),
    );
    const added = [...editor.drawingEntitiesManager.monomers.values()].filter(
      (monomer) => !before.monomers.includes(monomer.id),
    );
    expect(added.map((monomer) => monomer.label).sort()).toEqual([
      'C',
      'G',
      'P',
      'P',
      'R',
      'R',
    ]);
    const after = graph();
    expect(after.bonds).toEqual(expect.arrayContaining(before.bonds));
    const history = EditorHistory.getInstance(editor);
    history.undo();
    expect(graph()).toEqual(before);
    history.redo();
    expect(graph()).toEqual(after);
  });

  it('inserts a nucleotide between the initial phosphate and first A', async () => {
    const { initialPhosphate, firstA } = buildStructure();
    SequenceRenderer.setCaretPositionByMonomer(firstA.rnaBase);
    const before = graph();
    const originalBond = initialPhosphate.attachmentPointsToBonds.R2;
    await mode.onKeyDown(
      new KeyboardEvent('keydown', { key: 'c', code: 'KeyC' }),
    );
    const added = [...editor.drawingEntitiesManager.monomers.values()].filter(
      (monomer) => !before.monomers.includes(monomer.id),
    );
    expect(added).toHaveLength(3);
    const phosphate = added.find((monomer) => monomer instanceof Phosphate);
    const sugar = added.find((monomer) => monomer instanceof Sugar);
    expect(phosphate).toBeDefined();
    expect(neighbor(initialPhosphate, AttachmentPointName.R2)).toBe(sugar);
    expect(neighbor(firstA.sugar, AttachmentPointName.R1)).toBe(phosphate);
    expect(
      editor.drawingEntitiesManager.polymerBonds.has(originalBond?.id ?? -1),
    ).toBe(false);
    expect(initialPhosphate.hydrogenBonds).toHaveLength(1);
    const after = graph();
    const history = EditorHistory.getInstance(editor);
    history.undo();
    expect(graph()).toEqual(before);
    history.redo();
    expect(graph()).toEqual(after);
  });
});
