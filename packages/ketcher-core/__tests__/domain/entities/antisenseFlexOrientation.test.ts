import { CoreEditor } from 'application/editor';
import { MACROMOLECULES_BOND_TYPES } from 'application/editor/tools/types';
import { Vec2 } from 'domain/entities';
import type { BaseMonomer } from 'domain/entities/BaseMonomer';
import { Nucleotide } from 'domain/entities/Nucleotide';
import { PolymerBond } from 'domain/entities/PolymerBond';
import { AttachmentPointName } from 'domain/types';
import { chemMonomerItem, peptideMonomerItem } from '../../mock-data';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../helpers/dom';

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

const addPeptide = (editor: CoreEditor, position: Vec2) =>
  editor.drawingEntitiesManager.addMonomer(peptideMonomerItem, position)
    .operations[0].monomer as BaseMonomer;

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

const allMonomersOf = (editor: CoreEditor) => [
  ...editor.drawingEntitiesManager.monomers.values(),
];

const executeCommand = (
  command: ReturnType<
    typeof CoreEditor.prototype.drawingEntitiesManager.applyCanonicalAntisenseOrientation
  >,
) => {
  command.operations.forEach((operation) =>
    operation.execute(undefined as never),
  );
  return command;
};

const normalizeFlexOrientation = (
  editor: CoreEditor,
  monomers = allMonomersOf(editor),
) => {
  editor.drawingEntitiesManager.recalculateAntisenseChains(true, true);
  return executeCommand(
    editor.drawingEntitiesManager.applyCanonicalAntisenseOrientation(monomers),
  );
};

