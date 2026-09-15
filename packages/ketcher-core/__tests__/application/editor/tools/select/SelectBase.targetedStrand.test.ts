import { CoreEditor } from 'application/editor';
import { SelectRectangle } from 'application/editor/tools/select';
import { BaseRenderer } from 'application/render/renderers/BaseRenderer';
import { SequenceRenderer } from 'application/render/renderers/sequence/SequenceRenderer';
import { ChainsCollection } from 'domain/entities/monomer-chains/ChainsCollection';
import { Vec2 } from 'domain/entities';
import { Nucleotide } from 'domain/entities/Nucleotide';
import type { RNABase } from 'domain/entities/RNABase';
import { Sugar } from 'domain/entities/Sugar';
import { AttachmentPointName } from 'domain/types';
import { getSugarFromRnaBase } from 'domain/helpers/monomers';
import { STRAND_TYPE } from 'domain/constants';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../../../helpers/dom';

// Exposes the protected gesture entry point under test. Modeled on
// TestSelectRectangle in SelectBase.test.ts.
class TestSelectRectangle extends SelectRectangle {
  public exposedMousedownEntity(
    renderer: BaseRenderer,
    shiftKey = false,
    modKey = false,
    altKey = false,
  ) {
    this.mousedownEntity(renderer, shiftKey, modKey, altKey);
  }
}

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

SVGElement.prototype.getBBox = jest
  .fn()
  .mockReturnValue({ x: 0, y: 0, width: 12, height: 12 });

const stubCanvasDimensions = (canvas: SVGSVGElement) => {
  Object.defineProperty(canvas, 'width', {
    configurable: true,
    value: { baseVal: { value: 500 } },
  });
  Object.defineProperty(canvas, 'height', {
    configurable: true,
    value: { baseVal: { value: 500 } },
  });
};

const rerenderSequence = (editor: CoreEditor) => {
  const chainsCollection = ChainsCollection.fromMonomers([
    ...editor.drawingEntitiesManager.monomers.values(),
  ]);

  chainsCollection.rearrange();
  SequenceRenderer.show(chainsCollection);
};

// Builds a 2-nucleotide sense chain and mirrors it into an antisense duplex,
// then renders both strands through SequenceRenderer so each of the four
// bases has a real BaseSequenceItemRenderer to click on. Column 0 pairs
// senseRenderers[0] with antisenseRenderers[0]; column 1 pairs
// senseRenderers[1] with antisenseRenderers[1]. Modeled on
// buildFourNucleotideDuplex in antisenseChainDirection.test.ts, shortened to
// two positions since these tests only need two distinct columns.
const buildTwoPositionDuplex = (editor: CoreEditor) => {
  const drawingEntitiesManager = editor.drawingEntitiesManager;
  const senseNucleotides = ['A', 'C'].map(
    (base, index) =>
      Nucleotide.createOnCanvas(base, new Vec2(index * 1.6, 0)).node,
  );

  drawingEntitiesManager.createPolymerBond(
    senseNucleotides[0].phosphate,
    senseNucleotides[1].sugar,
    AttachmentPointName.R2,
    AttachmentPointName.R1,
  );

  drawingEntitiesManager.selectDrawingEntities([
    ...drawingEntitiesManager.monomers.values(),
  ]);
  drawingEntitiesManager.createAntisenseChain(false);
  drawingEntitiesManager.unselectAllDrawingEntities();

  const antisenseNucleotides = senseNucleotides.map((senseNucleotide) => {
    const antisenseBase =
      senseNucleotide.rnaBase.hydrogenBonds[0].getAnotherMonomer(
        senseNucleotide.rnaBase,
      ) as RNABase;
    const antisenseSugar = getSugarFromRnaBase(antisenseBase) as Sugar;

    return Nucleotide.fromSugar(antisenseSugar, false);
  });

  rerenderSequence(editor);

  return {
    // Cast through `unknown`: `mousedownEntity` (and the test helper wrapping
    // it) takes the base `BaseRenderer` type, same as the real call site's
    // `event.target.__data__`, and TS's d3-selection generics make the
    // subtype-to-base assignment structurally invalid despite the runtime
    // relationship being sound.
    senseRenderers: senseNucleotides.map(
      (nucleotide) => nucleotide.rnaBase.renderer as unknown as BaseRenderer,
    ),
    antisenseRenderers: antisenseNucleotides.map(
      (nucleotide) => nucleotide.rnaBase.renderer as unknown as BaseRenderer,
    ),
  };
};

