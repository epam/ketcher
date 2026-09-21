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
import { AttachmentPointName } from 'domain/types';
import { PolymerBond } from 'domain/entities/PolymerBond';
import type { HydrogenBond } from 'domain/entities/HydrogenBond';
import { MonomerToAtomBond } from 'domain/entities/MonomerToAtomBond';
import {
  isSugarOrAmbiguousSugar,
  isRnaBaseOrAmbiguousRnaBase,
  isPhosphateOrAmbiguousPhosphate,
  getRnaBaseFromSugar,
  getSugarFromRnaBase,
} from 'domain/helpers/monomers';

/**
 * The subset of an RNA preset that describes its geometry (which structural
 * slots are filled and where the phosphate sits). Used to drive canvas preset
 * detection from the dragged library item.
 */
export type PresetGeometry = Pick<
  IRnaPreset,
  'base' | 'phosphate' | 'phosphatePosition'
>;

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
    let otherAttachmentPoint: AttachmentPointName | null = null;

    if (bond instanceof PolymerBond) {
      otherEntity =
        bond.firstMonomer === monomer
          ? (bond.secondMonomer ?? null)
          : bond.firstMonomer;
      otherAttachmentPoint =
        bond.firstMonomer === monomer
          ? (bond.secondMonomerAttachmentPoint ?? null)
          : (bond.firstMonomerAttachmentPoint ?? null);
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
        otherAttachmentPointName: otherAttachmentPoint,
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

/**
 * Finds the phosphate that belongs to `sugar`'s RNA preset on the requested
 * side, matching the RNA backbone convention:
 *
 *  - 'right' (3′): sugar.R2 ↔ phosphate.R1
 *  - 'left'  (5′): sugar.R1 ↔ phosphate.R2
 *
 * Returns null when no phosphate is attached on that side. The AP on the
 * phosphate is verified so that a *neighbouring* nucleotide's phosphate (which
 * connects to the opposite AP) is not mistaken for this preset's phosphate.
 */
export function getPresetPhosphateFromSugar(
  sugar: BaseMonomer,
  position: 'left' | 'right',
): BaseMonomer | null {
  const sugarAP = position === 'left' ? 'R1' : 'R2';
  const phosphateAP = position === 'left' ? 'R2' : 'R1';

  const bond = sugar.attachmentPointsToBonds[sugarAP];
  if (bond instanceof PolymerBond) {
    const other = bond.getAnotherMonomer(sugar);
    if (
      other &&
      isPhosphateOrAmbiguousPhosphate(other) &&
      other.getAttachmentPointByBond(bond) === phosphateAP
    ) {
      return other;
    }
  }

  return null;
}

/**
 * Resolves the sugar anchor of the RNA preset that `monomer` belongs to,
 * using the dragged `libraryPreset` to disambiguate which side a phosphate
 * belongs to. Returns null if no sugar anchor can be resolved.
 *
 * Unlike a plain "is this a preset?" check, this does NOT require the sugar to
 * carry a base — a preset may legitimately be sugar+phosphate (no base) or
 * sugar+base (no phosphate). Whether the canvas preset actually matches the
 * dragged preset is decided later by getMatchingPresetComponents.
 */
export function getPresetSugarForMonomer(
  monomer: BaseMonomer,
  libraryPreset: PresetGeometry,
): BaseMonomer | null {
  if (isSugarOrAmbiguousSugar(monomer)) {
    return monomer;
  }

  if (isRnaBaseOrAmbiguousRnaBase(monomer)) {
    return getSugarFromRnaBase(monomer) ?? null;
  }

  if (isPhosphateOrAmbiguousPhosphate(monomer)) {
    // Prefer the sugar on the side implied by the dragged preset, but fall
    // back to the other side so hovering any phosphate still resolves an
    // anchor (the final geometry match is validated separately).
    const preferredAP =
      (libraryPreset.phosphatePosition ?? 'right') === 'left'
        ? AttachmentPointName.R2
        : AttachmentPointName.R1;
    const apOrder =
      preferredAP === AttachmentPointName.R1
        ? [AttachmentPointName.R1, AttachmentPointName.R2]
        : [AttachmentPointName.R2, AttachmentPointName.R1];

    for (const apName of apOrder) {
      const bond = monomer.attachmentPointsToBonds[apName];
      if (bond instanceof PolymerBond) {
        const other = bond.getAnotherMonomer(monomer);
        if (other && isSugarOrAmbiguousSugar(other)) {
          return other;
        }
      }
    }
  }

  return null;
}

/**
 * Given a sugar anchor and the dragged `libraryPreset`, returns the canvas
 * monomers that structurally correspond to the library preset's components
 * (sugar, base if the library preset has one, phosphate on the library
 * preset's side if it has one).
 *
 * Returns null when the canvas preset does not contain every component the
 * library preset provides — i.e. the geometries differ — so the caller can
 * fall back to single-monomer replacement.
 *
 * Note: components the library preset does NOT provide (e.g. a base when the
 * dragged preset is sugar+phosphate) are intentionally excluded even if the
 * sugar carries them, so only the parts that exist in the dragged preset are
 * highlighted and replaced.
 */
export function getMatchingPresetComponents(
  sugar: BaseMonomer,
  libraryPreset: PresetGeometry,
): BaseMonomer[] | null {
  if (!isSugarOrAmbiguousSugar(sugar)) return null;

  const components: BaseMonomer[] = [sugar];

  if (libraryPreset.base) {
    const base = getRnaBaseFromSugar(sugar);
    if (!base) return null;
    components.push(base);
  }

  if (libraryPreset.phosphate) {
    const position = libraryPreset.phosphatePosition ?? 'right';
    const phosphate = getPresetPhosphateFromSugar(sugar, position);
    if (!phosphate) return null;
    components.push(phosphate);
  }

  return components;
}

export type PresetComponentRole = 'sugar' | 'base' | 'phosphate';

/**
 * Returns the structural role of a monomer within an RNA preset, or null when
 * it is not a recognised RNA component type.
 */
export function getPresetComponentRole(
  monomer: BaseMonomer,
): PresetComponentRole | null {
  if (isSugarOrAmbiguousSugar(monomer)) return 'sugar';
  if (isRnaBaseOrAmbiguousRnaBase(monomer)) return 'base';
  if (isPhosphateOrAmbiguousPhosphate(monomer)) return 'phosphate';
  return null;
}

const HYDROGEN = 'hydrogen' as AttachmentPointName;

/**
 * Computes which of `oldMonomer`'s existing bonds would be LOST if it were
 * replaced by a monomer whose free attachment points are `newFreeAPs`.
 *
 * A bond is lost when its attachment point does not exist (or is not free) on
 * the replacement monomer. Hydrogen bonds are never lost (they don't route
 * through named Rn attachment points).
 */
export function computeLostBondsForMonomerReplacement(
  oldMonomer: BaseMonomer,
  newFreeAPs: Set<AttachmentPointName>,
): BondRecord[] {
  return collectMonomerBonds(oldMonomer).filter(
    (record) =>
      record.attachmentPointName !== HYDROGEN &&
      !newFreeAPs.has(record.attachmentPointName),
  );
}

/**
 * Computes which EXTERNAL bonds would be LOST when replacing the given preset
 * components with a new preset whose per-role free attachment points are
 * `newFreeAPsByRole`. `rolePresent` indicates which roles the new preset
 * provides.
 *
 * Internal intra-preset bonds are ignored (they are recreated by the new
 * preset). Bonds to monomers that remain on the canvas (e.g. a base kept when
 * dropping a sugar+phosphate preset) are external and preserved when the
 * corresponding new component still exposes the attachment point.
 */
export function computeLostBondsForPresetReplacement(
  originalComponents: BaseMonomer[],
  newFreeAPsByRole: Record<PresetComponentRole, Set<AttachmentPointName>>,
  rolePresent: Record<PresetComponentRole, boolean>,
): BondRecord[] {
  const lost: BondRecord[] = [];

  for (const component of originalComponents) {
    const externalBonds = collectMonomerBonds(component).filter(
      (record) =>
        !originalComponents.includes(record.otherEntity) &&
        record.attachmentPointName !== HYDROGEN,
    );

    const role = getPresetComponentRole(component);

    if (!role || !rolePresent[role]) {
      // The new preset has no component of this role → every external bond on
      // the old component is lost.
      lost.push(...externalBonds);
      continue;
    }

    const freeAPs = newFreeAPsByRole[role];
    for (const record of externalBonds) {
      if (!freeAPs.has(record.attachmentPointName)) {
        lost.push(record);
      }
    }
  }

  return lost;
}
