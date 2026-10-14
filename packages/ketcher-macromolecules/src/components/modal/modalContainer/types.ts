import { BaseMonomer, PolymerBond } from 'ketcher-core';

export interface MonomerConnectionOnlyProps {
  firstMonomer?: BaseMonomer;
  secondMonomer?: BaseMonomer;
  polymerBond?: PolymerBond;
  isReconnectionDialog?: boolean;
}

export interface ConfirmationDialogOnlyProps {
  title?: string;
  confirmationText?: string;
  onConfirm?: () => void;
}

export interface RequiredModalProps {
  onClose: () => void;
  isModalOpen: boolean;
}
export type MonomerConnectionProps = MonomerConnectionOnlyProps &
  RequiredModalProps;

export type ConfirmationDialogProps = ConfirmationDialogOnlyProps &
  RequiredModalProps;

export type AdditionalModalProps = Partial<
  MonomerConnectionProps & ConfirmationDialogProps
>;
