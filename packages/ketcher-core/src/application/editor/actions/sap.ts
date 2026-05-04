import { Action } from './action';
import { ReStruct } from '../../render';
import {
  HapticBondAdd,
  HapticBondDelete,
  SuperAPAdd,
  SuperAPAtomsChange,
  SuperAPDelete,
} from '../operations/sap';
import { Bond } from 'domain/entities/bond';
import { HapticBond } from 'domain/entities/HapticBond';
import { SuperAttachmentPoint } from 'domain/entities/superAttachmentPoint';

export type HapticBondAdditionResult =
  | { ok: true; bondId: number }
  | { ok: false; reason: string };

export function fromSAPAddition(
  reStruct: ReStruct,
  atomIds: number[],
): { action: Action; sapId: number } {
  const action = new Action();
  const op = new SuperAPAdd(atomIds);
  action.addOp(op.perform(reStruct));
  return { action, sapId: op.sapId as number };
}

// Eraser cascade (Section I1): deleting a SAP also deletes every haptic
// bond that referenced it. The bond ops live in operations/sap.ts so they
// don't go through halfBond machinery (haptic bonds have none — see
// Section X).
export function fromSAPDelete(reStruct: ReStruct, sapId: number): Action {
  const action = new Action();
  const struct = reStruct.molecule;
  if (!struct.superAttachmentPoints.get(sapId)) return action;

  const incident: number[] = [];
  struct.bonds.forEach((bond, bid) => {
    if (
      bond.type === Bond.PATTERN.TYPE.HAPTIC &&
      (bond as HapticBond).sapId === sapId
    ) {
      incident.push(bid);
    }
  });
  for (const bid of incident) {
    action.addOp(new HapticBondDelete(bid).perform(reStruct));
  }

  action.addOp(new SuperAPDelete(sapId).perform(reStruct));
  return action;
}

export function fromSAPAtomsChange(
  reStruct: ReStruct,
  sapId: number,
  newAtoms: number[],
): Action {
  const action = new Action();
  const struct = reStruct.molecule;
  const sap = struct.superAttachmentPoints.get(sapId);
  if (!sap) return action;

  if (newAtoms.length < 2) {
    return fromSAPDelete(reStruct, sapId);
  }

  for (const aid of newAtoms) {
    const other = SuperAttachmentPoint.findForAtom(struct, aid);
    if (other && other !== sap) {
      return action;
    }
  }

  action.addOp(new SuperAPAtomsChange(sapId, newAtoms).perform(reStruct));
  return action;
}

const HAPTIC_BOND_ENDPOINT_ERROR =
  'A haptic bond can be established only between a super-attachment point and a central atom.';

/**
 * Add a haptic bond between a real atom (the metal/central atom) and a SAP.
 * Validates that the inputs identify a real atom + a real SAP, that the atom
 * is not itself a SAP member, and that no haptic bond already exists between
 * the same (atom, SAP) pair (dedupe per spec G2).
 */
export function fromHapticBondAddition(
  reStruct: ReStruct,
  atomId: number,
  sapId: number,
): { action: Action; result: HapticBondAdditionResult } {
  const action = new Action();
  const struct = reStruct.molecule;

  if (!struct.atoms.has(atomId) || !struct.superAttachmentPoints.has(sapId)) {
    return {
      action,
      result: { ok: false, reason: HAPTIC_BOND_ENDPOINT_ERROR },
    };
  }
  const atomSap = SuperAttachmentPoint.findForAtom(struct, atomId);
  if (atomSap) {
    return {
      action,
      result: { ok: false, reason: HAPTIC_BOND_ENDPOINT_ERROR },
    };
  }

  for (const bond of struct.bonds.values()) {
    if (
      bond.type === Bond.PATTERN.TYPE.HAPTIC &&
      bond.begin === atomId &&
      (bond as HapticBond).sapId === sapId
    ) {
      return {
        action,
        result: { ok: true, bondId: -1 },
      };
    }
  }

  const op = new HapticBondAdd(atomId, sapId);
  action.addOp(op.perform(reStruct));
  return {
    action,
    result: { ok: true, bondId: op.bondId as number },
  };
}