describe('Flex mode: canonical paired-RNA orientation', () => {
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

  it('normalizes a mirrored paired RNA duplex into the canonical orientation', () => {
    const {
      senseFivePrime,
      senseThreePrime,
      antisenseFivePrime,
      antisenseThreePrime,
    } = buildMirroredDuplex(editor);

    normalizeFlexOrientation(editor);

    expect(senseFivePrime.sugar.position.x).toBeLessThan(
      senseThreePrime.sugar.position.x,
    );
    expect(senseFivePrime.sugar.position.y).toBeLessThan(
      antisenseFivePrime.sugar.position.y,
    );
    expect(antisenseThreePrime.sugar.position.x).toBeLessThan(
      antisenseFivePrime.sugar.position.x,
    );
    expect(senseFivePrime.sugar.position.x).toBeCloseTo(
      antisenseThreePrime.sugar.position.x,
    );
    expect(
      senseFivePrime.rnaBase.hydrogenBonds[0].getAnotherMonomer(
        senseFivePrime.rnaBase,
      ),
    ).toBe(antisenseThreePrime.rnaBase);
    expect(
      senseThreePrime.rnaBase.hydrogenBonds[0].getAnotherMonomer(
        senseThreePrime.rnaBase,
      ),
    ).toBe(antisenseFivePrime.rnaBase);
  });

  it('produces the same canonical orientation regardless of the monomers array order', () => {
    const { senseFivePrime, senseThreePrime, antisenseFivePrime } =
      buildMirroredDuplex(editor);
    const reversedMonomers = [...allMonomersOf(editor)].reverse();

    normalizeFlexOrientation(editor, reversedMonomers);

    expect(senseFivePrime.sugar.position.x).toBeLessThan(
      senseThreePrime.sugar.position.x,
    );
    expect(senseFivePrime.sugar.position.y).toBeLessThan(
      antisenseFivePrime.sugar.position.y,
    );
  });

  it('is idempotent: normalizing an already-canonical duplex again is a no-op', () => {
    const {
      senseFivePrime,
      senseThreePrime,
      antisenseFivePrime,
      antisenseThreePrime,
    } = buildMirroredDuplex(editor);

    normalizeFlexOrientation(editor);

    const positionsAfterFirstPass = allMonomersOf(editor).map((monomer) => ({
      monomer,
      position: new Vec2(monomer.position.x, monomer.position.y),
    }));

    const secondPassCommand = normalizeFlexOrientation(editor);

    expect(secondPassCommand.operations.length).toBe(0);
    positionsAfterFirstPass.forEach(({ monomer, position }) => {
      expect(monomer.position.x).toBeCloseTo(position.x);
      expect(monomer.position.y).toBeCloseTo(position.y);
    });

    expect(senseFivePrime.sugar.position.x).toBeLessThan(
      senseThreePrime.sugar.position.x,
    );
    expect(senseFivePrime.sugar.position.y).toBeLessThan(
      antisenseFivePrime.sugar.position.y,
    );
    expect(antisenseThreePrime.sugar.position.x).toBeLessThan(
      antisenseFivePrime.sugar.position.x,
    );
  });

  it('keeps a peptide attached to the RNA duplex after normalization', () => {
    const { senseThreePrime } = buildMirroredDuplex(editor);
    const peptide = addPeptide(editor, new Vec2(8, 5));

    editor.drawingEntitiesManager.createPolymerBond(
      senseThreePrime.phosphate,
      peptide,
      AttachmentPointName.R2,
      AttachmentPointName.R1,
    );

    const distanceBefore = Vec2.diff(
      peptide.position,
      senseThreePrime.phosphate.position,
    );

    normalizeFlexOrientation(editor);

    const r2Bond = senseThreePrime.phosphate.attachmentPointsToBonds.R2;
    expect(
      r2Bond instanceof PolymerBond &&
        r2Bond.getAnotherMonomer(senseThreePrime.phosphate),
    ).toBe(peptide);

    const distanceAfter = Vec2.diff(
      peptide.position,
      senseThreePrime.phosphate.position,
    );
    expect(Math.abs(distanceAfter.x)).toBeCloseTo(Math.abs(distanceBefore.x));
    expect(Math.abs(distanceAfter.y)).toBeCloseTo(Math.abs(distanceBefore.y));
  });

  it('does not move a micromolecule-fragment monomer alongside the duplex (regression: ketcher-3.10.0-bugs "Arrange as a Ring")', () => {
    buildMirroredDuplex(editor);
    const fragment = editor.drawingEntitiesManager.addMonomer(
      {
        ...chemMonomerItem,
        props: { ...chemMonomerItem.props, isMicromoleculeFragment: true },
      },
      new Vec2(20, 20),
    ).operations[0].monomer as BaseMonomer;
    const fragmentPositionBefore = new Vec2(
      fragment.position.x,
      fragment.position.y,
    );

    expect(() => normalizeFlexOrientation(editor)).not.toThrow();

    expect(fragment.position.x).toBeCloseTo(fragmentPositionBefore.x);
    expect(fragment.position.y).toBeCloseTo(fragmentPositionBefore.y);
  });

  it('does not rearrange an unpaired single RNA chain', () => {
    const senseFivePrime = createNucleotide('A', new Vec2(6, 5));
    const senseThreePrime = createNucleotide('U', new Vec2(3, 5));
    connectFivePrimeToThreePrime(editor, senseFivePrime, senseThreePrime);

    const positionsBefore = allMonomersOf(editor).map((monomer) => ({
      monomer,
      position: new Vec2(monomer.position.x, monomer.position.y),
    }));

    const command = normalizeFlexOrientation(editor);

    expect(command.operations.length).toBe(0);
    positionsBefore.forEach(({ monomer, position }) => {
      expect(monomer.position.x).toBeCloseTo(position.x);
      expect(monomer.position.y).toBeCloseTo(position.y);
    });
  });

  it('does not rearrange a peptide-only structure', () => {
    const firstPeptide = addPeptide(editor, new Vec2(0, 0));
    const secondPeptide = addPeptide(editor, new Vec2(3, 0));
    editor.drawingEntitiesManager.createPolymerBond(
      firstPeptide,
      secondPeptide,
      AttachmentPointName.R2,
      AttachmentPointName.R1,
    );

    const command = normalizeFlexOrientation(editor);

    expect(command.operations.length).toBe(0);
    expect(firstPeptide.position).toEqual(new Vec2(0, 0));
    expect(secondPeptide.position).toEqual(new Vec2(3, 0));
  });

  it('does not re-apply canonical orientation on an ordinary Flex mode re-entry (manual layout preserved)', () => {
    buildMirroredDuplex(editor);
    normalizeFlexOrientation(editor);

    const [monomerToMoveManually] = allMonomersOf(editor);
    const manualPosition = new Vec2(42, 42);
    monomerToMoveManually.moveRelative(
      Vec2.diff(manualPosition, monomerToMoveManually.position),
    );

    editor.drawingEntitiesManager.recalculateAntisenseChains();

    expect(monomerToMoveManually.position.x).toBeCloseTo(manualPosition.x);
    expect(monomerToMoveManually.position.y).toBeCloseTo(manualPosition.y);
  });
});

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

    editor.drawingEntitiesManager.recalculateAntisenseChains(true, true);

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

    editor.drawingEntitiesManager.recalculateAntisenseChains(true, true);
    const firstResult = chainAFivePrime.sugar.monomerItem.isSense;

    editor.drawingEntitiesManager.recalculateAntisenseChains(true, true);
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
