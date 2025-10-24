import { ConfirmationDialogProps } from 'components/modal/modalContainer';
import { Modal } from 'components/shared/modal';
import { ActionButton } from 'components/shared/actionButton';
import { ConfirmationText } from './ConfirmationDialog.styles';

export const ConfirmationDialog = ({
  title,
  confirmationText,
  onConfirm,
  isModalOpen,
  onClose,
}: ConfirmationDialogProps) => {
  const handleConfirm = () => {
    onConfirm!();
    onClose();
  };

  return (
    <Modal
      isOpen={isModalOpen}
      title={title ?? 'Confirm your action'}
      onClose={onClose}
    >
      <Modal.Content>
        <ConfirmationText data-testid="confirmation-text">
          {confirmationText}
        </ConfirmationText>
      </Modal.Content>
      <Modal.Footer>
        <ActionButton
          label="Cancel"
          clickHandler={onClose}
          data-testid="cancel-button"
        />
        <ActionButton
          label="Yes"
          clickHandler={handleConfirm}
          styleType="secondary"
          data-testid="yes-button"
        />
      </Modal.Footer>
    </Modal>
  );
};
