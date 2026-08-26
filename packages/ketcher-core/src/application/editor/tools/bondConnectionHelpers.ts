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

/**
 * Shared helpers for deciding whether the "Select Attachment Points" connection
 * modal should be invoked when two monomers are about to be bonded.
 *
 * Extracted from `Bond.ts` so that both the Bond tool path and the
 * drag-drop placement path in `Editor.ts` can call the same logic without
 * duplication.
 */

import {
  AmbiguousMonomer,
  UnresolvedMonomer,
  UnsplitNucleotide,
} from 'domain/entities';
import type { BaseMonomer } from 'domain/entities/BaseMonomer';
import { Chem } from 'domain/entities/Chem';
import { Peptide } from 'domain/entities/Peptide';
import { Phosphate } from 'domain/entities/Phosphate';
import { RNABase } from 'domain/entities/RNABase';
import { Sugar } from 'domain/entities/Sugar';
import { AttachmentPointName } from 'domain/types';
import { KetMonomerClass } from 'application/formatters';

/**
 * Determines whether the "Select Attachment Points" modal should be shown
 * when connecting `firstMonomer` to `secondMonomer`.
 *
 * Returns `true` (show modal), `false` (auto-connect, no modal), or
 * `undefined` (hydrogen bond — modal not applicable).
 *
 * @param firstMonomer  The source monomer (the one initiating the bond).
 * @param secondMonomer The target monomer.
 * @param checkForPotentialBonds  When `true`, returns `true` if either monomer
 *   has no potential bonds pre-computed (i.e. `hasPotentialBonds()` is false).
 *   Set to `false` on the drag-drop path where potential bonds are not
 *   pre-computed.
 * @param isHydrogenBond  When `true`, returns `undefined` immediately (no modal
 *   for hydrogen bonds).
 */
