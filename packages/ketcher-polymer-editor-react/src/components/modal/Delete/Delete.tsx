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
import { ActionButton } from 'components/shared/actionButton';
import { useAppDispatch, useAppSelector } from 'hooks';
import {
  deletePreset,
  selectActivePreset,
  selectPresets,
  setActivePreset,
  setIsEditMode,
} from 'state/rna-builder';

export interface Props {
  onClose: () => void;
  isModalOpen: boolean;
}

const Delete = ({ isModalOpen, onClose }: Props) => {
  const dispatch = useAppDispatch();
  const presets = useAppSelector(selectPresets);
  const activePreset = useAppSelector(selectActivePreset);
  const onCloseCallback = useCallback(() => {
    onClose();
  }, [onClose]);

  const cancelHandler = () => {
    onCloseCallback();
  };

  const deleteHandler = () => {
    onCloseCallback();
    dispatch(deletePreset(activePreset));
    dispatch(setIsEditMode(false));
    if (presets.length !== 0) {
      dispatch(setActivePreset(presets[0]));
    }
  };

  return (
    <Modal
      isOpen={isModalOpen}
      title="Delete RNA Preset"
      onClose={onCloseCallback}
    >
      <Modal.Content>
        <div>
          <div>You are about to delete</div>
          <div>"{activePreset.name}" RNA preset.</div>
          <div>This operation cannot be undone.</div>
        </div>
      </Modal.Content>
      <Modal.Footer>
        <ActionButton
          key="cancel"
          clickHandler={cancelHandler}
          label="Cancel"
          styleType="secondary"
        />
        <ActionButton
          key="delete"
          clickHandler={deleteHandler}
          label="Delete"
        />
      </Modal.Footer>
    </Modal>
  );
};
export { Delete };