describe('SelectBase.mousedownEntity targeted strand recording', () => {
  let canvas: SVGSVGElement;
  let editor: CoreEditor;
  let selectTool: TestSelectRectangle;

  beforeEach(() => {
    canvas = createPolymerEditorCanvas();
    stubCanvasDimensions(canvas);
    editor = new CoreEditor({
      canvas,
      theme: {},
      renderersContainer: createRenderersManager(),
    });
    selectTool = new TestSelectRectangle(editor);
  });

  afterEach(() => {
    SequenceRenderer.resetTargetedStrand();
    canvas.remove();
  });

  it('records sense on a plain click of the sense row', () => {
    const { senseRenderers } = buildTwoPositionDuplex(editor);

    selectTool.exposedMousedownEntity(senseRenderers[0]);

    expect(SequenceRenderer.targetedStrand).toBe(STRAND_TYPE.SENSE);
  });

  it('records antisense on a plain click of the antisense row', () => {
    const { antisenseRenderers } = buildTwoPositionDuplex(editor);

    selectTool.exposedMousedownEntity(antisenseRenderers[0]);

    expect(SequenceRenderer.targetedStrand).toBe(STRAND_TYPE.ANTISENSE);
  });

  it('a second plain click overwrites the record from the first', () => {
    const { senseRenderers, antisenseRenderers } =
      buildTwoPositionDuplex(editor);

    selectTool.exposedMousedownEntity(senseRenderers[0]);
    expect(SequenceRenderer.targetedStrand).toBe(STRAND_TYPE.SENSE);

    selectTool.exposedMousedownEntity(antisenseRenderers[0]);
    expect(SequenceRenderer.targetedStrand).toBe(STRAND_TYPE.ANTISENSE);
  });

  it('shift-click on the opposite row (a different column) combines sense and antisense into both', () => {
    const { senseRenderers, antisenseRenderers } =
      buildTwoPositionDuplex(editor);

    selectTool.exposedMousedownEntity(senseRenderers[0]);
    expect(SequenceRenderer.targetedStrand).toBe(STRAND_TYPE.SENSE);

    selectTool.exposedMousedownEntity(antisenseRenderers[1], true);
    expect(SequenceRenderer.targetedStrand).toBe('both');
  });

  it('shift-click on the opposite row (a different column) combines antisense and sense into both', () => {
    const { senseRenderers, antisenseRenderers } =
      buildTwoPositionDuplex(editor);

    selectTool.exposedMousedownEntity(antisenseRenderers[0]);
    expect(SequenceRenderer.targetedStrand).toBe(STRAND_TYPE.ANTISENSE);

    selectTool.exposedMousedownEntity(senseRenderers[1], true);
    expect(SequenceRenderer.targetedStrand).toBe('both');
  });

  it('shift-click on another column of the same row leaves the record unchanged', () => {
    const { senseRenderers } = buildTwoPositionDuplex(editor);

    selectTool.exposedMousedownEntity(senseRenderers[0]);
    expect(SequenceRenderer.targetedStrand).toBe(STRAND_TYPE.SENSE);

    selectTool.exposedMousedownEntity(senseRenderers[1], true);
    expect(SequenceRenderer.targetedStrand).toBe(STRAND_TYPE.SENSE);
  });

  it('clears the record on a mod-key (whole chain) click, letting the resolver derive from selection', () => {
    const { senseRenderers } = buildTwoPositionDuplex(editor);

    selectTool.exposedMousedownEntity(senseRenderers[0]);
    expect(SequenceRenderer.targetedStrand).toBe(STRAND_TYPE.SENSE);

    selectTool.exposedMousedownEntity(senseRenderers[0], false, true);

    // No explicit record remains, so the resolver derives from selection
    // state: only sense monomers of this chain got selected.
    expect(SequenceRenderer.targetedStrand).toBe(STRAND_TYPE.SENSE);
  });

  describe('destroy()', () => {
    // Editor.selectTool assigns the new tool to `this.tool` *before* calling
    // the old tool's destroy(), and `selectedTool` returns `this.tool` -- so
    // by the time the old SelectBase's destroy() runs, `selectedTool.name`
    // already reflects the tool being switched to. Mimic that here rather
    // than driving a real tool switch, which would need a working eraser
    // tool wired up.
    const stubSelectedToolName = (name: string) => {
      Object.defineProperty(editor, 'selectedTool', {
        configurable: true,
        get: () => ({ name }),
      });
    };

    it('preserves the record when destroyed while switching to the eraser tool, matching the preserved selection', () => {
      const { senseRenderers } = buildTwoPositionDuplex(editor);

      selectTool.exposedMousedownEntity(senseRenderers[0]);
      expect(SequenceRenderer.targetedStrand).toBe(STRAND_TYPE.SENSE);
      expect(
        editor.drawingEntitiesManager.selectedEntitiesArr.length,
      ).toBeGreaterThan(0);

      stubSelectedToolName('eraser-tool');
      selectTool.destroy();

      // The eraser-tool exception keeps the selection alive; the record
      // describing that selection must stay alive with it.
      expect(
        editor.drawingEntitiesManager.selectedEntitiesArr.length,
      ).toBeGreaterThan(0);
      expect(SequenceRenderer.targetedStrand).toBe(STRAND_TYPE.SENSE);
    });

    it('clears the record when destroyed while switching to a non-eraser tool, matching the cleared selection', () => {
      const { senseRenderers } = buildTwoPositionDuplex(editor);

      selectTool.exposedMousedownEntity(senseRenderers[0]);
      expect(SequenceRenderer.targetedStrand).toBe(STRAND_TYPE.SENSE);

      stubSelectedToolName('some-other-tool');
      selectTool.destroy();

      expect(editor.drawingEntitiesManager.selectedEntitiesArr).toHaveLength(0);
      // No explicit record remains, so the resolver derives from (now
      // empty) selection state: neither row is selected, so it falls back
      // to sense.
      expect(SequenceRenderer.targetedStrand).toBe(STRAND_TYPE.SENSE);
    });
  });
});
