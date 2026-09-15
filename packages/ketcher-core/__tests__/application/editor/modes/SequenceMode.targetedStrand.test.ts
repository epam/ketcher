import { CoreEditor, SequenceMode } from 'application/editor';
import { hotkeysConfiguration } from 'application/editor/editorEvents';
import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
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
} from '../../../helpers/dom';

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
// then renders both strands through SequenceRenderer. Modeled on
// buildTwoPositionDuplex in SelectBase.targetedStrand.test.ts. Returns the
// underlying monomers (not renderers) because `SequenceMode.initialize` --
// invoked by `turnOnEditMode`/`setAntisenseEditMode` -- rebuilds the
// sequence view model and destroys the previous renderer instances; a
// fresh renderer must be looked up via `SequenceRenderer.getRendererByMonomer`
// after any such call.
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

  return { senseNucleotides, antisenseNucleotides };
};

const rendererForMonomer = (nucleotide: Nucleotide) => {
  const renderer = nucleotide.rnaBase.renderer as unknown as
    BaseSequenceItemRenderer | undefined;

  if (!renderer) {
    throw new Error('Fixture setup failed: renderer not found for monomer');
  }

  return renderer;
};

const mousedownEventFor = (renderer: BaseSequenceItemRenderer) =>
  ({ target: { __data__: renderer } }) as unknown as MouseEvent;

