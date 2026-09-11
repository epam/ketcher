import type { BaseMonomer } from 'domain/entities/BaseMonomer';
import type { MonomerOrAmbiguousType } from 'domain/types';
import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import { RNA_DNA_NON_MODIFIED_PART } from 'domain/constants/monomers';
import { isAmbiguousMonomerLibraryItem } from 'domain/helpers/monomers';

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
