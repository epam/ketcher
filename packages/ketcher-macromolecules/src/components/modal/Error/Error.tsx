import { useTranslation } from 'react-i18next';
import { ActionButton } from 'components/shared/actionButton';
import { Modal } from 'components/shared/modal';
import { useAppDispatch, useAppSelector } from 'hooks';
import {
  closeErrorModal,
  selectErrorModalText,
  selectErrorModalTitle,
} from 'state/modal';
import { ErrorTextWrapper } from './Error.styles';

export const ErrorModal = () => {
  const { t } = useTranslation('macromoleculesDialogs');
  const dispatch = useAppDispatch();
  const errorMessage = useAppSelector(selectErrorModalText);
  const errorTitle =
    useAppSelector(selectErrorModalTitle) || t('error.defaultTitle');
  const isModalOpen = errorMessage !== '';
  const onClose = () => {
    dispatch(closeErrorModal());
  };
  return (
    <Modal
      isOpen={isModalOpen}
      title={errorTitle}
      onClose={onClose}
      testId="info-modal-window"
    >
      <Modal.Content>
        <ErrorTextWrapper data-testid="error-message-body">
          {errorMessage}
        </ErrorTextWrapper>
      </Modal.Content>
      <Modal.Footer>
        <ActionButton
          label={t('common:button.close')}
          clickHandler={onClose}
          data-testid="info-modal-close"
        />
      </Modal.Footer>
    </Modal>
  );
};
