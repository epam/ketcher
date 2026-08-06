/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

// Focused unit/integration tests for the "mirrored paired RNA-chain rendering
// in Flex mode" fix:
//  - `DrawingEntitiesManager.recalculateAntisenseChains` gained an opt-in
//    `useStableSenseTieBreak` parameter that breaks a sense/antisense tie
//    using a stable, model-based property (lowest monomer id) instead of
//    transient/raw imported coordinates. It defaults to `false` (legacy
//    bbox-based tie-break), so Sequence mode and every other existing
//    caller is unaffected; only the Flex-mode initial-load path opts in.
//  - `DrawingEntitiesManager.applyCanonicalAntisenseOrientation` normalizes a
//    freshly loaded, possibly mirrored, paired RNA duplex into the canonical
//    Flex orientation (sense 5' top-left, antisense 3' bottom-left), without
//    touching structures that are not paired RNA duplexes.
import { CoreEditor } from 'application/editor';
import { MACROMOLECULES_BOND_TYPES } from 'application/editor/tools/types';
import { Vec2 } from 'domain/entities';
import type { BaseMonomer } from 'domain/entities/BaseMonomer';
import { Nucleotide } from 'domain/entities/Nucleotide';
import { PolymerBond } from 'domain/entities/PolymerBond';
import { AttachmentPointName } from 'domain/types';
import { peptideMonomerItem } from '../../mock-data';
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

// Connects two nucleotides into a single 5' -> 3' backbone (phosphate.R2 ->
// next sugar.R1), matching the convention used elsewhere in this codebase.
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

// Base-pairs (hydrogen-bonds) a sense base to its antisense partner, the way
// HELM "pair" connections are represented on canvas.
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

/**
 * Builds a 2-nucleotide paired RNA duplex, deliberately laid out mirrored on
 * both axes (equivalent to the raw, mirrored coordinates produced during
 * HELM/KET conversion): the sense chain runs right-to-left, and it sits
 * below its antisense partner instead of above it. Paired bases are placed
 * in matching x-columns so column alignment can be asserted after
 * normalization.
 */
const buildMirroredDuplex = (editor: CoreEditor) => {
  // Sense chain (created first -> lowest monomer ids): 5' on the right (x=6),
  // 3' on the left (x=3) - mirrored horizontally. Placed below the
  // antisense chain (y=5) - mirrored vertically too.
  const senseFivePrime = createNucleotide('A', new Vec2(6, 5));
  const senseThreePrime = createNucleotide('U', new Vec2(3, 5));
  connectFivePrimeToThreePrime(editor, senseFivePrime, senseThreePrime);

  // Antisense chain (created second -> higher monomer ids), also built
  // 5' -> 3', antiparallel-paired to sense. Column-aligned with the sense
  // chain: antisense 3' (x=6) pairs with sense 5' (x=6); antisense 5' (x=3)
  // pairs with sense 3' (x=3).
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

// `DrawingEntityMoveOperation`s created by `applyCanonicalAntisenseOrientation`
// only apply their model change lazily, on `execute()` (mirroring how
// `Open.tsx` only applies them once via `renderersContainer.update(...)`).
// These tests build monomers directly through the manager without attaching
// real renderers, so operations are executed directly here instead of
// through `RenderersManager`, which would additionally try to move a
// (non-existent) renderer.
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
  // Mirrors the production wiring in `Open.tsx`'s Flex-mode initial-load
  // path: `useStableSenseTieBreak: true` is only passed here, so this does
  // not affect the default (legacy) tie-break used by every other caller of
  // `recalculateAntisenseChains()` (Sequence mode, Erase, paste, etc.).
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

    // Sense reads 5' -> 3' left-to-right.
    expect(senseFivePrime.sugar.position.x).toBeLessThan(
      senseThreePrime.sugar.position.x,
    );
    // Sense sits above (smaller y) its antisense partner.
    expect(senseFivePrime.sugar.position.y).toBeLessThan(
      antisenseFivePrime.sugar.position.y,
    );
    // Antisense visual numbering direction (5' -> 3') is opposite to sense's:
    // antisense 3' (paired with sense 5') is now on the left.
    expect(antisenseThreePrime.sugar.position.x).toBeLessThan(
      antisenseFivePrime.sugar.position.x,
    );
    // Sense 5' terminal is top-left; antisense 3' terminal is bottom-left.
    expect(senseFivePrime.sugar.position.x).toBeCloseTo(
      antisenseThreePrime.sugar.position.x,
    );

    // Base-pair connections still match the correct bases.
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

    // Sanity: still canonical.
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

    // Still connected to the same anchor monomer via the same attachment
    // points.
    const r2Bond = senseThreePrime.phosphate.attachmentPointsToBonds.R2;
    expect(
      r2Bond instanceof PolymerBond &&
        r2Bond.getAnotherMonomer(senseThreePrime.phosphate),
    ).toBe(peptide);

    // The relative distance to its anchor monomer is preserved by the rigid
    // reflection (only the sign of a mirrored axis can change).
    const distanceAfter = Vec2.diff(
      peptide.position,
      senseThreePrime.phosphate.position,
    );
    expect(Math.abs(distanceAfter.x)).toBeCloseTo(Math.abs(distanceBefore.x));
    expect(Math.abs(distanceAfter.y)).toBeCloseTo(Math.abs(distanceBefore.y));
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

    // Simulate the user manually dragging the sense 5' monomer somewhere
    // arbitrary after the initial canonical load.
    const [monomerToMoveManually] = allMonomersOf(editor);
    const manualPosition = new Vec2(42, 42);
    monomerToMoveManually.moveRelative(
      Vec2.diff(manualPosition, monomerToMoveManually.position),
    );

    // `FlexMode.initialize()` only calls `recalculateAntisenseChains()` on
    // every mode entry (never `applyCanonicalAntisenseOrientation`), so
    // simulate that re-entry directly here.
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
    // Chain A is created first (lowest monomer ids) but is deliberately
    // positioned *below* chain B, mirroring the "raw imported coordinates"
    // scenario that used to flip the sense/antisense choice.
    const chainAFivePrime = createNucleotide('A', new Vec2(0, 10));
    const chainAThreePrime = createNucleotide('U', new Vec2(3, 10));
    connectFivePrimeToThreePrime(editor, chainAFivePrime, chainAThreePrime);

    const chainBFivePrime = createNucleotide('G', new Vec2(3, 0));
    const chainBThreePrime = createNucleotide('C', new Vec2(0, 0));
    connectFivePrimeToThreePrime(editor, chainBFivePrime, chainBThreePrime);

    pairBases(editor, chainAFivePrime, chainBThreePrime);
    pairBases(editor, chainAThreePrime, chainBFivePrime);

    // `useStableSenseTieBreak: true` mirrors the Flex-mode initial-load
    // wiring in `Open.tsx`; every other caller keeps the legacy tie-break.
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
    // Same duplex as above, but recalculated with the default parameters
    // (as every caller other than the Flex-mode initial load does). Chain B
    // sits above chain A (smaller y), so the legacy tie-break picks chain B
    // as sense - this must stay unchanged so Sequence mode and other flows
    // are not affected by the new opt-in stable tie-break.
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