describe('SequenceMode targeted strand recording', () => {
  let canvas: SVGSVGElement;
  let editor: CoreEditor;
  let mode: SequenceMode;

  beforeEach(() => {
    canvas = createPolymerEditorCanvas();
    stubCanvasDimensions(canvas);
    mode = new SequenceMode();
    editor = new CoreEditor({
      canvas,
      theme: {},
      renderersContainer: createRenderersManager(),
      mode,
    });
  });

  afterEach(() => {
    SequenceRenderer.resetTargetedStrand();
    canvas.remove();
  });

  describe('mousedownBetweenSequenceItems (entering edit mode)', () => {
    it('records sense when entering edit mode on a sense symbol', () => {
      const { senseNucleotides } = buildTwoPositionDuplex(editor);

      mode.mousedownBetweenSequenceItems(
        mousedownEventFor(rendererForMonomer(senseNucleotides[0])),
      );

      expect(SequenceRenderer.targetedStrand).toBe(STRAND_TYPE.SENSE);
    });

    it('records antisense when entering edit mode on an antisense symbol', () => {
      const { antisenseNucleotides } = buildTwoPositionDuplex(editor);

      mode.mousedownBetweenSequenceItems(
        mousedownEventFor(rendererForMonomer(antisenseNucleotides[0])),
      );

      expect(SequenceRenderer.targetedStrand).toBe(STRAND_TYPE.ANTISENSE);
    });
  });

  describe('mousedown drag inside edit mode', () => {
    // Enters edit mode via a first click (on the sense row). Returns the
    // underlying nucleotide nodes rather than renderers: every call that
    // goes through `setAntisenseEditMode` (including `mousedown` itself)
    // calls `SequenceMode#initialize`, which rebuilds the sequence view
    // model and destroys the previous renderer instances. A fresh renderer
    // must therefore be looked up via `rendererForMonomer` immediately
    // before each simulated event, never cached across such a call.
    const enterEditMode = (editorInstance: CoreEditor) => {
      const { senseNucleotides, antisenseNucleotides } =
        buildTwoPositionDuplex(editorInstance);

      mode.mousedownBetweenSequenceItems(
        mousedownEventFor(rendererForMonomer(senseNucleotides[0])),
      );
      SequenceRenderer.resetTargetedStrand();

      return { senseNucleotides, antisenseNucleotides };
    };

    it('records the row a drag starts on, after the unselect that begins the gesture (mousedown, sense row)', () => {
      const { senseNucleotides } = enterEditMode(editor);

      mode.mousedown(
        mousedownEventFor(rendererForMonomer(senseNucleotides[0])),
      );

      expect(SequenceRenderer.targetedStrand).toBe(STRAND_TYPE.SENSE);
    });

    it('records the row a drag starts on, after the unselect that begins the gesture (mousedown, antisense row)', () => {
      const { antisenseNucleotides } = enterEditMode(editor);

      mode.mousedown(
        mousedownEventFor(rendererForMonomer(antisenseNucleotides[0])),
      );

      expect(SequenceRenderer.targetedStrand).toBe(STRAND_TYPE.ANTISENSE);
    });

    // This is the case flagged as most likely to be wrong: `mousemove`
    // clears the record via `unselectAllEntities()` on every tick before
    // re-selecting the whole caret range (which spans both strands via
    // `getMonomersByCaretPositionRange`). A record written once at
    // mousedown does NOT survive the first tick -- the write must be
    // re-applied inside `mousemove`, after that clear, every time.
    it('re-applies the drag row on every mousemove tick, surviving the unselect that resets the record', () => {
      const { senseNucleotides, antisenseNucleotides } = enterEditMode(editor);

      mode.mousedown(
        mousedownEventFor(rendererForMonomer(senseNucleotides[0])),
      );
      expect(SequenceRenderer.targetedStrand).toBe(STRAND_TYPE.SENSE);

      // mousemove's selection-changing branch only runs once
      // `mousemoveCounter > 1`, i.e. from the 3rd call onward -- the first
      // two calls only increment the counter. Each call re-fetches the
      // renderer fresh (see `enterEditMode`'s comment).
      for (let tick = 0; tick < 3; tick++) {
        mode.mousemove(
          mousedownEventFor(rendererForMonomer(antisenseNucleotides[1])),
        );
      }

      // Sanity check that this tick really did select both strands (the
      // range helper selects both, per brief Step 2) -- so the assertion
      // below is only meaningful because of the explicit record, not
      // because the resolver's selection-derived fallback happens to agree.
      expect(
        editor.drawingEntitiesManager.selectedEntitiesArr.some(
          (entity) =>
            'monomerItem' in entity &&
            (entity as unknown as { monomerItem: { isAntisense?: boolean } })
              .monomerItem.isAntisense,
        ),
      ).toBe(true);

      expect(SequenceRenderer.targetedStrand).toBe(STRAND_TYPE.SENSE);
    });

    it('re-applies the antisense drag row on every mousemove tick', () => {
      const { senseNucleotides, antisenseNucleotides } = enterEditMode(editor);

      mode.mousedown(
        mousedownEventFor(rendererForMonomer(antisenseNucleotides[0])),
      );
      expect(SequenceRenderer.targetedStrand).toBe(STRAND_TYPE.ANTISENSE);

      for (let tick = 0; tick < 3; tick++) {
        mode.mousemove(
          mousedownEventFor(rendererForMonomer(senseNucleotides[1])),
        );
      }

      expect(SequenceRenderer.targetedStrand).toBe(STRAND_TYPE.ANTISENSE);
    });
  });

  describe('shiftArrowSelectionInEditMode', () => {
    // Sets the caret-location flag directly, mirroring the pattern used in
    // antisenseChainDirection.test.ts's setEditModes: going through
    // setAntisenseEditMode()/turnOnAntisenseEditMode() would call
    // SequenceMode#initialize and rebuild the renderers this test already
    // captured monomer references for (moot here, but kept consistent).
    const setAntisenseEditModeFlag = (value: boolean) => {
      (
        mode as unknown as { _isAntisenseEditMode: boolean }
      )._isAntisenseEditMode = value;
    };

    const arrowRightEvent = { code: 'ArrowRight' } as KeyboardEvent;

    it('records sense when the caret is on the sense row', () => {
      buildTwoPositionDuplex(editor);
      SequenceRenderer.setCaretPosition(0);
      setAntisenseEditModeFlag(false);

      SequenceRenderer.shiftArrowSelectionInEditMode(arrowRightEvent);

      expect(SequenceRenderer.targetedStrand).toBe(STRAND_TYPE.SENSE);
    });

    it('records antisense when the caret is on the antisense row, even though both strands get selected', () => {
      buildTwoPositionDuplex(editor);
      SequenceRenderer.setCaretPosition(0);
      setAntisenseEditModeFlag(true);

      SequenceRenderer.shiftArrowSelectionInEditMode(arrowRightEvent);

      // getShiftArrowChanges selects both the sense and antisense monomer
      // of the touched column, so without the explicit record the resolver
      // would derive 'both' from selection state.
      expect(
        editor.drawingEntitiesManager.selectedEntitiesArr.length,
      ).toBeGreaterThan(1);
      expect(SequenceRenderer.targetedStrand).toBe(STRAND_TYPE.ANTISENSE);
    });
  });

  describe('select-all', () => {
    it('records both strands', () => {
      buildTwoPositionDuplex(editor);

      hotkeysConfiguration['select-all'].handler(editor);

      expect(SequenceRenderer.targetedStrand).toBe('both');
    });
  });
});
