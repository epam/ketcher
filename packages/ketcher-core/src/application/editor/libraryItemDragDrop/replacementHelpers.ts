/**
 * Helpers for the monomer-replacement drag-drop feature.
 *
 * These pure functions handle:
 *  - Preset geometry equality comparison (presetsHaveSameGeometry)
 *  - Bond collection from an existing monomer (collectMonomerBonds)
 *  - Re-establishment plan computation (computeReestablishableBonds)
 *  - Preset-level bond mapping (mapPresetBonds)
 */

import type { IRnaPreset } from 'application/editor/tools/Tool';
import type { BaseMonomer } from 'domain/entities/BaseMonomer';
import type { AttachmentPointName } from 'domain/types';
import { PolymerBond } from 'domain/entities/PolymerBond';
import { HydrogenBond } from 'domain/entities/HydrogenBond';
import { MonomerToAtomBond } from 'domain/entities/MonomerToAtomBond';
import {
  isSugarOrAmbiguousSugar,
  isRnaBaseOrAmbiguousRnaBase,
  isPhosphateOrAmbiguousPhosphate,
  getRnaBaseFromSugar,
  getPhosphateFromSugar,
} from 'domain/helpers/monomers';
import { Sugar } from 'domain/entities/Sugar';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BondRecord = {
  /** The attachment point name on the original monomer */
  attachmentPointName: AttachmentPointName;
  bond: PolymerBond | HydrogenBond | MonomerToAtomBond;
  /** The other entity involved in the bond */
  otherEntity: BaseMonomer;
  /**
   * For polymer bonds: the AP name on the *other* monomer that the bond
   * connects to. Used when re-establishing bonds on the replacement monomer.
   */
  otherAttachmentPointName: AttachmentPointName | null;
};

export type BondReestablishmentPlan = {
  /** Bonds that can be re-established on the new monomer */
  reestablishable: BondRecord[];
  /** Bonds that cannot be re-established (AP absent on new monomer) */
  lost: BondRecord[];
};

// ---------------------------------------------------------------------------
// 3.1 presetsHaveSameGeometry
// ---------------------------------------------------------------------------

/**
 * Returns true when two RNA presets have the same component types (sugar,
 * base, and phosphate presence) and the same phosphate position (5′/3′).
 *
 * "Same geometry" means the external bonding topology is identical, so the
 * whole-preset replacement can reuse the same inter-preset APs.
 *
 * Note: This intentionally does NOT compare monomer identities (names/types).
 * It only compares which structural slots are filled and the phosphate
 * orientation.
 */
export function presetsHaveSameGeometry(
  presetA: IRnaPreset,
  presetB: IRnaPreset,
): boolean {
  const hasSugarA = Boolean(presetA.sugar);
  const hasSugarB = Boolean(presetB.sugar);
  if (hasSugarA !== hasSugarB) return false;

  const hasBaseA = Boolean(presetA.base);
  const hasBaseB = Boolean(presetB.base);
  if (hasBaseA !== hasBaseB) return false;

  const hasPhosphateA = Boolean(presetA.phosphate);
  const hasPhosphateB = Boolean(presetB.phosphate);
  if (hasPhosphateA !== hasPhosphateB) return false;

  // Both must have the same phosphate position if both have a phosphate.
  // `undefined` (default) is treated as '5prime' to match RNA builder
  // conventions where the phosphate defaults to the left (5′) end.
  if (hasPhosphateA) {
    const posA = presetA.phosphatePosition ?? 'left';
    const posB = presetB.phosphatePosition ?? 'left';
    if (posA !== posB) return false;
  }

  return true;
}

// ---------------------------------------------------------------------------
// 4.1 collectMonomerBonds
// ---------------------------------------------------------------------------

/**
 * Returns all bonds attached to `monomer`, keyed by attachment-point name.
 *
 * Includes:
 *  - Polymer bonds (on named Rn APs)
 *  - Monomer-to-atom bonds (on named Rn APs)
 *  - Hydrogen bonds (collected under the special HYDROGEN key)
 */
