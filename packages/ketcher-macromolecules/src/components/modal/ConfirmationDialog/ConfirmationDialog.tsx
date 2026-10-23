import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('macromoleculesDialogs');
  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  return (
    <Modal
      isOpen={isModalOpen}
      title={title ?? t('confirmationDialog.defaultTitle')}
      onClose={onClose}
      testId="confirmation-dialog"
    >
      <Modal.Content>
        <ConfirmationText data-testid="confirmation-text">
          {confirmationText}
        </ConfirmationText>
      </Modal.Content>
      <Modal.Footer>
        <ActionButton
          label={t('common:button.cancel')}
          clickHandler={onClose}
          data-testid="cancel-button"
        />
        <ActionButton
          label={t('common:button.yes')}
          clickHandler={handleConfirm}
          styleType="secondary"
          data-testid="yes-button"
        />
      </Modal.Footer>
    </Modal>
  );
};
