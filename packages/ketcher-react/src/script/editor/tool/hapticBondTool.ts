import {
  Bond,
  HAPTIC_BOND_ERROR_MESSAGE,
  SAP_HAPTIC_BOND_ERROR_MESSAGE,
  isHapticBondPairAllowed,
  isSuperAttachmentPointAtom,
} from 'ketcher-core';

import type Editor from '../Editor';

export type AtomValidationInput =
  | number
  | { label: string; endpoints?: number[] };

export type BondValidationFailure = 'sap' | 'haptic';

export interface HapticBondDragFlags {
  hapticValidationFailed: boolean;
  sapValidationFailed: boolean;
}

export function createHapticBondDragFlags(): HapticBondDragFlags {
  return {
    hapticValidationFailed: false,
    sapValidationFailed: false,
  };
}

export class HapticBondToolHelper {
  private readonly editor: Editor;
  private readonly bondProps: { type?: number };

  constructor(editor: Editor, bondProps: { type?: number }) {
    this.editor = editor;
    this.bondProps = bondProps;
  }

  isHapticBondType() {
    return this.bondProps.type === Bond.PATTERN.TYPE.HAPTIC;
  }

  getAtomForValidation(molecule, atomOrProps: AtomValidationInput) {
    return typeof atomOrProps === 'number'
      ? molecule.atoms.get(atomOrProps)
      : atomOrProps;
  }

  isSuperAttachmentBondInvolved(
    molecule,
    beginAtomOrProps: AtomValidationInput,
    endAtomOrProps: AtomValidationInput,
  ) {
    const beginAtom = this.getAtomForValidation(molecule, beginAtomOrProps);
    const endAtom = this.getAtomForValidation(molecule, endAtomOrProps);

    return (
      isSuperAttachmentPointAtom(beginAtom) ||
      isSuperAttachmentPointAtom(endAtom)
    );
  }

  isValidHapticBond(
    molecule,
    beginAtomOrProps: AtomValidationInput,
    endAtomOrProps: AtomValidationInput,
  ) {
    if (!this.isHapticBondType()) {
      return true;
    }

    return isHapticBondPairAllowed(
      this.getAtomForValidation(molecule, beginAtomOrProps),
      this.getAtomForValidation(molecule, endAtomOrProps),
    );
  }

  getBondPairValidationFailure(
    molecule,
    beginAtomOrProps: AtomValidationInput,
    endAtomOrProps: AtomValidationInput,
  ): BondValidationFailure | null {
    if (
      !this.isHapticBondType() &&
      this.isSuperAttachmentBondInvolved(
        molecule,
        beginAtomOrProps,
        endAtomOrProps,
      )
    ) {
      return 'sap';
    }

    if (!this.isValidHapticBond(molecule, beginAtomOrProps, endAtomOrProps)) {
      return 'haptic';
    }

    return null;
  }

  hasInvalidSelectedHapticBonds(molecule, selectedBonds: number[]) {
    if (!this.isHapticBondType()) {
      return false;
    }

    return selectedBonds.some((bondId) => {
      const bond = molecule.bonds.get(bondId);

      return !bond || !this.isValidHapticBond(molecule, bond.begin, bond.end);
    });
  }

  applyValidationFailure(
    dragFlags: HapticBondDragFlags,
    failure: BondValidationFailure,
  ) {
    if (failure === 'sap') {
      dragFlags.sapValidationFailed = true;
    } else {
      dragFlags.hapticValidationFailed = true;
    }
  }

  clearValidationFlags(dragFlags: HapticBondDragFlags) {
    dragFlags.hapticValidationFailed = false;
    dragFlags.sapValidationFailed = false;
  }

  showValidationError(failure: BondValidationFailure) {
    this.editor.errorHandler?.(
      failure === 'sap'
        ? SAP_HAPTIC_BOND_ERROR_MESSAGE
        : HAPTIC_BOND_ERROR_MESSAGE,
    );
  }

  cancelBondDragWithValidationError(
    event,
    failure: BondValidationFailure,
    clearDragCtx: () => void,
  ) {
    this.showValidationError(failure);
    clearDragCtx();
    this.editor.event.message.dispatch({
      info: false,
    });
    this.editor.hover(
      this.editor.findItem(event, ['atoms', 'bonds']),
      null,
      event,
    );
  }

  resolveDragEndValidationFailure(
    dragFlags: HapticBondDragFlags,
    molecule,
    hasItem: boolean,
  ): BondValidationFailure | null {
    if (dragFlags.hapticValidationFailed) {
      return 'haptic';
    }

    if (dragFlags.sapValidationFailed) {
      return 'sap';
    }

    if (
      !hasItem &&
      this.isHapticBondType() &&
      !this.isValidHapticBond(molecule, { label: 'C' }, { label: 'C' })
    ) {
      return 'haptic';
    }

    return null;
  }
}
