import { ConfirmationDialogProps } from 'components/modal/modalContainer';
import { Modal } from 'components/shared/modal';
import { ActionButton } from 'components/shared/actionButton';
import { ConfirmationText } from './ConfirmationDialog.styles';

export const ConfirmationDialog = ({
  confirmationText,
  onConfirm,
  isModalOpen,
  onClose,
}: ConfirmationDialogProps) => {
  return (
    <Modal isOpen={isModalOpen} title="Confirm your action" onClose={onClose}>
      <Modal.Content>
        <ConfirmationText>{confirmationText}</ConfirmationText>
      </Modal.Content>
      <Modal.Footer>
        <ActionButton label="Cancel" clickHandler={onClose} />
        <ActionButton label="Yes" clickHandler={onConfirm!} />
      </Modal.Footer>
    </Modal>
  );
};
