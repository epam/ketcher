import { CoreEditor, EditorHistory, SequenceMode } from 'application/editor';
import { SequenceRenderer } from 'application/render/renderers/sequence/SequenceRenderer';
import type { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import { ChainsCollection } from 'domain/entities/monomer-chains/ChainsCollection';
import { BaseMonomer, Chem, Phosphate, RNABase, Sugar } from 'domain/entities';
import { AttachmentPointName } from 'domain/types';
import { SequenceType } from 'domain/entities/monomer-chains/types';
import { KetSerializer } from 'domain/serializers';
import { Nucleotide } from 'domain/entities/Nucleotide';
import { Nucleoside } from 'domain/entities/Nucleoside';
import { Vec2 } from 'domain/entities/vec2';
import { getRnaPartLibraryItem } from 'domain/helpers/rna';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../../helpers/dom';

import senseKet from './fixtures/6529-sense.ket';
import antisenseKet from './fixtures/6529-antisense.ket';

// Converted from the two HELM examples in epam/ketcher#6529 using Indigo.
// Keep their nonstandard CHEM/base hydrogen bonds and backbone topology.
const examples = [
  { strand: 'sense', sequenceType: SequenceType.RNA, ket: senseKet },
  { strand: 'sense', sequenceType: SequenceType.DNA, ket: senseKet },
  { strand: 'antisense', sequenceType: SequenceType.RNA, ket: antisenseKet },
  { strand: 'antisense', sequenceType: SequenceType.DNA, ket: antisenseKet },
];

const expectConnection = (
  first: BaseMonomer,
  firstPoint: AttachmentPointName,
  second: BaseMonomer,
  secondPoint: AttachmentPointName,
) => {
  const bond = first.attachmentPointsToBonds[firstPoint];
  expect(bond).toBeTruthy();
  expect(bond?.getAnotherEntity(first)?.id).toBe(second.id);
  expect(second.attachmentPointsToBonds[secondPoint]).toBe(bond);
};

const graph = (editor: CoreEditor) =>
  [...editor.drawingEntitiesManager.monomers.values()].map((monomer) => ({
    id: monomer.id,
    attachments: Object.entries(monomer.attachmentPointsToBonds).map(
      ([point, bond]) => [point, bond?.getAnotherEntity(monomer)?.id ?? null],
    ),
    hydrogen: monomer.hydrogenBonds.map(
      (bond) => bond.getAnotherMonomer(monomer)?.id,
    ),
  }));

globalThis.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
SVGElement.prototype.getBBox = jest
  .fn()
  .mockReturnValue({ x: 0, y: 0, width: 12, height: 12 });

describe('Sequence insertion before CHEM (#6529)', () => {
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
    EditorHistory.getInstance(editor).destroy();
    canvas.remove();
  });

  it.each(examples)(
    'inserts $sequenceType before $strand CHEM with phosphate and supports Undo/Redo',
    async ({ strand, sequenceType, ket }) => {
      const loaded = new KetSerializer().deserializeToDrawingEntities(ket);
      if (!loaded) throw new Error('Invalid issue fixture');
      editor.drawingEntitiesManager = loaded.drawingEntitiesManager;
      const manager = editor.drawingEntitiesManager;
      editor.renderersContainer.update(
        manager.recalculateAntisenseChains(true),
      );
      const chains = ChainsCollection.fromMonomers([
        ...manager.monomers.values(),
      ]);
      chains.rearrange();
      SequenceRenderer.show(chains);
      editor.sequenceTypeEnterMode = sequenceType;
      const chems = [...manager.monomers.values()].filter(
        (m) => m instanceof Chem,
      );
      const chem = chems.find(
        (m) =>
          Boolean(
            (m.renderer as unknown as BaseSequenceItemRenderer)
              ?.isAntisenseNode,
          ) ===
          (strand === 'antisense'),
      );
      if (!chem) throw new Error('CHEM not found on strand');
      const renderer = chem.renderer as unknown as BaseSequenceItemRenderer;
      mode.mousedownBetweenSequenceItems({
        target: { __data__: renderer },
      } as unknown as MouseEvent);
      mode.turnOffSyncEditMode();
      SequenceRenderer.setCaretPositionByMonomer(chem);
      if (strand === 'antisense') SequenceRenderer.moveCaretForwardOrToRowEnd();
      const before = new Set(manager.monomers.values());
      const graphBefore = graph(editor);
      const caretBefore = SequenceRenderer.caretPosition;
      await mode.onKeyDown(
        new KeyboardEvent('keydown', { key: 'c', code: 'KeyC', keyCode: 67 }),
      );
      const added = [...manager.monomers.values()].filter(
        (m) => !before.has(m),
      );
      expect(added).toHaveLength(3);
      expect(added.filter((m) => m instanceof Phosphate)).toHaveLength(1);
      expect(added.filter((m) => m instanceof Sugar)).toHaveLength(1);
      const sugar = added.find((m) => m instanceof Sugar)!;
      const phosphate = added.find((m) => m instanceof Phosphate)!;
      const base = added.find((m) => m instanceof RNABase)!;
      expect(sugar.label).toBe(sequenceType === SequenceType.DNA ? 'dR' : 'R');
      expect(base.label).toBe('C');
      const expectInsertedConnections = () => {
        expectConnection(
          sugar,
          AttachmentPointName.R3,
          base,
          AttachmentPointName.R1,
        );
        expectConnection(
          sugar,
          AttachmentPointName.R2,
          phosphate,
          AttachmentPointName.R1,
        );
        expectConnection(
          phosphate,
          AttachmentPointName.R2,
          chem,
          AttachmentPointName.R1,
        );
      };
      expectInsertedConnections();
      const graphAfter = graph(editor);
      const caretAfter = SequenceRenderer.caretPosition;
      const history = EditorHistory.getInstance(editor);
      history.undo();
      expect(graph(editor)).toEqual(graphBefore);
      expect(SequenceRenderer.caretPosition).toBe(caretBefore);
      history.redo();
      expect(graph(editor)).toEqual(graphAfter);
      expect(SequenceRenderer.caretPosition).toBe(caretAfter);
      expectInsertedConnections();
    },
  );

  it('inserts between an existing nucleotide and CHEM', async () => {
    const loaded = new KetSerializer().deserializeToDrawingEntities(senseKet)!;
    editor.drawingEntitiesManager = loaded.drawingEntitiesManager;
    const manager = editor.drawingEntitiesManager;
    const chem = [...manager.monomers.values()].find((m) => m instanceof Chem)!;
    const previous = Nucleotide.createOnCanvas('A', new Vec2())!.node;
    manager.createPolymerBond(
      previous.phosphate,
      chem,
      AttachmentPointName.R2,
      AttachmentPointName.R1,
    );
    mode.initialize();
    const renderer = chem.renderer as unknown as BaseSequenceItemRenderer;
    mode.mousedownBetweenSequenceItems({
      target: { __data__: renderer },
    } as unknown as MouseEvent);
    mode.turnOffSyncEditMode();
    SequenceRenderer.setCaretPositionByMonomer(chem);
    const before = new Set(manager.monomers.values());
    await mode.onKeyDown(
      new KeyboardEvent('keydown', { key: 'c', code: 'KeyC', keyCode: 67 }),
    );
    const added = [...manager.monomers.values()].filter((m) => !before.has(m));
    expect(added).toHaveLength(3);
    const sugar = added.find((m) => m instanceof Sugar)!;
    const phosphate = added.find((m) => m instanceof Phosphate)!;
    expectConnection(
      previous.phosphate,
      AttachmentPointName.R2,
      sugar,
      AttachmentPointName.R1,
    );
    expectConnection(
      sugar,
      AttachmentPointName.R2,
      phosphate,
      AttachmentPointName.R1,
    );
    expectConnection(
      phosphate,
      AttachmentPointName.R2,
      chem,
      AttachmentPointName.R1,
    );
  });

  it.each(['phosphate', 'chain end'])(
    'keeps nucleoside insertion before %s',
    async (successor) => {
      const manager = editor.drawingEntitiesManager;
      const existing =
        successor === 'phosphate'
          ? (manager.addMonomer(getRnaPartLibraryItem(editor, 'P')!, new Vec2())
              .operations[0].monomer as BaseMonomer)
          : Nucleoside.createOnCanvas('A', new Vec2())!.node.sugar;
      mode.initialize();
      mode.mousedownBetweenSequenceItems({
        target: { __data__: existing.renderer },
      } as unknown as MouseEvent);
      mode.turnOffSyncEditMode();
      SequenceRenderer.setCaretPositionByMonomer(existing);
      if (successor === 'chain end')
        SequenceRenderer.moveCaretForwardOrToRowEnd();
      const before = new Set(manager.monomers.values());
      await mode.onKeyDown(
        new KeyboardEvent('keydown', { key: 'c', code: 'KeyC', keyCode: 67 }),
      );
      const added = [...manager.monomers.values()].filter(
        (m) => !before.has(m),
      );
      expect(added.filter((m) => m instanceof RNABase)).toHaveLength(1);
      const sugar = added.find((m) => m instanceof Sugar)!;
      if (successor === 'phosphate') {
        expect(added.filter((m) => m instanceof Phosphate)).toHaveLength(0);
        expectConnection(
          sugar,
          AttachmentPointName.R2,
          existing,
          AttachmentPointName.R1,
        );
      } else {
        expect(sugar.attachmentPointsToBonds.R2).toBeNull();
        expectConnection(
          existing,
          AttachmentPointName.R2,
          added.find((m) => m instanceof Phosphate)!,
          AttachmentPointName.R1,
        );
      }
    },
  );
});
