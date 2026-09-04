import {
  Bond,
  type BondAttributes,
  ATTACHMENT_GROUP_HAPTIC_BOND_ERROR_MESSAGE,
  HAPTIC_BOND_ERROR_MESSAGE,
  getHapticBondEndPosition,
  type Struct,
  isHapticBondPairAllowed,
  isAttachmentGroup,
  type Vec2,
} from 'ketcher-core';

import type Editor from '../Editor';

export type AtomValidationInput = number | { label: string };

export type BondValidationFailure = 'attachmentGroup' | 'haptic';

export interface HapticBondDragFlags {
  hapticValidationFailed: boolean;
  attachmentGroupValidationFailed: boolean;
}

export function createHapticBondDragFlags(): HapticBondDragFlags {
  return {
    hapticValidationFailed: false,
    attachmentGroupValidationFailed: false,
  };
}

export class HapticBondToolHelper {
  private readonly editor: Editor;
  private readonly bondProps: Partial<BondAttributes>;

  constructor(editor: Editor, bondProps: Partial<BondAttributes>) {
    this.editor = editor;
    this.bondProps = bondProps;
  }

  isHapticBondType() {
    return this.bondProps.type === Bond.PATTERN.TYPE.HAPTIC;
  }

  getNewAtomPosition(start: Vec2, end: Vec2) {
    return this.isHapticBondType() ? getHapticBondEndPosition(start, end) : end;
  }

  getAtomForValidation(molecule: Struct, atomOrProps: AtomValidationInput) {
    return typeof atomOrProps === 'number'
      ? molecule.getBondEndpoint(atomOrProps)
      : atomOrProps;
  }

  isAttachmentGroupInvolved(
    molecule: Struct,
    beginAtomOrProps: AtomValidationInput,
    endAtomOrProps: AtomValidationInput,
  ) {
    const beginAtom = this.getAtomForValidation(molecule, beginAtomOrProps);
    const endAtom = this.getAtomForValidation(molecule, endAtomOrProps);

    return isAttachmentGroup(beginAtom) || isAttachmentGroup(endAtom);
  }

  isValidHapticBond(
    molecule: Struct,
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
    molecule: Struct,
    beginAtomOrProps: AtomValidationInput,
    endAtomOrProps: AtomValidationInput,
  ): BondValidationFailure | null {
    if (
      !this.isHapticBondType() &&
      this.isAttachmentGroupInvolved(molecule, beginAtomOrProps, endAtomOrProps)
    ) {
      return 'attachmentGroup';
    }

    if (!this.isValidHapticBond(molecule, beginAtomOrProps, endAtomOrProps)) {
      return 'haptic';
    }

    return null;
  }

  hasInvalidSelectedHapticBonds(molecule: Struct, selectedBonds: number[]) {
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
    if (failure === 'attachmentGroup') {
      dragFlags.attachmentGroupValidationFailed = true;
    } else {
      dragFlags.hapticValidationFailed = true;
    }
  }

  clearValidationFlags(dragFlags: HapticBondDragFlags) {
    dragFlags.hapticValidationFailed = false;
    dragFlags.attachmentGroupValidationFailed = false;
  }

  showValidationError(failure: BondValidationFailure) {
    this.editor.errorHandler?.(
      failure === 'attachmentGroup'
        ? ATTACHMENT_GROUP_HAPTIC_BOND_ERROR_MESSAGE
        : HAPTIC_BOND_ERROR_MESSAGE,
    );
  }

  cancelBondDragWithValidationError(
    event: PointerEvent,
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
    molecule: Struct,
    hasItem: boolean,
  ): BondValidationFailure | null {
    if (dragFlags.hapticValidationFailed) {
      return 'haptic';
    }

    if (dragFlags.attachmentGroupValidationFailed) {
      return 'attachmentGroup';
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
