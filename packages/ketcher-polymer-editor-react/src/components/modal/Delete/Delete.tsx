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
  createNewPreset,
  deletePreset,
  selectActivePresetForContextMenu,
  setIsEditMode,
} from 'state/rna-builder';
import { StyledActionButton } from 'components/modal/Delete/styledComponents';
import styled from '@emotion/styled';
import { selectEditor } from 'state/common';

export interface Props {
  onClose: () => void;
  isModalOpen: boolean;
}

const DeleteTextWrapper = styled.div`
  padding: 12px;
`;

const Delete = ({ isModalOpen, onClose }: Props) => {
  const dispatch = useAppDispatch();
  const activePresetForContextMenu = useAppSelector(
    selectActivePresetForContextMenu,
  );
  const editor = useAppSelector(selectEditor);
  const onCloseCallback = useCallback(() => {
    onClose();
  }, [onClose]);

  const cancelHandler = () => {
    onCloseCallback();
  };

  const deleteHandler = () => {
    onCloseCallback();
    dispatch(deletePreset(activePresetForContextMenu));
    dispatch(setIsEditMode(false));
    dispatch(createNewPreset());
    editor.events.selectPreset.dispatch(null);
  };

  return (
    <Modal
      isOpen={isModalOpen}
      title="Delete RNA Preset"
      onClose={onCloseCallback}
    >
      <Modal.Content>
        <DeleteTextWrapper data-testid="delete-preset-popup-content">
          <div>You are about to delete</div>
          <div>"{activePresetForContextMenu.name}" RNA preset.</div>
          <div>This operation cannot be undone.</div>
        </DeleteTextWrapper>
      </Modal.Content>
      <Modal.Footer>
        <StyledActionButton
          key="cancel"
          clickHandler={cancelHandler}
          label="Cancel"
          styleType="secondary"
        />
        <StyledActionButton
          key="delete"
          clickHandler={deleteHandler}
          label="Delete"
        />
      </Modal.Footer>
    </Modal>
  );
};
export { Delete };
