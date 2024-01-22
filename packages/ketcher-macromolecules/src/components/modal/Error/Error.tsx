import { ActionButton } from 'components/shared/actionButton';
import { Modal } from 'components/shared/modal';
import { useAppDispatch, useAppSelector } from 'hooks';
import { closeErrorModal, selectErrorModalText } from 'state/modal';
import { ErrorTextWrapper } from './Error.styles';

export const ErrorModal = () => {
  const dispatch = useAppDispatch();
  const errorText = useAppSelector(selectErrorModalText);
  const isModalOpen = errorText !== '';
  const onClose = () => {
    dispatch(closeErrorModal());
  };
  return (
    <Modal isOpen={isModalOpen} title="Error message" onClose={onClose}>
      <Modal.Content>
        <ErrorTextWrapper>{errorText}</ErrorTextWrapper>
      </Modal.Content>
      <Modal.Footer>
        <ActionButton label="Close" clickHandler={onClose} />
      </Modal.Footer>
    </Modal>
  );
};
