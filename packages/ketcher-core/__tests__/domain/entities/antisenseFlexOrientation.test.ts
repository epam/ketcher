import { CoreEditor } from 'application/editor';
import { MACROMOLECULES_BOND_TYPES } from 'application/editor/tools/types';
import { Vec2 } from 'domain/entities';
import type { BaseMonomer } from 'domain/entities/BaseMonomer';
import { Nucleotide } from 'domain/entities/Nucleotide';
import { Nucleoside } from 'domain/entities/Nucleoside';
import { PolymerBond } from 'domain/entities/PolymerBond';
import { AttachmentPointName, type MonomerItemType } from 'domain/types';
import { chemMonomerItem, peptideMonomerItem } from '../../mock-data';
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

type NucleotideOrNucleoside = Nucleotide | Nucleoside;

const addPeptide = (editor: CoreEditor, position: Vec2) =>
  editor.drawingEntitiesManager.addMonomer(peptideMonomerItem, position)
    .operations[0].monomer as BaseMonomer;

const addPeptideWithAttachmentPoints = (editor: CoreEditor, position: Vec2) =>
  editor.drawingEntitiesManager.addMonomer(
    peptideWithAttachmentPointsMonomerItem,
    position,
  ).operations[0].monomer as BaseMonomer;

const connectFivePrimeToThreePrime = (
  editor: CoreEditor,
  fivePrimeNucleotide: Nucleotide,
  threePrimeNucleotide: NucleotideOrNucleoside,
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
  senseNucleotide: NucleotideOrNucleoside,
  antisenseNucleotide: NucleotideOrNucleoside,
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
  editor.drawingEntitiesManager.recalculateAntisenseChains({
    needRecalculateOldAntisense: true,
    useStableSenseTieBreak: true,
  });
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

  const applyOpenStyleFlexModeImportFlow = (
    monomers = allMonomersOf(editor),
  ) => {
    editor.drawingEntitiesManager.recalculateAntisenseChains({
      needRecalculateOldAntisense: true,
      useStableSenseTieBreak: true,
    });
    executeCommand(
      editor.drawingEntitiesManager.applyCanonicalAntisenseOrientation(
        monomers,
      ),
    );
    return executeCommand(
      editor.drawingEntitiesManager.realignChainsAttachedOutsideDuplex(
        monomers,
      ),
    );
  };

  it('keeps a peptide appended via R2->R1 to the sense chain in line with it', () => {
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

  it('keeps a peptide appended via R2->R1 to a sugar with no trailing phosphate (Nucleoside) in line', () => {
    const senseFivePrime = createNucleotide('A', new Vec2(6, 5));
    const senseThreePrime = Nucleoside.createOnCanvas('U', new Vec2(3, 5)).node;
    connectFivePrimeToThreePrime(editor, senseFivePrime, senseThreePrime);

    const antisenseFivePrime = createNucleotide('G', new Vec2(3, 0));
    const antisenseThreePrime = createNucleotide('C', new Vec2(6, 0));
    connectFivePrimeToThreePrime(
      editor,
      antisenseFivePrime,
      antisenseThreePrime,
    );

    pairBases(editor, senseFivePrime, antisenseThreePrime);
    pairBases(editor, senseThreePrime, antisenseFivePrime);

    const peptide = addPeptideWithAttachmentPoints(editor, new Vec2(50, 50));

    editor.drawingEntitiesManager.createPolymerBond(
      senseThreePrime.sugar,
      peptide,
      AttachmentPointName.R2,
      AttachmentPointName.R1,
    );

    applyOpenStyleFlexModeImportFlow();

    expect(peptide.position.y).toBeCloseTo(senseThreePrime.sugar.position.y);
    expect(peptide.position.x).toBeGreaterThan(
      senseThreePrime.sugar.position.x,
    );
  });

  it('lines up a chain appended via R2->R1 (attached before the anchor) on the opposite side', () => {
    const { senseFivePrime } = buildMirroredDuplex(editor);
    const peptide = addPeptideWithAttachmentPoints(editor, new Vec2(-50, -50));

    editor.drawingEntitiesManager.createPolymerBond(
      peptide,
      senseFivePrime.sugar,
      AttachmentPointName.R2,
      AttachmentPointName.R1,
    );

    applyOpenStyleFlexModeImportFlow();

    expect(peptide.position.y).toBeCloseTo(senseFivePrime.sugar.position.y);
    expect(peptide.position.x).toBeLessThan(senseFivePrime.sugar.position.x);
  });

  it('does not move a chain that is not bonded to the duplex', () => {
    const duplex = buildMirroredDuplex(editor);
    const duplexMonomers = [
      duplex.senseFivePrime.sugar,
      duplex.senseFivePrime.phosphate,
      duplex.senseFivePrime.rnaBase,
      duplex.senseThreePrime.sugar,
      duplex.senseThreePrime.phosphate,
      duplex.senseThreePrime.rnaBase,
      duplex.antisenseFivePrime.sugar,
      duplex.antisenseFivePrime.phosphate,
      duplex.antisenseFivePrime.rnaBase,
      duplex.antisenseThreePrime.sugar,
      duplex.antisenseThreePrime.phosphate,
      duplex.antisenseThreePrime.rnaBase,
    ];
    const unrelatedPeptide = addPeptideWithAttachmentPoints(
      editor,
      new Vec2(50, 50),
    );
    const positionBefore = new Vec2(
      unrelatedPeptide.position.x,
      unrelatedPeptide.position.y,
    );

    applyOpenStyleFlexModeImportFlow(duplexMonomers);

    expect(unrelatedPeptide.position.x).toBeCloseTo(positionBefore.x);
    expect(unrelatedPeptide.position.y).toBeCloseTo(positionBefore.y);
  });

  it('is a no-op when there is no paired duplex at all', () => {
    const firstPeptide = addPeptideWithAttachmentPoints(editor, new Vec2(0, 0));
    const secondPeptide = addPeptideWithAttachmentPoints(
      editor,
      new Vec2(3, 0),
    );

    editor.drawingEntitiesManager.createPolymerBond(
      firstPeptide,
      secondPeptide,
      AttachmentPointName.R2,
      AttachmentPointName.R1,
    );

    const command = applyOpenStyleFlexModeImportFlow();

    expect(command.operations.length).toBe(0);
  });
});
