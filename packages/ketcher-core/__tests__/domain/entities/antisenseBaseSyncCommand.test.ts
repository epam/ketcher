import { CoreEditor } from 'application/editor';
import { type BaseMonomer, Vec2 } from 'domain/entities';
import { Nucleotide } from 'domain/entities/Nucleotide';
import {
  getHydrogenBondedPartner,
  isBaseEligibleForDuplexSync,
  isSelectedAntisensePair,
} from 'domain/helpers/antisenseBaseSync';
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

export const buildDuplex = (editor: CoreEditor, senseBaseLabel: string) => {
  Nucleotide.createOnCanvas(senseBaseLabel, new Vec2(0, 0));
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

  return { senseBase, antisenseBase };
};

describe('duplex traversal', () => {
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

  it('finds the hydrogen bonded partner of a sense base', () => {
    const { senseBase, antisenseBase } = buildDuplex(editor, 'A');

    expect(getHydrogenBondedPartner(senseBase)).toBe(antisenseBase);
    expect(getHydrogenBondedPartner(antisenseBase)).toBe(senseBase);
  });

  it('treats a base on a sugar with a backbone connection as eligible', () => {
    const { senseBase } = buildDuplex(editor, 'A');

    expect(isBaseEligibleForDuplexSync(senseBase)).toBe(true);
  });

  it('reports a pair as selected only when both sides are selected', () => {
    const { senseBase, antisenseBase } = buildDuplex(editor, 'A');

    editor.drawingEntitiesManager.selectDrawingEntities([senseBase]);
    expect(isSelectedAntisensePair(senseBase)).toBe(false);

    editor.drawingEntitiesManager.selectDrawingEntities([
      senseBase,
      antisenseBase,
    ]);
    expect(isSelectedAntisensePair(senseBase)).toBe(true);
  });
});