export function collectMonomerBonds(monomer: BaseMonomer): BondRecord[] {
  const records: BondRecord[] = [];

  // Covalent bonds on named attachment points
  for (const apName in monomer.attachmentPointsToBonds) {
    const bond = monomer.attachmentPointsToBonds[apName];
    if (!bond) continue;

    let otherEntity: BaseMonomer | null = null;
    let otherAP: AttachmentPointName | null = null;

    if (bond instanceof PolymerBond) {
      otherEntity =
        bond.firstMonomer === monomer
          ? bond.secondMonomer ?? null
          : bond.firstMonomer;
      otherAP =
        bond.firstMonomer === monomer
          ? bond.secondMonomerAttachmentPoint ?? null
          : bond.firstMonomerAttachmentPoint ?? null;
    } else if (bond instanceof MonomerToAtomBond) {
      // MonomerToAtomBond connects a monomer to an atom; we treat the atom
      // side as the "other entity" placeholder — but MonomerToAtomBond
      // doesn't have a monomer on the other end, so we skip re-routing it
      // through the generic AP matching. These bonds are handled separately.
      otherEntity = null;
    }

    if (otherEntity) {
      records.push({
        attachmentPointName: apName as AttachmentPointName,
        bond,
        otherEntity,
        otherAttachmentPointName: otherAP,
      });
    }
  }

  // Hydrogen bonds
  for (const hydrogenBond of monomer.hydrogenBonds) {
    const otherMonomer =
      hydrogenBond.firstMonomer === monomer
        ? hydrogenBond.secondMonomer
        : hydrogenBond.firstMonomer;
    if (otherMonomer) {
      records.push({
        attachmentPointName: 'hydrogen' as AttachmentPointName,
        bond: hydrogenBond,
        otherEntity: otherMonomer,
        otherAttachmentPointName: null,
      });
    }
  }

  return records;
}

// ---------------------------------------------------------------------------
// 4.2 computeReestablishableBonds
// ---------------------------------------------------------------------------

/**
 * Given the bonds collected from an original monomer and a new replacement
 * monomer, returns two lists:
 *
 * - `reestablishable`: bonds whose attachment point exists and is free on
 *   `newMonomer`
 * - `lost`: bonds that cannot be re-established
 */
export function computeReestablishableBonds(
  originalBonds: BondRecord[],
  newMonomer: BaseMonomer,
): BondReestablishmentPlan {
  const reestablishable: BondRecord[] = [];
  const lost: BondRecord[] = [];

  for (const record of originalBonds) {
    if (record.attachmentPointName === ('hydrogen' as AttachmentPointName)) {
      // Hydrogen bonds are always re-established on the same entity — they
      // don't go through named Rn APs, so they are always reestablishable.
      reestablishable.push(record);
      continue;
    }

    if (newMonomer.isAttachmentPointExistAndFree(record.attachmentPointName)) {
      reestablishable.push(record);
    } else {
      lost.push(record);
    }
  }

  return { reestablishable, lost };
}

// ---------------------------------------------------------------------------
// 4.3 mapPresetBonds
// ---------------------------------------------------------------------------

/**
 * For a whole-preset replacement, maps each original preset component's
 * external bonds to the corresponding new preset component's APs.
 *
 * A "corresponding" component means: sugar↔sugar, base↔base,
 * phosphate↔phosphate. Internal intra-preset bonds are excluded since they
 * will be re-created by `addRnaPreset`.
 *
 * Returns the combined reestablishable / lost-bond lists across all preset
 * components.
 */
