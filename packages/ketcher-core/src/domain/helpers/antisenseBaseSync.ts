import type { BaseMonomer } from 'domain/entities/BaseMonomer';
import type { MonomerOrAmbiguousType } from 'domain/types';
import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import { RNA_DNA_NON_MODIFIED_PART } from 'domain/constants/monomers';
import {
  getNextMonomerInChain,
  getPreviousMonomerInChain,
  getSugarFromRnaBase,
  isAmbiguousMonomerLibraryItem,
  isRnaBaseApplicableForAntisense,
} from 'domain/helpers/monomers';
import type { Command } from 'domain/entities/Command';
import { replaceMonomer } from 'domain/entities/DrawingEntitiesManager.replaceMonomer';

/**
 * Follows the existing convention in Nucleoside, Nucleotide and the sequence
 * item renderers: deoxyribose is recognized by an exact label match. Modified
 * DNA sugars are therefore not recognized, which is a documented limitation.
 */
export function isDeoxyriboseSugarLabel(sugarLabel?: string): boolean {
  return sugarLabel === RNA_DNA_NON_MODIFIED_PART.SUGAR_DNA;
}

export function getLibraryItemNaturalAnalogue(
  item: MonomerOrAmbiguousType,
): string | undefined {
  return isAmbiguousMonomerLibraryItem(item)
    ? item.label
    : item.props?.MonomerNaturalAnalogCode;
}

export function getMonomerNaturalAnalogue(
  monomer?: BaseMonomer,
): string | undefined {
  if (!monomer) {
    return undefined;
  }

  return monomer.monomerItem.isAmbiguous
    ? monomer.monomerItem.label
    : monomer.monomerItem.props?.MonomerNaturalAnalogCode;
}

/**
 * Rule 1.1 and rule 1.2 of epam/ketcher#6595. Returns the label the paired
 * base must become, or undefined when the pair must be left alone.
 */
export function resolveMirroredBaseLabel(params: {
  previousNaturalAnalogue?: string;
  newNaturalAnalogue?: string;
  oppositeSugarLabel?: string;
}): string | undefined {
  const { previousNaturalAnalogue, newNaturalAnalogue, oppositeSugarLabel } =
    params;

  if (!newNaturalAnalogue) {
    return undefined;
  }

  // Rule 1.2: the natural analogue did not change, so the pair is untouched.
  if (previousNaturalAnalogue === newNaturalAnalogue) {
    return undefined;
  }

  return DrawingEntitiesManager.getAntisenseBaseLabel(
    newNaturalAnalogue,
    isDeoxyriboseSugarLabel(oppositeSugarLabel),
  );
}

export function getHydrogenBondedPartner(
  monomer?: BaseMonomer,
): BaseMonomer | undefined {
  const hydrogenBond = monomer?.hydrogenBonds[0];

  if (!monomer || !hydrogenBond) {
    return undefined;
  }

  return hydrogenBond.getAnotherMonomer(monomer);
}

/**
 * The structural condition from rule 1.3: the base reaches a sugar through the
 * R1/R3 pairing, and that sugar carries at least one backbone connection.
 * Unsplit nucleotides satisfy the first half by monomer class.
 */
export function isBaseEligibleForDuplexSync(base?: BaseMonomer): boolean {
  if (!base || !isRnaBaseApplicableForAntisense(base)) {
    return false;
  }

  const sugar = getSugarFromRnaBase(base);

  if (!sugar) {
    // Unsplit nucleotide: the backbone connection is on the monomer itself.
    return Boolean(
      getPreviousMonomerInChain(base) ?? getNextMonomerInChain(base),
    );
  }

  return Boolean(
    getPreviousMonomerInChain(sugar) ?? getNextMonomerInChain(sugar),
  );
}

/**
 * True when this base and the base it is hydrogen bonded to are BOTH selected
 * and both eligible. Rule 1.1 skips propagation for such a pair, and rule 1.3
 * blocks base modification entirely when one exists in the selection.
 */
export function isSelectedAntisensePair(base?: BaseMonomer): boolean {
  const partner = getHydrogenBondedPartner(base);

  if (!base || !partner) {
    return false;
  }

  return (
    base.selected &&
    partner.selected &&
    isBaseEligibleForDuplexSync(base) &&
    isBaseEligibleForDuplexSync(partner)
  );
}

/**
 * Builds the command that rewrites the hydrogen-bonded partner of
 * `editedBase` so the pair stays complementary. Direction-agnostic: the same
 * function serves sense-to-antisense and antisense-to-sense edits, since it
 * always mirrors from whichever base was actually edited to its partner.
 *
 * Returns undefined when there is nothing to mirror (sync mode is off, there
 * is no eligible partner, the partner is itself selected, or the natural
 * analogue did not change), so the caller can tell "no-op" apart from a real
 * command to merge into its own.
 */
export function createMirroredBaseCommand(params: {
  drawingEntitiesManager: DrawingEntitiesManager;
  editedBase: BaseMonomer;
  previousNaturalAnalogue?: string;
  newBaseMonomerItem: MonomerOrAmbiguousType;
  needToEditAntisense: boolean;
  resolveBaseLibraryItem: (label: string) => MonomerOrAmbiguousType | undefined;
}): Command | undefined {
  const {
    drawingEntitiesManager,
    editedBase,
    previousNaturalAnalogue,
    newBaseMonomerItem,
    needToEditAntisense,
    resolveBaseLibraryItem,
  } = params;

  // Rule 2.1: non-sync mode never touches the opposite strand.
  if (!needToEditAntisense) {
    return undefined;
  }

  const partner = getHydrogenBondedPartner(editedBase);

  if (
    !partner ||
    !isBaseEligibleForDuplexSync(editedBase) ||
    !isBaseEligibleForDuplexSync(partner)
  ) {
    return undefined;
  }

  // Rule 1.1: the paired base is selected in its own right, so it gets its own
  // edit and must not be overwritten by this one.
  if (partner.selected) {
    return undefined;
  }

  const targetLabel = resolveMirroredBaseLabel({
    previousNaturalAnalogue,
    newNaturalAnalogue: getLibraryItemNaturalAnalogue(newBaseMonomerItem),
    oppositeSugarLabel: getSugarFromRnaBase(partner)?.label,
  });

  if (!targetLabel) {
    return undefined;
  }

  const targetMonomerItem = resolveBaseLibraryItem(targetLabel);

  if (!targetMonomerItem) {
    return undefined;
  }

  // Mirrors the branching already used by modifySequenceInRnaBuilder: an
  // in-place item swap keeps every bond, but ambiguous monomers change the
  // entity class and need a full replace.
  if (partner.monomerItem.isAmbiguous || targetMonomerItem.isAmbiguous) {
    return replaceMonomer(drawingEntitiesManager, partner, targetMonomerItem);
  }

  return drawingEntitiesManager.modifyMonomerItem(partner, targetMonomerItem);
}
