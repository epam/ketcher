import {
  Bond,
  type BondAttributes,
  ATTACHMENT_GROUP_HAPTIC_BOND_ERROR_MESSAGE,
  HAPTIC_BOND_ERROR_MESSAGE,
  getHapticBondEndPosition,
  type ReStruct,
  type Struct,
  isHapticBondPairAllowed,
  isAttachmentGroup,
  Vec2,
} from 'ketcher-core';

import type Editor from '../Editor';

export type AtomValidationInput = number | { label: string };

export type BondValidationFailure = 'attachmentGroup' | 'haptic';

export interface HapticBondDragFlags {
  hapticValidationFailed: boolean;
  attachmentGroupValidationFailed: boolean;
}

export const HAPTIC_BOND_ATTACHMENT_GROUP_RADIUS_PX = 20;

export function findHapticBondAttachmentGroupTarget(
  restruct: ReStruct,
  pointerPosition: Vec2,
): number | null {
  const { microModeScale, zoom } = restruct.render.options;
  const radiusInModelCoordinates =
    HAPTIC_BOND_ATTACHMENT_GROUP_RADIUS_PX / (microModeScale * zoom);
  let closestAttachmentGroupId: number | null = null;
  let closestDistance = radiusInModelCoordinates;

  restruct.visibleAttachmentGroups.forEach((attachmentGroup, id) => {
    const distance = Vec2.dist(pointerPosition, attachmentGroup.a.pp);
    if (distance <= closestDistance) {
      closestAttachmentGroupId = id;
      closestDistance = distance;
    }
  });

  return closestAttachmentGroupId;
}

export function createHapticBondDragFlags(): HapticBondDragFlags {
  return {
    hapticValidationFailed: false,
    attachmentGroupValidationFailed: false,
  };
}

export class HapticBondToolHelper {
  private readonly editor: Editor;
  private readonly bondProperties: Partial<BondAttributes>;

  constructor(editor: Editor, bondProperties: Partial<BondAttributes>) {
    this.editor = editor;
    this.bondProperties = bondProperties;
  }

  isHapticBondType() {
    return this.bondProperties.type === Bond.PATTERN.TYPE.HAPTIC;
  }

  getNewAtomPosition(start: Vec2, end: Vec2) {
    return this.isHapticBondType() ? getHapticBondEndPosition(start, end) : end;
  }

  getAtomForValidation(
    molecule: Struct,
    atomOrProperties: AtomValidationInput,
  ) {
    return typeof atomOrProperties === 'number'
      ? molecule.getBondEndpoint(atomOrProperties)
      : atomOrProperties;
  }

  isAttachmentGroupInvolved(
    molecule: Struct,
    beginAtomOrProperties: AtomValidationInput,
    endAtomOrProperties: AtomValidationInput,
  ) {
    const beginAtom = this.getAtomForValidation(
      molecule,
      beginAtomOrProperties,
    );
    const endAtom = this.getAtomForValidation(molecule, endAtomOrProperties);

    return isAttachmentGroup(beginAtom) || isAttachmentGroup(endAtom);
  }

  isValidHapticBond(
    molecule: Struct,
    beginAtomOrProperties: AtomValidationInput,
    endAtomOrProperties: AtomValidationInput,
  ) {
    if (!this.isHapticBondType()) {
      return true;
    }

    return isHapticBondPairAllowed(
      this.getAtomForValidation(molecule, beginAtomOrProperties),
      this.getAtomForValidation(molecule, endAtomOrProperties),
    );
  }

  getBondPairValidationFailure(
    molecule: Struct,
    beginAtomOrProperties: AtomValidationInput,
    endAtomOrProperties: AtomValidationInput,
  ): BondValidationFailure | null {
    if (
      !this.isHapticBondType() &&
      this.isAttachmentGroupInvolved(
        molecule,
        beginAtomOrProperties,
        endAtomOrProperties,
      )
    ) {
      return 'attachmentGroup';
    }

    if (
      !this.isValidHapticBond(
        molecule,
        beginAtomOrProperties,
        endAtomOrProperties,
      )
    ) {
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
    clearDragContext: () => void,
  ) {
    this.showValidationError(failure);
    clearDragContext();
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
