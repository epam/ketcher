import { ToolName } from 'application/editor/tools/types';
import { ReinitializeModeOperation } from 'application/editor/operations/modes';
import { CoreEditor, EditorHistory, SequenceMode } from 'application/editor';
import { SequenceRenderer } from 'application/render/renderers/sequence/SequenceRenderer';
import { SELECTION_COLOR } from 'application/render/renderers/constants';
import { Nucleotide } from 'domain/entities/Nucleotide';
import { Nucleoside } from 'domain/entities/Nucleoside';
import { Vec2, BaseMonomer } from 'domain/entities';
import type { SequenceNode } from 'domain/entities/monomer-chains/types';
import { getSugarFromRnaBase } from 'domain/helpers/monomers';
import type { RNABase } from 'domain/entities/RNABase';
import { AttachmentPointName } from 'domain/types';
import { Entities } from 'domain/types';
import { STRAND_TYPE } from 'domain/constants';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../../helpers/dom';

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
SVGElement.prototype.getBBox = jest
  .fn()
  .mockReturnValue({ x: 0, y: 0, width: 12, height: 12 });

describe('RNA Builder resulting nucleotide selection', () => {
  let editor: CoreEditor;
  let mode: SequenceMode;
  let canvas: SVGSVGElement;

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
      mode,
      renderersContainer: createRenderersManager({
        monomer: {
          color: {
            X: { regular: 'yellow' },
            R: { regular: 'yellow' },
            P: { regular: 'yellow' },
          },
        },
      }),
    });
    editor.selectTool(ToolName.selectRectangle);
    // The application responds to this event by replacing the selection tool.
    editor.events.selectSelectionTool.add(() =>
      editor.selectTool(ToolName.selectRectangle),
    );
  });

  afterEach(() => {
    EditorHistory.getInstance(editor).destroy();
    canvas.remove();
  });

  const nodeForAnchor = (anchor: BaseMonomer) => {
    let result: SequenceNode | undefined;
    SequenceRenderer.forEachNode(({ twoStrandedNode }) => {
      for (const node of [
        twoStrandedNode.senseNode,
        twoStrandedNode.antisenseNode,
      ]) {
        if (node?.monomers.includes(anchor)) result = node;
      }
    });
    if (!result) throw new Error('Anchor not found in sequence');
    return result;
  };

  it.each([
    ['ordinary base', 'G', false],
    ['ambiguous replacement', 'N', false],
    ['phosphate insertion', undefined, true],
  ] as const)(
    'restores only the antisense strand for %s, including Undo/Redo',
    (_case, baseLabel, insertPhosphate) => {
      const manager = editor.drawingEntitiesManager;
      const first = Nucleotide.createOnCanvas('C', new Vec2(0, 0))!.node;
      const second = Nucleoside.createOnCanvas('A', new Vec2(2, 0))!.node;
      manager.createPolymerBond(
        first.phosphate,
        second.sugar,
        AttachmentPointName.R2,
        AttachmentPointName.R1,
      );
      manager.selectDrawingEntities([...manager.monomers.values()]);
      manager.createAntisenseChain(false);
      manager.unselectAllDrawingEntities();
      mode.initialize(false, false, false);
      const antisenseBase = second.rnaBase.hydrogenBonds[0].getAnotherMonomer(
        second.rnaBase,
      ) as RNABase;
      const anchor = getSugarFromRnaBase(antisenseBase)!;
      const original = nodeForAnchor(anchor) as Nucleotide;
      expect(original).toBeInstanceOf(Nucleotide);
      if (insertPhosphate) {
        // Remove an internal phosphate and bridge its sugars, so Update must
        // insert a new entity on the antisense backbone.
        const nextSugar =
          original.phosphate.attachmentPointsToBonds.R2!.getAnotherEntity(
            original.phosphate,
          ) as BaseMonomer;
        manager.deleteMonomer(original.phosphate);
        manager.createPolymerBond(
          anchor,
          nextSugar,
          AttachmentPointName.R2,
          AttachmentPointName.R1,
        );
        mode.initialize(false, false, false);
      }
      const before = nodeForAnchor(anchor) as Nucleotide | Nucleoside;
      const originalBaseLabel = before.rnaBase.label;
      const originalMonomerCount = manager.monomers.size;
      manager.selectDrawingEntities(before.monomers);
      mode.turnOnSequenceEditInRNABuilderMode();
      const position = SequenceRenderer.selections.flat()[0].nodeIndexOverall;
      mode.modifySequenceInRnaBuilder([
        {
          type: insertPhosphate ? Entities.Nucleoside : Entities.Nucleotide,
          nodeIndexOverall: position,
          strandType: STRAND_TYPE.ANTISENSE,
          // Replacement exercises identity changes; insertion keeps the base.
          baseLabel: baseLabel ?? originalBaseLabel,
          phosphateLabel: 'P',
        },
      ]);
      mode.turnOffSequenceEditInRNABuilderMode(false);
      mode.turnOffEditMode(false);
      const resulting = nodeForAnchor(anchor) as Nucleotide;
      expect(resulting).toBeInstanceOf(Nucleotide);
      expect(resulting.rnaBase.label).toBe(baseLabel ?? originalBaseLabel);
      for (const monomer of resulting.monomers) {
        expect(monomer.selected).toBe(true);
        expect(manager.monomers.get(monomer.id)).toBe(monomer);
      }
      expect(
        nodeForAnchor(second.sugar).monomers.every((m) => !m.selected),
      ).toBe(true);
      expect(
        nodeForAnchor(first.sugar).monomers.every((m) => !m.selected),
      ).toBe(true);
      expect(SequenceRenderer.selections.flat()).toHaveLength(1);
      expect(
        new Set([...manager.monomers.values()].filter((m) => m.selected)),
      ).toEqual(new Set(resulting.monomers));
      expect(manager.monomers.size).toBe(
        originalMonomerCount + (insertPhosphate ? 1 : 0),
      );

      const history = EditorHistory.getInstance(editor);
      history.undo();
      const undone = nodeForAnchor(anchor) as Nucleotide | Nucleoside;
      expect(undone.rnaBase.label).toBe(originalBaseLabel);
      expect(undone).toBeInstanceOf(insertPhosphate ? Nucleoside : Nucleotide);
      expect(manager.monomers.size).toBe(originalMonomerCount);
      expect([...manager.monomers.values()].every((m) => !m.selected)).toBe(
        true,
      );
      expect(SequenceRenderer.selections.flat()).toHaveLength(0);
      history.redo();
      const redone = nodeForAnchor(anchor) as Nucleotide;
      expect(redone).toBeInstanceOf(Nucleotide);
      expect(redone.rnaBase.label).toBe(baseLabel ?? originalBaseLabel);
      expect(manager.monomers.size).toBe(
        originalMonomerCount + (insertPhosphate ? 1 : 0),
      );
      expect([...manager.monomers.values()].every((m) => !m.selected)).toBe(
        true,
      );
      expect(SequenceRenderer.selections.flat()).toHaveLength(0);
    },
  );

  it('keeps unrelated pre-existing selection when the update payload covers only one nucleotide', () => {
    const first = Nucleotide.createOnCanvas('C', new Vec2(0, 0))!.node;
    const unrelated = Nucleoside.createOnCanvas('A', new Vec2(4, 0))!.node;
    mode.initialize(false, false, false);
    // This state is reachable through the core selection API. Restoration is
    // additive; this issue does not impose a new selection-clearing policy.
    editor.drawingEntitiesManager.selectDrawingEntities([
      ...first.monomers,
      ...unrelated.monomers,
    ]);
    mode.turnOnSequenceEditInRNABuilderMode();
    const position = SequenceRenderer.selections
      .flat()
      .find((s) =>
        s.node.senseNode?.monomers.includes(first.sugar),
      )!.nodeIndexOverall;
    mode.modifySequenceInRnaBuilder([
      {
        type: Entities.Nucleotide,
        nodeIndexOverall: position,
        strandType: STRAND_TYPE.SENSE,
        baseLabel: 'G',
      },
    ]);
    mode.turnOffSequenceEditInRNABuilderMode(false);
    expect(
      nodeForAnchor(unrelated.sugar).monomers.every((m) => m.selected),
    ).toBe(true);
  });

  it('keeps the default refresh selection-clearing behavior', () => {
    const initialize = jest.spyOn(mode, 'initialize');
    const selectTool = jest.spyOn(
      editor.events.selectSelectionTool,
      'dispatch',
    );
    new ReinitializeModeOperation().execute(editor.renderersContainer);
    expect(initialize).toHaveBeenCalledWith(false, undefined, true, false);
    expect(selectTool).toHaveBeenCalled();
  });

  it.each([
    ['ordinary base', 'C', 'G', false],
    ['ambiguous base replacement', 'C', 'N', false],
    ['ambiguous to ordinary replacement', 'N', 'G', false],
    ['phosphate insertion', 'C', 'G', true],
  ])(
    'preserves selection for %s and allows subsequent deselection',
    (_case, initialBaseLabel, baseLabel, insertPhosphate) => {
      const created = insertPhosphate
        ? Nucleoside.createOnCanvas(initialBaseLabel, new Vec2(0, 0))
        : Nucleotide.createOnCanvas(initialBaseLabel, new Vec2(0, 0));
      if (!created) throw new Error('Could not create nucleotide');
      const sugar = created.node.sugar;
      const next = Nucleoside.createOnCanvas('A', new Vec2(2, 0));
      if (!next) throw new Error('Could not create next nucleotide');
      editor.drawingEntitiesManager.createPolymerBond(
        created.node instanceof Nucleotide ? created.node.phosphate : sugar,
        next.node.sugar,
        AttachmentPointName.R2,
        AttachmentPointName.R1,
      );
      mode.initialize(false, false, false);
      editor.drawingEntitiesManager.selectDrawingEntities(
        created.node.monomers,
      );
      mode.turnOnSequenceEditInRNABuilderMode();
      const nodeIndexOverall =
        SequenceRenderer.selections.flat()[0].nodeIndexOverall;

      expect(sugar.selected).toBe(true);
      mode.modifySequenceInRnaBuilder([
        {
          type: insertPhosphate ? Entities.Nucleoside : Entities.Nucleotide,
          nodeIndexOverall,
          strandType: STRAND_TYPE.SENSE,
          baseLabel,
          sugarLabel: 'R',
          phosphateLabel: 'P',
        },
      ]);
      mode.turnOffSequenceEditInRNABuilderMode(false);
      mode.turnOffEditMode(false);

      const resulting = SequenceRenderer.getRendererByMonomer(sugar);
      expect(resulting).toBeDefined();
      expect(resulting?.node).toBeInstanceOf(Nucleotide);
      const node = resulting!.node as Nucleotide;
      expect(node.rnaBase.label).toBe(baseLabel);
      expect(node.monomer.selected).toBe(true);
      expect(SequenceRenderer.selections.flat()).toHaveLength(1);
      expect(
        canvas
          .querySelector(`rect.dynamic-element[fill="${SELECTION_COLOR}"]`)
          ?.getAttribute('fill'),
      ).toBe(SELECTION_COLOR);
      expect(mode.isEditInRNABuilderMode).toBe(false);
      expect(next.node.monomer.selected).toBe(false);
      for (const monomer of node.monomers) {
        expect(editor.drawingEntitiesManager.monomers.get(monomer.id)).toBe(
          monomer,
        );
        expect(monomer.selected).toBe(true);
      }

      editor.selectedTool?.mousedown?.({
        target: canvas,
        shiftKey: false,
      } as unknown as MouseEvent);
      expect(SequenceRenderer.selections.flat()).toHaveLength(0);
      expect(node.monomer.selected).toBe(false);
    },
  );
});
