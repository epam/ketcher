import { CoreEditor } from 'application/editor';
import { SequenceRenderer } from 'application/render/renderers/sequence/SequenceRenderer';
import { ChainsCollection } from 'domain/entities/monomer-chains/ChainsCollection';
import { type BaseMonomer, Vec2 } from 'domain/entities';
import { Nucleotide } from 'domain/entities/Nucleotide';
import { STRAND_TYPE } from 'domain/constants';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../../../helpers/dom';

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

// Renders the current monomers through SequenceRenderer so the resolver's
// selection-derived branch has a real two-stranded snapshot to walk. Modeled
// on buildDuplex/rerenderSequence in antisenseBaseSyncCommand.test.ts and
// antisenseChainDirection.test.ts.
const showCurrentMonomersInSequenceLayout = (editor: CoreEditor) => {
  const chainsCollection = ChainsCollection.fromMonomers([
    ...editor.drawingEntitiesManager.monomers.values(),
  ]);

  chainsCollection.rearrange();
  SequenceRenderer.show(chainsCollection);
};

// Builds a single-position duplex (one sense base hydrogen bonded to one
// antisense base) and renders it, returning both monomers unselected.
const buildDuplex = (editor: CoreEditor) => {
  Nucleotide.createOnCanvas('A', new Vec2(0, 0));
  editor.drawingEntitiesManager.selectDrawingEntities([
    ...editor.drawingEntitiesManager.monomers.values(),
  ]);
  editor.drawingEntitiesManager.createAntisenseChain(false);

  const senseBase = [...editor.drawingEntitiesManager.monomers.values()].find(
    (monomer) =>
      monomer.monomerItem.isSense && monomer.hydrogenBonds.length === 1,
  ) as BaseMonomer;
  const antisenseBase = [
    ...editor.drawingEntitiesManager.monomers.values(),
  ].find(
    (monomer) =>
      monomer.monomerItem.isAntisense && monomer.hydrogenBonds.length === 1,
  ) as BaseMonomer;

  editor.drawingEntitiesManager.unselectAllDrawingEntities();
  showCurrentMonomersInSequenceLayout(editor);

  return { senseBase, antisenseBase };
};

describe('SequenceRenderer.targetedStrand', () => {
  let canvas: SVGSVGElement;
  let editor: CoreEditor;

  beforeEach(() => {
    canvas = createPolymerEditorCanvas();
    stubCanvasDimensions(canvas);
    editor = new CoreEditor({
      canvas,
      theme: {},
      renderersContainer: createRenderersManager(),
    });
  });

  afterEach(() => {
    SequenceRenderer.resetTargetedStrand();
    canvas.remove();
  });

  it('returns the explicit sense record even though the antisense monomer is selected', () => {
    const { antisenseBase } = buildDuplex(editor);
    editor.drawingEntitiesManager.selectDrawingEntities([antisenseBase]);

    SequenceRenderer.setTargetedStrand(STRAND_TYPE.SENSE);

    expect(SequenceRenderer.targetedStrand).toBe(STRAND_TYPE.SENSE);
  });

  it('returns the explicit antisense record even though the sense monomer is selected', () => {
    const { senseBase } = buildDuplex(editor);
    editor.drawingEntitiesManager.selectDrawingEntities([senseBase]);

    SequenceRenderer.setTargetedStrand(STRAND_TYPE.ANTISENSE);

    expect(SequenceRenderer.targetedStrand).toBe(STRAND_TYPE.ANTISENSE);
  });

  it('returns "both" for an explicit both record', () => {
    const { senseBase } = buildDuplex(editor);
    editor.drawingEntitiesManager.selectDrawingEntities([senseBase]);

    SequenceRenderer.setTargetedStrand('both');

    expect(SequenceRenderer.targetedStrand).toBe('both');
  });

  it('derives sense from selection state when no record exists and only the sense monomer is selected', () => {
    const { senseBase } = buildDuplex(editor);
    editor.drawingEntitiesManager.selectDrawingEntities([senseBase]);

    expect(SequenceRenderer.targetedStrand).toBe(STRAND_TYPE.SENSE);
  });

  it('derives both from selection state when no record exists and monomers on both rows are selected', () => {
    const { senseBase, antisenseBase } = buildDuplex(editor);
    editor.drawingEntitiesManager.selectDrawingEntities([
      senseBase,
      antisenseBase,
    ]);

    expect(SequenceRenderer.targetedStrand).toBe('both');
  });

  it('falls back to derivation after the record is reset', () => {
    const { senseBase, antisenseBase } = buildDuplex(editor);
    editor.drawingEntitiesManager.selectDrawingEntities([
      senseBase,
      antisenseBase,
    ]);

    SequenceRenderer.setTargetedStrand(STRAND_TYPE.SENSE);
    expect(SequenceRenderer.targetedStrand).toBe(STRAND_TYPE.SENSE);

    SequenceRenderer.resetTargetedStrand();

    expect(SequenceRenderer.targetedStrand).toBe('both');
  });
});