export function mapPresetBonds(
  originalComponents: BaseMonomer[],
  newComponents: BaseMonomer[],
): BondReestablishmentPlan {
  const reestablishable: BondRecord[] = [];
  const lost: BondRecord[] = [];

  for (const originalMonomer of originalComponents) {
    // Find the new monomer that occupies the same structural role.
    const newMonomer = findMatchingPresetComponent(
      originalMonomer,
      newComponents,
    );
    if (!newMonomer) {
      // Role doesn't exist in the new preset — all bonds from this component
      // are lost.
      const bonds = collectMonomerBonds(originalMonomer);
      const externalBonds = filterExternalBonds(bonds, originalComponents);
      lost.push(...externalBonds);
      continue;
    }

    const bonds = collectMonomerBonds(originalMonomer);
    const externalBonds = filterExternalBonds(bonds, originalComponents);
    const plan = computeReestablishableBonds(externalBonds, newMonomer);
    reestablishable.push(...plan.reestablishable);
    lost.push(...plan.lost);
  }

  return { reestablishable, lost };
}

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

/**
 * Returns the monomer in `newComponents` that plays the same structural role
 * as `originalMonomer` (sugar ↔ sugar, base ↔ base, phosphate ↔ phosphate).
 */
function findMatchingPresetComponent(
  originalMonomer: BaseMonomer,
  newComponents: BaseMonomer[],
): BaseMonomer | undefined {
  if (isSugarOrAmbiguousSugar(originalMonomer)) {
    return newComponents.find(isSugarOrAmbiguousSugar);
  }
  if (isRnaBaseOrAmbiguousRnaBase(originalMonomer)) {
    return newComponents.find(isRnaBaseOrAmbiguousRnaBase);
  }
  if (isPhosphateOrAmbiguousPhosphate(originalMonomer)) {
    return newComponents.find(isPhosphateOrAmbiguousPhosphate);
  }
  return undefined;
}

/**
 * Filters out internal intra-preset bonds (bonds where both ends are within
 * `presetComponents`), retaining only bonds to external monomers.
 */
function filterExternalBonds(
  bonds: BondRecord[],
  presetComponents: BaseMonomer[],
): BondRecord[] {
  return bonds.filter(
    (record) => !presetComponents.includes(record.otherEntity),
  );
}

// ---------------------------------------------------------------------------
// Preset component extraction helper
// ---------------------------------------------------------------------------

/**
 * Given a sugar monomer, returns all canvas monomers that are part of its
 * RNA preset (sugar, base, phosphate).
 *
 * Returns an empty array if the sugar is not part of an RNA preset
 * (i.e., no R3-connected base).
 */
export function getPresetComponentsFromSugar(
  sugar: BaseMonomer,
): BaseMonomer[] {
  if (!isSugarOrAmbiguousSugar(sugar)) return [];

  const components: BaseMonomer[] = [sugar];

  const rnaBase = getRnaBaseFromSugar(sugar);
  if (rnaBase) components.push(rnaBase);

  const phosphate = getPhosphateFromSugar(sugar);
  if (phosphate) components.push(phosphate);

  return components;
}

/**
 * Given any monomer, returns the sugar of the RNA preset it belongs to,
 * or null if it is not part of an RNA preset.
 */
export function getPresetSugarForMonomer(monomer: BaseMonomer): Sugar | null {
  if (isSugarOrAmbiguousSugar(monomer)) {
    // A sugar is in an RNA preset only if it has an attached base (R3)
    if (getRnaBaseFromSugar(monomer)) {
      return monomer as Sugar;
    }
    return null;
  }

  // For a base: look up via R3 bond back to sugar
  if (isRnaBaseOrAmbiguousRnaBase(monomer)) {
    const r1Bond = monomer.attachmentPointsToBonds['R1'];
    if (r1Bond instanceof PolymerBond) {
      const other = r1Bond.getAnotherMonomer(monomer);
      if (other instanceof Sugar) {
        return other;
      }
    }
    return null;
  }

  // For a phosphate: look up via R1 or R2 bond to sugar
  if (isPhosphateOrAmbiguousPhosphate(monomer)) {
    for (const apName of ['R1', 'R2']) {
      const bond = monomer.attachmentPointsToBonds[apName];
      if (bond instanceof PolymerBond) {
        const other = bond.getAnotherMonomer(monomer);
        if (other instanceof Sugar) {
          return other;
        }
      }
    }
    return null;
  }

  return null;
}
