import { CoreEditor } from 'application/editor';
import { MACROMOLECULES_BOND_TYPES } from 'application/editor/tools/types';
import { Vec2 } from 'domain/entities';
import type { BaseMonomer } from 'domain/entities/BaseMonomer';
import { Nucleotide } from 'domain/entities/Nucleotide';
import { AttachmentPointName, type MonomerItemType } from 'domain/types';
import { peptideMonomerItem } from '../../mock-data';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../helpers/dom';

const peptideWithAttachmentPointsMonomerItem: MonomerItemType = {
  ...peptideMonomerItem,
  attachmentPoints: [
    { attachmentAtom: 0, leavingGroup: { atoms: [] }, type: 'left' },
    { attachmentAtom: 0, leavingGroup: { atoms: [] }, type: 'right' },
  ],
};

global.ResizeObserver = jest.fn().mockImplementation(() => ({
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

const createNucleotide = (base: string, position: Vec2) =>
  Nucleotide.createOnCanvas(base, position).node;

const addPeptideWithAttachmentPoints = (editor: CoreEditor, position: Vec2) =>
  editor.drawingEntitiesManager.addMonomer(
    peptideWithAttachmentPointsMonomerItem,
    position,
  ).operations[0].monomer as BaseMonomer;

const connectFivePrimeToThreePrime = (
  editor: CoreEditor,
  fivePrimeNucleotide: ReturnType<typeof createNucleotide>,
  threePrimeNucleotide: ReturnType<typeof createNucleotide>,
) => {
  editor.drawingEntitiesManager.createPolymerBond(
    fivePrimeNucleotide.phosphate,
    threePrimeNucleotide.sugar,
    AttachmentPointName.R2,
    AttachmentPointName.R1,
  );
};

const pairBases = (
  editor: CoreEditor,
  senseNucleotide: ReturnType<typeof createNucleotide>,
  antisenseNucleotide: ReturnType<typeof createNucleotide>,
) => {
  editor.drawingEntitiesManager.createPolymerBond(
    senseNucleotide.rnaBase,
    antisenseNucleotide.rnaBase,
    AttachmentPointName.HYDROGEN,
    AttachmentPointName.HYDROGEN,
    MACROMOLECULES_BOND_TYPES.HYDROGEN,
  );
};

const buildMirroredDuplex = (editor: CoreEditor) => {
  const senseFivePrime = createNucleotide('A', new Vec2(6, 5));
  const senseThreePrime = createNucleotide('U', new Vec2(3, 5));
  connectFivePrimeToThreePrime(editor, senseFivePrime, senseThreePrime);

  const antisenseFivePrime = createNucleotide('G', new Vec2(3, 0));
  const antisenseThreePrime = createNucleotide('C', new Vec2(6, 0));
  connectFivePrimeToThreePrime(editor, antisenseFivePrime, antisenseThreePrime);

  pairBases(editor, senseFivePrime, antisenseThreePrime);
  pairBases(editor, senseThreePrime, antisenseFivePrime);

  return {
    senseFivePrime,
    senseThreePrime,
    antisenseFivePrime,
    antisenseThreePrime,
  };
};

describe('recalculateAntisenseChains: deterministic sense/antisense tie-break', () => {
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

  it('picks the chain created first as sense, even when raw coordinates would suggest the opposite', () => {
    const chainAFivePrime = createNucleotide('A', new Vec2(0, 10));
    const chainAThreePrime = createNucleotide('U', new Vec2(3, 10));
    connectFivePrimeToThreePrime(editor, chainAFivePrime, chainAThreePrime);

    const chainBFivePrime = createNucleotide('G', new Vec2(3, 0));
    const chainBThreePrime = createNucleotide('C', new Vec2(0, 0));
    connectFivePrimeToThreePrime(editor, chainBFivePrime, chainBThreePrime);

    pairBases(editor, chainAFivePrime, chainBThreePrime);
    pairBases(editor, chainAThreePrime, chainBFivePrime);

    editor.drawingEntitiesManager.recalculateAntisenseChains({
      needRecalculateOldAntisense: true,
      useStableSenseTieBreak: true,
    });

    expect(chainAFivePrime.sugar.monomerItem.isSense).toBe(true);
    expect(chainBFivePrime.sugar.monomerItem.isAntisense).toBe(true);
  });

  it('is deterministic across repeated recalculation of the same duplex', () => {
    const chainAFivePrime = createNucleotide('A', new Vec2(0, 10));
    const chainAThreePrime = createNucleotide('U', new Vec2(3, 10));
    connectFivePrimeToThreePrime(editor, chainAFivePrime, chainAThreePrime);

    const chainBFivePrime = createNucleotide('G', new Vec2(3, 0));
    const chainBThreePrime = createNucleotide('C', new Vec2(0, 0));
    connectFivePrimeToThreePrime(editor, chainBFivePrime, chainBThreePrime);

    pairBases(editor, chainAFivePrime, chainBThreePrime);
    pairBases(editor, chainAThreePrime, chainBFivePrime);

    editor.drawingEntitiesManager.recalculateAntisenseChains({
      needRecalculateOldAntisense: true,
      useStableSenseTieBreak: true,
    });
    const firstResult = chainAFivePrime.sugar.monomerItem.isSense;

    editor.drawingEntitiesManager.recalculateAntisenseChains({
      needRecalculateOldAntisense: true,
      useStableSenseTieBreak: true,
    });
    const secondResult = chainAFivePrime.sugar.monomerItem.isSense;

    expect(firstResult).toBe(true);
    expect(secondResult).toBe(true);
  });

  it('keeps the legacy bbox-based tie-break by default, for backward compatibility with non-Flex-initial-load callers (e.g. Sequence mode)', () => {
    const chainAFivePrime = createNucleotide('A', new Vec2(0, 10));
    const chainAThreePrime = createNucleotide('U', new Vec2(3, 10));
    connectFivePrimeToThreePrime(editor, chainAFivePrime, chainAThreePrime);

    const chainBFivePrime = createNucleotide('G', new Vec2(3, 0));
    const chainBThreePrime = createNucleotide('C', new Vec2(0, 0));
    connectFivePrimeToThreePrime(editor, chainBFivePrime, chainBThreePrime);

    pairBases(editor, chainAFivePrime, chainBThreePrime);
    pairBases(editor, chainAThreePrime, chainBFivePrime);

    editor.drawingEntitiesManager.recalculateAntisenseChains();

    expect(chainBFivePrime.sugar.monomerItem.isSense).toBe(true);
    expect(chainAFivePrime.sugar.monomerItem.isAntisense).toBe(true);
  });
});

describe('Open-style Flex mode import: attachments bonded to the duplex stay in line', () => {
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

  const applyOpenStyleFlexModeImportFlow = () => {
    editor.drawingEntitiesManager.recalculateAntisenseChains({
      needRecalculateOldAntisense: true,
      useStableSenseTieBreak: true,
    });

    if (!editor.drawingEntitiesManager.hasAntisenseChains) {
      return;
    }

    editor.renderersContainer.update(
      editor.drawingEntitiesManager.applySnakeLayout(true, true, true, false),
    );
  };

  it('keeps a peptide appended via R2->R1 to the sense chain in line with it (same reflow as paste)', () => {
    const { senseThreePrime } = buildMirroredDuplex(editor);
    const peptide = addPeptideWithAttachmentPoints(editor, new Vec2(50, 50));

    editor.drawingEntitiesManager.createPolymerBond(
      senseThreePrime.phosphate,
      peptide,
      AttachmentPointName.R2,
      AttachmentPointName.R1,
    );

    applyOpenStyleFlexModeImportFlow();

    expect(peptide.position.y).toBeCloseTo(
      senseThreePrime.phosphate.position.y,
    );
    expect(peptide.position.x).toBeGreaterThan(
      senseThreePrime.phosphate.position.x,
    );
  });
});
