/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/
import { Modal } from 'components/shared/modal';
import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from 'hooks';
import {
  selectSequenceSelection,
  setSequenceSelection,
  setIsEditMode,
  setActivePresetMonomerGroup,
} from 'state/rna-builder';
import { ActionButton } from 'components/shared/actionButton';
import styled from '@emotion/styled';
import { selectEditor } from 'state/common';

export interface Props {
  onClose: () => void;
  isModalOpen: boolean;
}

const TextWrapper = styled.div`
  padding: 12px;
`;

const UpdateSequenceInRNABuilder = ({ isModalOpen, onClose }: Props) => {
  const dispatch = useAppDispatch();
  const sequenceSelection = useAppSelector(selectSequenceSelection);
  const editor = useAppSelector(selectEditor);
  const onCloseCallback = useCallback(() => {
    onClose();
  }, [onClose]);

  const reset = () => {
    dispatch(setSequenceSelection([]));
    dispatch(setActivePresetMonomerGroup(null));
    dispatch(setIsEditMode(false));
    editor.events.turnOffSequenceEditInRNABuilderMode.dispatch();
  };

  const cancelHandler = () => {
    onCloseCallback();
    reset();
  };

  const updateHandler = () => {
    onCloseCallback();
    editor.events.modifySequenceInRnaBuilder.dispatch(sequenceSelection);
    reset();
  };

  return (
    <Modal
      isOpen={isModalOpen}
      title="Update sequence"
      onClose={onCloseCallback}
    >
      <Modal.Content>
        <TextWrapper>
          You are going to make multiple changes in your sequence. Are you sure?
        </TextWrapper>
      </Modal.Content>
      <Modal.Footer>
        <ActionButton
          key="cancel"
          clickHandler={cancelHandler}
          label="Cancel"
          styleType="secondary"
        />
        <ActionButton key="update" clickHandler={updateHandler} label="Yes" />
      </Modal.Footer>
    </Modal>
  );
};
export { UpdateSequenceInRNABuilder };
