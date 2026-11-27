import {
  AttachmentPointName,
  BaseMonomer,
  PolymerBond,
  type CoreText,
  type Vec2,
} from 'ketcher-core';

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

export interface TextEditorOnlyProps {
  position: Vec2;
  text?: CoreText;
}

export type TextEditorProps = TextEditorOnlyProps & RequiredModalProps;

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

export type InsertionConnectionProps = InsertionConnectionOnlyProps &
  RequiredModalProps;

export type ConfirmationDialogProps = ConfirmationDialogOnlyProps &
  RequiredModalProps;

export type AdditionalModalProps = Partial<
  MonomerConnectionProps &
    ConfirmationDialogProps &
    InsertionConnectionOnlyProps &
    TextEditorOnlyProps
>;
