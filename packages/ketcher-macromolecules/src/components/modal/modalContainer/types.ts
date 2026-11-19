import { BaseMonomer, PolymerBond } from 'ketcher-core';

export interface MonomerConnectionOnlyProperties {
  firstMonomer?: BaseMonomer;
  secondMonomer?: BaseMonomer;
  polymerBond?: PolymerBond;
  isReconnectionDialog?: boolean;
}

export interface ConfirmationDialogOnlyProperties {
  title?: string;
  confirmationText?: string;
  onConfirm?: () => void;
}

export interface RequiredModalProperties {
  onClose: () => void;
  isModalOpen: boolean;
}
export type MonomerConnectionProperties = MonomerConnectionOnlyProperties &
  RequiredModalProperties;

export type ConfirmationDialogProperties = ConfirmationDialogOnlyProperties &
  RequiredModalProperties;

export type AdditionalModalProperties = Partial<
  MonomerConnectionProperties & ConfirmationDialogProperties
>;
