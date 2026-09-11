import { CoreEditor } from 'application/editor';
import { Vec2 } from 'domain/entities';
import { Nucleotide } from 'domain/entities/Nucleotide';
import type { RNABase } from 'domain/entities/RNABase';
import type { Sugar } from 'domain/entities/Sugar';
import { AttachmentPointName } from 'domain/types';
import {
  getNextMonomerInChain,
  getSugarFromRnaBase,
} from 'domain/helpers/monomers';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../helpers/dom';

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

const selectAllMonomers = (editor: CoreEditor) => {
  editor.drawingEntitiesManager.selectDrawingEntities([
    ...editor.drawingEntitiesManager.monomers.values(),
  ]);
};

describe('antisense chain direction', () => {
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
    canvas.remove();
  });

  it('runs an antisense chain in the opposite direction to the sense chain', () => {
    const drawingEntitiesManager = editor.drawingEntitiesManager;
    const firstNucleotide = Nucleotide.createOnCanvas('A', new Vec2(0, 0)).node;
    const secondNucleotide = Nucleotide.createOnCanvas(
      'C',
      new Vec2(1.6, 0),
    ).node;

    drawingEntitiesManager.createPolymerBond(
      firstNucleotide.phosphate,
      secondNucleotide.sugar,
      AttachmentPointName.R2,
      AttachmentPointName.R1,
    );
    selectAllMonomers(editor);
    drawingEntitiesManager.createAntisenseChain(false);

    const senseSugar = firstNucleotide.sugar;
    // The second sense nucleotide's paired antisense base is the chain-start
    // (5') end of the antisense strand: it is the one with a "next" neighbor,
    // whereas the antisense partner of the first sense nucleotide is the
    // chain-end (3') node with no "next" neighbor.
    const pairedSenseSugar = secondNucleotide.sugar;
    const antisenseBase = pairedSenseSugar.hydrogenBonds.length
      ? pairedSenseSugar.hydrogenBonds[0].getAnotherMonomer(pairedSenseSugar)
      : secondNucleotide.rnaBase.hydrogenBonds[0].getAnotherMonomer(
          secondNucleotide.rnaBase,
        );
    const antisenseSugar = getSugarFromRnaBase(antisenseBase as RNABase);

    expect(antisenseSugar).toBeDefined();

    const senseNext = getNextMonomerInChain(senseSugar);
    const antisenseNext = getNextMonomerInChain(antisenseSugar as Sugar);

    // The sense strand advances to the right; the antisense strand advances
    // to the left, which is why display order and chain order disagree.
    expect(senseNext?.position.x).toBeGreaterThan(senseSugar.position.x);
    expect(antisenseNext?.position.x).toBeLessThan(
      (antisenseSugar as Sugar).position.x,
    );
  });
});
