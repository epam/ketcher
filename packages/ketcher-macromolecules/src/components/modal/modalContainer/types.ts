import { AttachmentPointName, BaseMonomer, PolymerBond } from 'ketcher-core';

export interface MonomerConnectionOnlyProps {
  firstMonomer?: BaseMonomer;
  secondMonomer?: BaseMonomer;
  polymerBond?: PolymerBond;
  isReconnectionDialog?: boolean;
}

export interface InsertionConnectionOnlyProps {
  leftMonomer?: BaseMonomer;
  newMonomer?: BaseMonomer;
  rightMonomer?: BaseMonomer;
  leftAp?: AttachmentPointName;
  rightAp?: AttachmentPointName;
}

export interface ConfirmationDialogOnlyProps {
  title?: string;
  confirmationText?: string;
  onConfirm?: () => void;
}

export interface TextEditorModalOnlyProps {
  initialContent?: string;
  onApply?: (content: string) => void;
}

export interface RequiredModalProps {
  onClose: () => void;
  isModalOpen: boolean;
}
export type MonomerConnectionProps = MonomerConnectionOnlyProps &
  RequiredModalProps;

export type InsertionConnectionProps = InsertionConnectionOnlyProps &
  RequiredModalProps;

export type ConfirmationDialogProps = ConfirmationDialogOnlyProps &
  RequiredModalProps;

export type TextEditorModalProps = TextEditorModalOnlyProps &
  RequiredModalProps;

export type AdditionalModalProps = Partial<
  MonomerConnectionProps &
    ConfirmationDialogProps &
    InsertionConnectionOnlyProps &
    TextEditorModalOnlyProps
>;
