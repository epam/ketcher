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
  const dispatch = useAppDispatch();
  const errorMessage = useAppSelector(selectErrorModalText);
  const errorTitle = useAppSelector(selectErrorModalTitle) || 'Error message';
  const isModalOpen = errorMessage !== '';
  const onClose = () => {
    dispatch(closeErrorModal());
  };
  return (
    <Modal isOpen={isModalOpen} title={errorTitle} onClose={onClose}>
      <Modal.Content>
        <ErrorTextWrapper>{errorMessage}</ErrorTextWrapper>
      </Modal.Content>
      <Modal.Footer>
        <ActionButton label="Close" clickHandler={onClose} />
      </Modal.Footer>
    </Modal>
  );
};
