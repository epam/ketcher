import { CoreEditor } from 'application/editor';
import { type BaseMonomer, Vec2 } from 'domain/entities';
import type { UnsplitNucleotide } from 'domain/entities/UnsplitNucleotide';
import { Nucleotide } from 'domain/entities/Nucleotide';
import { Nucleoside } from 'domain/entities/Nucleoside';
import { AttachmentPointName } from 'domain/types';
import {
  KetMonomerClass,
  RNA_DNA_NON_MODIFIED_PART,
} from 'domain/constants/monomers';
import {
  createMirroredBaseCommand,
  getHydrogenBondedPartner,
  getLibraryItemMonomerClass,
  isBaseEligibleForDuplexSync,
  isSelectedAntisensePair,
} from 'domain/helpers/antisenseBaseSync';
import { getRnaPartLibraryItem } from 'domain/helpers/rna';
import { replaceMonomer } from 'domain/entities/DrawingEntitiesManager.replaceMonomer';
import {
  getNextMonomerInChain,
  getPreviousMonomerInChain,
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

export const buildDuplex = (
  editor: CoreEditor,
  senseBaseLabel: string,
  isDnaAntisense = false,
) => {
  Nucleotide.createOnCanvas(senseBaseLabel, new Vec2(0, 0));
  editor.drawingEntitiesManager.selectDrawingEntities([
    ...editor.drawingEntitiesManager.monomers.values(),
  ]);
  editor.drawingEntitiesManager.createAntisenseChain(isDnaAntisense);

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

const findLibraryItemByAlias = (editor: CoreEditor, alias: string) => {
  const libraryItem = editor.monomersLibrary.find(
    (item) =>
      !('isAmbiguous' in item && item.isAmbiguous) &&
      item.label === alias &&
      item.props?.MonomerClass === KetMonomerClass.RNA,
  );

  if (!libraryItem) {
    throw new Error(`Library item ${alias} not found`);
  }

  return libraryItem;
};

const addUnsplitNucleotide = (
  editor: CoreEditor,
  alias: string,
  position: Vec2,
) => {
  const libraryItem = findLibraryItemByAlias(editor, alias);
  const command = editor.drawingEntitiesManager.addMonomer(
    libraryItem,
    position,
  );

  return command.operations[0].monomer as UnsplitNucleotide;
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

  it('returns undefined for a missing monomer or one without a hydrogen bond', () => {
    expect(getHydrogenBondedPartner(undefined)).toBeUndefined();

    const unbonded = addUnsplitNucleotide(editor, '2-damdA', new Vec2(0, 0));

    expect(unbonded.hydrogenBonds).toHaveLength(0);
    expect(getHydrogenBondedPartner(unbonded)).toBeUndefined();
  });

  it('treats a base on a sugar with a backbone connection as eligible', () => {
    const { senseBase } = buildDuplex(editor, 'A');

    expect(isBaseEligibleForDuplexSync(senseBase)).toBe(true);
  });

  it('treats an unsplit nucleotide with a backbone connection as eligible', () => {
    const first = addUnsplitNucleotide(editor, '2-damdA', new Vec2(0, 0));
    const second = addUnsplitNucleotide(editor, '2-damdA', new Vec2(1.5, 0));

    editor.drawingEntitiesManager.createPolymerBond(
      first,
      second,
      AttachmentPointName.R2,
      AttachmentPointName.R1,
    );

    expect(isBaseEligibleForDuplexSync(first)).toBe(true);
    expect(isBaseEligibleForDuplexSync(second)).toBe(true);
  });

  it('treats a base on a sugar without a backbone connection as ineligible', () => {
    // Nucleoside: sugar + base, no phosphate, so the sugar has no R2 backbone
    // bond. The base is still reachable through R1/R3, so this exercises the
    // ineligible branch rather than the "no sugar at all" branch.
    const { node } = Nucleoside.createOnCanvas('A', new Vec2(0, 0));

    expect(isBaseEligibleForDuplexSync(node.rnaBase as BaseMonomer)).toBe(
      false,
    );
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

  it('reports a pair as not selected when only one side is selected', () => {
    const { senseBase } = buildDuplex(editor, 'A');
    editor.drawingEntitiesManager.selectDrawingEntities([senseBase]);

    expect(isSelectedAntisensePair(senseBase)).toBe(false);
  });

  it('derives the monomer class of an ambiguous base library item from its constituent monomers', () => {
    // Ambiguous library items (e.g. the IUPAC "N" wildcard) have no `props`
    // at all, so their class cannot be read off `props.MonomerClass` the way
    // a regular library item's can; it must be derived from `monomers` via
    // AmbiguousMonomer.getMonomerClass, same as getRnaPartLibraryItem and
    // getPeptideLibraryItem already do.
    const ambiguousBaseItem = editor.monomersLibrary.find(
      (item) => 'isAmbiguous' in item && item.isAmbiguous && item.label === 'N',
    );

    if (!ambiguousBaseItem) {
      throw new Error('Ambiguous library item N not found');
    }

    expect(getLibraryItemMonomerClass(ambiguousBaseItem)).toBe(
      KetMonomerClass.Base,
    );
  });

  it('reads the monomer class of a non-ambiguous base library item from its props', () => {
    const nonAmbiguousBaseItem = getRnaPartLibraryItem(
      editor,
      'A',
      KetMonomerClass.Base,
    );

    if (!nonAmbiguousBaseItem) {
      throw new Error('Library item A not found');
    }

    expect(getLibraryItemMonomerClass(nonAmbiguousBaseItem)).toBe(
      KetMonomerClass.Base,
    );
  });
});

describe('createMirroredBaseCommand', () => {
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

  const resolveBaseLibraryItem = (label: string) =>
    getRnaPartLibraryItem(editor, label, KetMonomerClass.Base);

  it('rewrites the paired base when the natural analogue changes', () => {
    const { senseBase, antisenseBase } = buildDuplex(editor, 'A');
    const newBaseItem = resolveBaseLibraryItem('C');

    if (!newBaseItem) {
      throw new Error('Library item C not found');
    }

    const command = createMirroredBaseCommand({
      drawingEntitiesManager: editor.drawingEntitiesManager,
      editedBase: senseBase,
      previousNaturalAnalogue: 'A',
      newBaseMonomerItem: newBaseItem,
      isSyncEditMode: true,
      resolveBaseLibraryItem,
    });

    expect(command).toBeDefined();
    expect(antisenseBase.label).toBe('G');
  });

  it('rewrites the paired sense base when the antisense strand is edited', () => {
    const { senseBase, antisenseBase } = buildDuplex(editor, 'A');
    const newBaseItem = resolveBaseLibraryItem('A');

    if (!newBaseItem) {
      throw new Error('Library item A not found');
    }

    // The antisense base opposite a sense A is U on ribose, so editing it to
    // A must rewrite the sense side back through the same symmetric table.
    const command = createMirroredBaseCommand({
      drawingEntitiesManager: editor.drawingEntitiesManager,
      editedBase: antisenseBase,
      previousNaturalAnalogue: 'U',
      newBaseMonomerItem: newBaseItem,
      isSyncEditMode: true,
      resolveBaseLibraryItem,
    });

    expect(command).toBeDefined();
    expect(senseBase.label).toBe('U');
    expect(antisenseBase.hydrogenBonds).toHaveLength(1);
  });

  it('leaves the paired base alone when the analogue is unchanged', () => {
    const { senseBase, antisenseBase } = buildDuplex(editor, 'A');
    const labelBefore = antisenseBase.label;
    const newBaseItem = resolveBaseLibraryItem('A');

    if (!newBaseItem) {
      throw new Error('Library item A not found');
    }

    const command = createMirroredBaseCommand({
      drawingEntitiesManager: editor.drawingEntitiesManager,
      editedBase: senseBase,
      previousNaturalAnalogue: 'A',
      newBaseMonomerItem: newBaseItem,
      isSyncEditMode: true,
      resolveBaseLibraryItem,
    });

    expect(command).toBeUndefined();
    expect(antisenseBase.label).toBe(labelBefore);
  });

  it('does nothing when sync edit mode is off', () => {
    const { senseBase, antisenseBase } = buildDuplex(editor, 'A');
    const labelBefore = antisenseBase.label;
    const newBaseItem = resolveBaseLibraryItem('C');

    if (!newBaseItem) {
      throw new Error('Library item C not found');
    }

    const command = createMirroredBaseCommand({
      drawingEntitiesManager: editor.drawingEntitiesManager,
      editedBase: senseBase,
      previousNaturalAnalogue: 'A',
      newBaseMonomerItem: newBaseItem,
      isSyncEditMode: false,
      resolveBaseLibraryItem,
    });

    expect(command).toBeUndefined();
    expect(antisenseBase.label).toBe(labelBefore);
  });

  it('does nothing when the paired base is itself selected', () => {
    const { senseBase, antisenseBase } = buildDuplex(editor, 'A');
    const labelBefore = antisenseBase.label;
    editor.drawingEntitiesManager.selectDrawingEntities([
      senseBase,
      antisenseBase,
    ]);
    const newBaseItem = resolveBaseLibraryItem('C');

    if (!newBaseItem) {
      throw new Error('Library item C not found');
    }

    const command = createMirroredBaseCommand({
      drawingEntitiesManager: editor.drawingEntitiesManager,
      editedBase: senseBase,
      previousNaturalAnalogue: 'A',
      newBaseMonomerItem: newBaseItem,
      isSyncEditMode: true,
      resolveBaseLibraryItem,
    });

    expect(command).toBeUndefined();
    expect(antisenseBase.label).toBe(labelBefore);
  });

  // The three tests above (unchanged analogue, sync off, paired base
  // selected) all rely on createMirroredBaseCommand deriving `partner` and
  // eligibility itself. The `partner`/`wasEditedBaseEligible` short-circuit
  // added for the ambiguous-replace and library-replace call sites must not
  // weaken any of those suppression rules when a caller happens to supply
  // them explicitly, so each is re-verified here with both supplied.
  it('leaves the paired base alone when the analogue is unchanged, even with partner and eligibility supplied explicitly', () => {
    const { senseBase, antisenseBase } = buildDuplex(editor, 'A');
    const labelBefore = antisenseBase.label;
    const newBaseItem = resolveBaseLibraryItem('A');

    if (!newBaseItem) {
      throw new Error('Library item A not found');
    }

    const command = createMirroredBaseCommand({
      drawingEntitiesManager: editor.drawingEntitiesManager,
      editedBase: senseBase,
      previousNaturalAnalogue: 'A',
      newBaseMonomerItem: newBaseItem,
      isSyncEditMode: true,
      resolveBaseLibraryItem,
      partner: antisenseBase,
      wasEditedBaseEligible: true,
    });

    expect(command).toBeUndefined();
    expect(antisenseBase.label).toBe(labelBefore);
  });

  it('does nothing when sync edit mode is off, even with partner and eligibility supplied explicitly', () => {
    const { senseBase, antisenseBase } = buildDuplex(editor, 'A');
    const labelBefore = antisenseBase.label;
    const newBaseItem = resolveBaseLibraryItem('C');

    if (!newBaseItem) {
      throw new Error('Library item C not found');
    }

    const command = createMirroredBaseCommand({
      drawingEntitiesManager: editor.drawingEntitiesManager,
      editedBase: senseBase,
      previousNaturalAnalogue: 'A',
      newBaseMonomerItem: newBaseItem,
      isSyncEditMode: false,
      resolveBaseLibraryItem,
      partner: antisenseBase,
      wasEditedBaseEligible: true,
    });

    expect(command).toBeUndefined();
    expect(antisenseBase.label).toBe(labelBefore);
  });

  it('does nothing when the paired base is itself selected, even with partner and eligibility supplied explicitly', () => {
    const { senseBase, antisenseBase } = buildDuplex(editor, 'A');
    const labelBefore = antisenseBase.label;
    editor.drawingEntitiesManager.selectDrawingEntities([
      senseBase,
      antisenseBase,
    ]);
    const newBaseItem = resolveBaseLibraryItem('C');

    if (!newBaseItem) {
      throw new Error('Library item C not found');
    }

    const command = createMirroredBaseCommand({
      drawingEntitiesManager: editor.drawingEntitiesManager,
      editedBase: senseBase,
      previousNaturalAnalogue: 'A',
      newBaseMonomerItem: newBaseItem,
      isSyncEditMode: true,
      resolveBaseLibraryItem,
      partner: antisenseBase,
      wasEditedBaseEligible: true,
    });

    expect(command).toBeUndefined();
    expect(antisenseBase.label).toBe(labelBefore);
  });

  it('does not mirror an edited base that is not structurally eligible, even when an eligible partner is supplied', () => {
    // The partner must itself be a valid, eligible, unselected duplex base
    // (from buildDuplex) so this isolates the editedBase eligibility guard
    // specifically: if the partner were also ineligible, `!isBaseEligibleForDuplexSync(partner)`
    // would suppress the command regardless of whether the editedBase check
    // ran at all, and the test would pass without exercising the guard this
    // finding is about.
    const { antisenseBase } = buildDuplex(editor, 'A');

    // Reuses the Task 3 ineligible shape (see 'treats a base on a sugar
    // without a backbone connection as ineligible' above): a floating
    // nucleoside (sugar + base, no phosphate => no backbone connection).
    // `partner` is supplied directly below, so this base does not need a
    // real hydrogen bond of its own -- only its own (in)eligibility matters
    // for this test.
    const { node } = Nucleoside.createOnCanvas('C', new Vec2(5, 0));
    const floatingBase = node.rnaBase as BaseMonomer;

    expect(isBaseEligibleForDuplexSync(floatingBase)).toBe(false);
    expect(isBaseEligibleForDuplexSync(antisenseBase)).toBe(true);

    const newBaseItem = resolveBaseLibraryItem('C');

    if (!newBaseItem) {
      throw new Error('Library item C not found');
    }

    // The partner is supplied explicitly, exactly as the real call site now
    // does unconditionally. If supplying a partner ever short-circuits the
    // eligibility check on editedBase (the bug this finding is about), this
    // produces a command; it must not.
    const command = createMirroredBaseCommand({
      drawingEntitiesManager: editor.drawingEntitiesManager,
      editedBase: floatingBase,
      previousNaturalAnalogue: 'A',
      newBaseMonomerItem: newBaseItem,
      isSyncEditMode: true,
      resolveBaseLibraryItem,
      partner: antisenseBase,
    });

    expect(command).toBeUndefined();
  });

  // The antisense strand runs in the opposite direction from the sense
  // strand, so its phosphate is the sugar's previous chain neighbor, not its
  // next one (getPhosphateFromSugar only looks forward and would find
  // nothing here). Take whichever side is populated.
  const getAdjacentPhosphate = (sugar: BaseMonomer) =>
    getNextMonomerInChain(sugar) ?? getPreviousMonomerInChain(sugar);

  it('leaves the paired sugar and phosphate untouched', () => {
    const { senseBase, antisenseBase } = buildDuplex(editor, 'A');
    const partnerSugar = getSugarFromRnaBase(antisenseBase);
    const newBaseItem = resolveBaseLibraryItem('C');

    if (!newBaseItem) {
      throw new Error('Library item C not found');
    }
    if (!partnerSugar) {
      throw new Error('Fixture setup failed: expected a sugar');
    }

    const sugarLabelBefore = partnerSugar.label;
    const phosphateLabelBefore = getAdjacentPhosphate(partnerSugar)?.label;

    if (!phosphateLabelBefore) {
      throw new Error('Fixture setup failed: expected a phosphate');
    }

    createMirroredBaseCommand({
      drawingEntitiesManager: editor.drawingEntitiesManager,
      editedBase: senseBase,
      previousNaturalAnalogue: 'A',
      newBaseMonomerItem: newBaseItem,
      isSyncEditMode: true,
      resolveBaseLibraryItem,
    });

    const partnerSugarAfter = getSugarFromRnaBase(antisenseBase);

    expect(partnerSugarAfter?.label).toBe(sugarLabelBefore);
    expect(
      partnerSugarAfter && getAdjacentPhosphate(partnerSugarAfter)?.label,
    ).toBe(phosphateLabelBefore);
  });

  it('mirrors adenine to thymine when the paired base sits on deoxyribose, and to uracil otherwise', () => {
    // buildDuplex's third argument controls the antisense strand's sugar: DNA
    // (deoxyribose) here, so the partner being rewritten is on DNA even
    // though the edited base itself is on ribose. Rule: a new analogue of
    // adenine mirrors to thymine on deoxyribose, uracil otherwise.
    const { senseBase, antisenseBase } = buildDuplex(editor, 'C', true);
    const partnerSugarLabel = getSugarFromRnaBase(antisenseBase)?.label;

    expect(partnerSugarLabel).toBe(RNA_DNA_NON_MODIFIED_PART.SUGAR_DNA);
    // Sense C mirrors to antisense G regardless of sugar, confirming the
    // duplex was built as expected before we drive the interesting edit.
    expect(antisenseBase.label).toBe('G');

    const newBaseItem = resolveBaseLibraryItem('A');

    if (!newBaseItem) {
      throw new Error('Library item A not found');
    }

    const command = createMirroredBaseCommand({
      drawingEntitiesManager: editor.drawingEntitiesManager,
      editedBase: senseBase,
      previousNaturalAnalogue: 'C',
      newBaseMonomerItem: newBaseItem,
      isSyncEditMode: true,
      resolveBaseLibraryItem,
    });

    expect(command).toBeDefined();
    // Not 'U': the partner's own sugar is deoxyribose, so the DNA table is
    // used for the rewritten side, independent of the edited base's sugar.
    expect(antisenseBase.label).toBe('T');
  });

  it('rewrites the paired base through the ambiguous-monomer replace path', () => {
    const { senseBase, antisenseBase } = buildDuplex(editor, 'A');
    // R (purine: A/G) is a genuinely ambiguous library item -- isAmbiguous is
    // only ever true for an AmbiguousMonomer, unlike a named modified
    // monomer such as 5meC. Resolving through the antisense table, R mirrors
    // to Y (pyrimidine: C/U on ribose), which is itself ambiguous. Either
    // side being ambiguous is what should route through replaceMonomer
    // instead of the in-place modifyMonomerItem swap.
    const newBaseItem = resolveBaseLibraryItem('R');

    if (!newBaseItem) {
      throw new Error('Library item R not found');
    }

    expect(newBaseItem.isAmbiguous).toBe(true);

    const command = createMirroredBaseCommand({
      drawingEntitiesManager: editor.drawingEntitiesManager,
      editedBase: senseBase,
      previousNaturalAnalogue: 'A',
      newBaseMonomerItem: newBaseItem,
      isSyncEditMode: true,
      resolveBaseLibraryItem,
    });

    expect(command).toBeDefined();

    // replaceMonomer deletes and recreates the partner monomer, so the
    // `antisenseBase` reference captured before the edit is now stale (it
    // was removed from the manager). Re-derive the current partner from the
    // sense base's hydrogen bond instead of trusting that stale reference.
    const currentPartner =
      senseBase.hydrogenBonds[0]?.getAnotherMonomer(senseBase);

    if (!currentPartner) {
      throw new Error('Expected the sense base to still have a partner');
    }

    expect(currentPartner).not.toBe(antisenseBase);
    expect(currentPartner.label).toBe('Y');
    expect(currentPartner.hydrogenBonds).toHaveLength(1);
    expect(senseBase.hydrogenBonds).toHaveLength(1);
  });

  it('discards a modification on the paired base', () => {
    const { senseBase, antisenseBase } = buildDuplex(editor, 'C');
    const modifiedItem = resolveBaseLibraryItem('5meC');

    if (!modifiedItem) {
      throw new Error('Library item 5meC not found');
    }

    // Give the antisense side a modified, non-ambiguous base (5meC, natural
    // analogue C -- it does not matter that this mismatches the duplex's own
    // G partner; the point is only that some modification is in place to be
    // discarded). The mirror computes its target fresh from the antisense
    // table and the partner's sugar, so whatever modification was there
    // before is replaced with a plain library item, never carried over.
    editor.drawingEntitiesManager.modifyMonomerItem(
      antisenseBase,
      modifiedItem,
    );

    const newBaseItem = resolveBaseLibraryItem('A');

    if (!newBaseItem) {
      throw new Error('Library item A not found');
    }

    createMirroredBaseCommand({
      drawingEntitiesManager: editor.drawingEntitiesManager,
      editedBase: senseBase,
      previousNaturalAnalogue: 'C',
      newBaseMonomerItem: newBaseItem,
      isSyncEditMode: true,
      resolveBaseLibraryItem,
    });

    // Plain complement, not a modified one: the modification is gone.
    expect(antisenseBase.label).toBe('U');
  });

  it('mirrors the paired base when the edited base was replaced (ambiguous branch), using the stale pre-replace reference', () => {
    const { senseBase, antisenseBase } = buildDuplex(editor, 'A');
    const ambiguousItem = editor.monomersLibrary.find(
      (item) => 'isAmbiguous' in item && item.isAmbiguous && item.label === 'N',
    );

    if (!ambiguousItem) {
      throw new Error('Ambiguous library item N not found');
    }

    // Mirrors the real call site: the partner, eligibility, and natural
    // analogue are all captured BEFORE the sense edit, exactly as
    // modifySequenceInRnaBuilder does.
    const previousNaturalAnalogue = senseBase.monomerItem.props
      ?.MonomerNaturalAnalogCode as string | undefined;
    const partnerBeforeEdit = getHydrogenBondedPartner(senseBase);
    const wasEditedBaseEligible = isBaseEligibleForDuplexSync(senseBase);

    expect(partnerBeforeEdit).toBe(antisenseBase);
    expect(wasEditedBaseEligible).toBe(true);

    replaceMonomer(editor.drawingEntitiesManager, senseBase, ambiguousItem);

    // senseBase is now stale: replaceMonomer deleted it and its bonds
    // (including the R1 bond to its sugar and the hydrogen bond), so its own
    // hydrogenBonds array is empty, it no longer reaches its sugar, and its
    // own eligibility would (incorrectly) read as false if recomputed now.
    expect(senseBase.hydrogenBonds).toHaveLength(0);
    expect(isBaseEligibleForDuplexSync(senseBase)).toBe(false);

    const newBaseItem = resolveBaseLibraryItem('C');

    if (!newBaseItem) {
      throw new Error('Library item C not found');
    }

    const command = createMirroredBaseCommand({
      drawingEntitiesManager: editor.drawingEntitiesManager,
      editedBase: senseBase,
      previousNaturalAnalogue,
      newBaseMonomerItem: newBaseItem,
      isSyncEditMode: true,
      resolveBaseLibraryItem,
      partner: partnerBeforeEdit,
      wasEditedBaseEligible,
    });

    expect(command).toBeDefined();
    expect(antisenseBase.label).toBe('G');
  });

  it('is reverted by inverting the returned command', () => {
    const { senseBase, antisenseBase } = buildDuplex(editor, 'A');
    const labelBefore = antisenseBase.label;
    const newBaseItem = resolveBaseLibraryItem('C');

    if (!newBaseItem) {
      throw new Error('Library item C not found');
    }

    const command = createMirroredBaseCommand({
      drawingEntitiesManager: editor.drawingEntitiesManager,
      editedBase: senseBase,
      previousNaturalAnalogue: 'A',
      newBaseMonomerItem: newBaseItem,
      isSyncEditMode: true,
      resolveBaseLibraryItem,
    });

    command?.invert(editor.renderersContainer);

    expect(antisenseBase.label).toBe(labelBefore);
  });
});
