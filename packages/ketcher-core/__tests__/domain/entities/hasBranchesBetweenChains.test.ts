import { CoreEditor } from 'application/editor';
import { MACROMOLECULES_BOND_TYPES } from 'application/editor/tools/types';
import { KetMonomerClass } from 'domain/constants/monomers';
import { type BaseMonomer, Vec2 } from 'domain/entities';
import { Nucleotide } from 'domain/entities/Nucleotide';
import { AttachmentPointName } from 'domain/types';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../helpers/dom';

globalThis.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

SVGElement.prototype.getBBox = jest.fn().mockReturnValue({
  x: 0,
  y: 0,
  width: 12,
  height: 12,
});

const { R1, R2, R3 } = AttachmentPointName;

describe('DrawingEntitiesManager.hasBranchesBetweenChains', () => {
  let canvas: SVGSVGElement;
  let editor: CoreEditor;

  const addCysteine = (x: number, y = 0) => {
    const libraryItem = editor.monomersLibrary.find(
      (item) =>
        item.label === 'C' &&
        item.props?.MonomerClass === KetMonomerClass.AminoAcid,
    );

    if (!libraryItem) {
      throw new Error('Cysteine library item not found');
    }

    return editor.drawingEntitiesManager.addMonomer(libraryItem, new Vec2(x, y))
      .operations[0].monomer as BaseMonomer;
  };

  const connect = (
    first: BaseMonomer,
    second: BaseMonomer,
    firstAttachmentPoint: AttachmentPointName,
    secondAttachmentPoint: AttachmentPointName,
  ) => {
    editor.drawingEntitiesManager.createPolymerBond(
      first,
      second,
      firstAttachmentPoint,
      secondAttachmentPoint,
    );
  };

  const addChain = (y: number, length: number) => {
    const monomers = Array.from({ length }, (_, index) =>
      addCysteine(index * 2, y),
    );

    monomers.slice(1).forEach((monomer, index) => {
      connect(monomers[index], monomer, R2, R1);
    });

    return monomers;
  };

  beforeEach(() => {
    canvas = createPolymerEditorCanvas();
    editor = new CoreEditor({
      canvas,
      theme: {},
      renderersContainer: createRenderersManager(),
    });
  });

  afterEach(() => {
    canvas.remove();
  });

  it('detects a chain attached to the side of another chain', () => {
    const [, middle] = addChain(0, 3);
    const [side] = addChain(5, 1);

    connect(side, middle, R2, R3);

    expect(editor.drawingEntitiesManager.hasBranchesBetweenChains()).toBe(true);
  });

  it('detects an R1-R1 connection between chains', () => {
    const [firstChainStart] = addChain(0, 2);
    const [secondChainStart] = addChain(5, 2);

    connect(firstChainStart, secondChainStart, R1, R1);

    expect(editor.drawingEntitiesManager.hasBranchesBetweenChains()).toBe(true);
  });

  it('ignores a link inside one chain', () => {
    const monomers = addChain(0, 5);

    connect(monomers[1], monomers[3], R3, R3);

    expect(editor.drawingEntitiesManager.hasBranchesBetweenChains()).toBe(
      false,
    );
  });

  it('ignores chains that are not connected', () => {
    addChain(0, 3);
    addChain(5, 2);

    expect(editor.drawingEntitiesManager.hasBranchesBetweenChains()).toBe(
      false,
    );
  });

  it('ignores a hydrogen bond between chains', () => {
    const [firstChainStart] = addChain(0, 2);
    const [secondChainStart] = addChain(5, 2);

    editor.drawingEntitiesManager.createPolymerBond(
      firstChainStart,
      secondChainStart,
      AttachmentPointName.HYDROGEN,
      AttachmentPointName.HYDROGEN,
      MACROMOLECULES_BOND_TYPES.HYDROGEN,
    );

    expect(editor.drawingEntitiesManager.hasBranchesBetweenChains()).toBe(
      false,
    );
  });

  it('ignores the sugar-base bond of a nucleotide', () => {
    Nucleotide.createOnCanvas('A', new Vec2(0, 0));

    expect(editor.drawingEntitiesManager.hasBranchesBetweenChains()).toBe(
      false,
    );
  });
});
