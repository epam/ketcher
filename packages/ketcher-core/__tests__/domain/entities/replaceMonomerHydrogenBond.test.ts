import { CoreEditor } from 'application/editor';
import { Vec2 } from 'domain/entities';
import { Nucleotide } from 'domain/entities/Nucleotide';
import { HydrogenBond } from 'domain/entities/HydrogenBond';
import { replaceMonomer } from 'domain/entities/DrawingEntitiesManager.replaceMonomer';
import { KetMonomerClass } from 'domain/constants/monomers';
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

describe('replaceMonomer with hydrogen bonds', () => {
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

  it('keeps a hydrogen bond a hydrogen bond after replacement', () => {
    Nucleotide.createOnCanvas('A', new Vec2(0, 0));
    editor.drawingEntitiesManager.selectDrawingEntities([
      ...editor.drawingEntitiesManager.monomers.values(),
    ]);
    editor.drawingEntitiesManager.createAntisenseChain(false);

    const senseBase = [...editor.drawingEntitiesManager.monomers.values()].find(
      (monomer) => monomer.label === 'A' && monomer.hydrogenBonds.length === 1,
    );

    if (!senseBase) {
      throw new Error('Sense base with a hydrogen bond not found');
    }

    const partner = senseBase.hydrogenBonds[0].getAnotherMonomer(senseBase);
    const newBaseItem = editor.monomersLibrary.find(
      (item) =>
        !('isAmbiguous' in item && item.isAmbiguous) &&
        item.label === 'C' &&
        item.props?.MonomerClass === KetMonomerClass.Base,
    );

    if (!newBaseItem || !partner) {
      throw new Error('Fixture setup failed');
    }

    replaceMonomer(editor.drawingEntitiesManager, senseBase, newBaseItem);

    expect(partner.hydrogenBonds).toHaveLength(1);
    expect(partner.hydrogenBonds[0]).toBeInstanceOf(HydrogenBond);
    expect(partner.attachmentPointsToBonds.hydrogen).toBeUndefined();
  });
});