export function shouldInvokeConnectionModal(
  firstMonomer: BaseMonomer,
  secondMonomer: BaseMonomer,
  checkForPotentialBonds = true,
  isHydrogenBond = false,
): boolean | undefined {
  if (isHydrogenBond) {
    return undefined;
  }

  // No Modal: no free attachment point on second monomer
  if (!secondMonomer.hasFreeAttachmentPoint) {
    return false;
  }

  // No Modal: Both monomers have APs selected
  if (
    firstMonomer.chosenFirstAttachmentPointForBond !== null &&
    secondMonomer.chosenSecondAttachmentPointForBond !== null
  ) {
    return false;
  }

  // Modal: either of the monomers doesn't have any potential APs
  if (
    checkForPotentialBonds &&
    (!firstMonomer.hasPotentialBonds() || !secondMonomer.hasPotentialBonds())
  ) {
    return true;
  }

  // No Modal: Both monomers have only 1 attachment point
  if (
    firstMonomer.unUsedAttachmentPointsNamesList.length === 1 &&
    secondMonomer.unUsedAttachmentPointsNamesList.length === 1
  ) {
    return false;
  }

  // Modal: Any or both monomers are Chems
  if (
    firstMonomer instanceof Chem ||
    secondMonomer instanceof Chem ||
    (firstMonomer instanceof AmbiguousMonomer &&
      firstMonomer.monomerClass === KetMonomerClass.CHEM) ||
    (secondMonomer instanceof AmbiguousMonomer &&
      secondMonomer.monomerClass === KetMonomerClass.CHEM)
  ) {
    return true;
  }

  // Modal: Any or both monomers are unresolved
  if (
    firstMonomer instanceof UnresolvedMonomer ||
    secondMonomer instanceof UnresolvedMonomer
  ) {
    return true;
  }

  // Modal: One monomer is Peptide/UnsplitNucleotide/AmbiguousAminoAcid and
  // the other is an RNA monomer (Sugar, RNABase, Phosphate)
  const rnaMonomerClasses = [Sugar, RNABase, Phosphate];
  const firstMonomerIsRNA = rnaMonomerClasses.find(
    (RNAClass) => firstMonomer instanceof RNAClass,
  );
  const secondMonomerIsRNA = rnaMonomerClasses.find(
    (RNAClass) => secondMonomer instanceof RNAClass,
  );
  if (
    (firstMonomerIsRNA && secondMonomer instanceof Peptide) ||
    (secondMonomerIsRNA && firstMonomer instanceof Peptide) ||
    (firstMonomerIsRNA && secondMonomer instanceof UnsplitNucleotide) ||
    (secondMonomerIsRNA && firstMonomer instanceof UnsplitNucleotide) ||
    (firstMonomerIsRNA &&
      secondMonomer instanceof AmbiguousMonomer &&
      secondMonomer.monomerClass === KetMonomerClass.AminoAcid) ||
    (secondMonomerIsRNA &&
      firstMonomer instanceof AmbiguousMonomer &&
      firstMonomer.monomerClass === KetMonomerClass.AminoAcid)
  ) {
    return true;
  }

  // Modal: special case for Peptide chain with more than 2 APs and blocked
  // R1-R2 combinations
  if (secondMonomer instanceof Peptide && firstMonomer instanceof Peptide) {
    const hasPlentyAttachmentPoints =
      firstMonomer.listOfAttachmentPoints.length > 2 ||
      secondMonomer.listOfAttachmentPoints.length > 2;

    const hasPlentyFreeAttachmentPoints =
      firstMonomer.unUsedAttachmentPointsNamesList.length > 1 ||
      secondMonomer.unUsedAttachmentPointsNamesList.length > 1;

    const BothR1AttachmentPointUsed =
      firstMonomer.isAttachmentPointUsed(AttachmentPointName.R1) &&
      secondMonomer.isAttachmentPointUsed(AttachmentPointName.R1);

    const BothR2AttachmentPointUsed =
      firstMonomer.isAttachmentPointUsed(AttachmentPointName.R2) &&
      secondMonomer.isAttachmentPointUsed(AttachmentPointName.R2);

    const R1AndR2AttachmentPointUsed =
      (firstMonomer.isAttachmentPointUsed(AttachmentPointName.R2) &&
        firstMonomer.isAttachmentPointUsed(AttachmentPointName.R1)) ||
      (secondMonomer.isAttachmentPointUsed(AttachmentPointName.R2) &&
        secondMonomer.isAttachmentPointUsed(AttachmentPointName.R1));

    if (
      hasPlentyAttachmentPoints &&
      hasPlentyFreeAttachmentPoints &&
      (BothR1AttachmentPointUsed ||
        BothR2AttachmentPointUsed ||
        R1AndR2AttachmentPointUsed)
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Returns true when the two attachment point names belong to the same group
 * (e.g. both are "R1", both are "R2", etc.) — i.e. a non-standard same-group
 * bond is being formed.
 */
export function isNonStandardSameGroupBond(
  sourceAP: AttachmentPointName,
  targetAP: AttachmentPointName,
): boolean {
  return sourceAP === targetAP;
}

/**
 * For a preset (RNA nucleotide: sugar + optional base + optional phosphate) being
 * dropped onto a target attachment point, find the best component within the preset
 * to form the bond.
 *
 * Implements requirements 3.1–3.3 from drag-drop-bond-establishment:
 * - R1 target → preset component with free R2
 * - R2 target → preset component with free R1
 * - Otherwise (Rn, n>2) → sugar if it has any free AP, then phosphate, then base
 * - All exhausted → `undefined` (bond is silently skipped; preset is placed without bonding)
 *
 * @param addedMonomers  The monomers that were just added to the canvas as part of the preset.
 * @param targetAP       The attachment point name on the canvas monomer that is being targeted.
 * @returns The preset component to bond, or `undefined` if none can be resolved.
 */
export function findPresetMonomerForBonding(
  addedMonomers: BaseMonomer[],
  targetAP: AttachmentPointName,
): BaseMonomer | undefined {
  const oppositeAP =
    targetAP === AttachmentPointName.R1
      ? AttachmentPointName.R2
      : targetAP === AttachmentPointName.R2
      ? AttachmentPointName.R1
      : null;

  if (oppositeAP) {
    const match = addedMonomers.find((m) =>
      m.isAttachmentPointExistAndFree(oppositeAP),
    );
    if (match) return match;
  }

  // Fallback per requirement 3.3: sugar → phosphate → base
  const sugar = addedMonomers.find(
    (m) => m instanceof Sugar && m.hasFreeAttachmentPoint,
  );
  if (sugar) return sugar;

  const phosphate = addedMonomers.find(
    (m) => m instanceof Phosphate && m.hasFreeAttachmentPoint,
  );
  if (phosphate) return phosphate;

  const base = addedMonomers.find(
    (m) => m instanceof RNABase && m.hasFreeAttachmentPoint,
  );
  return base;
}
