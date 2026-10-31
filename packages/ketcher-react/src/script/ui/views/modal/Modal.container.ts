/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import { type ModalProperties, Modal } from './Modal';

import type {
  BaseCallProperties,
  ModalContainerProperties,
} from './modal.types';
import type { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { omit } from 'lodash/fp';

type StateProperties = Pick<ModalProperties, 'modal'>;

const mapStateToProperties = (state): StateProperties => ({
  modal: state.modal,
});

const mapDispatchToProperties = (dispatch: Dispatch): BaseCallProperties => ({
  onOk: (_result) => {
    dispatch({ type: 'MODAL_CLOSE' });
  },
  onCancel: () => {
    dispatch({ type: 'MODAL_CLOSE' });
  },
});

const mergeProperties = (
  stateProperties: StateProperties,
  dispatchProperties: BaseCallProperties,
  ownProperties: ModalContainerProperties,
): ModalProperties => {
  const property = stateProperties.modal?.prop;
  const initProperties = property
    ? omit(['onResult', 'onCancel'], property)
    : {};
  return {
    modal: stateProperties.modal,
    ...initProperties,
    onOk: (result) => {
      property?.onResult?.(result);
      dispatchProperties.onOk(result);
    },
    onCancel: () => {
      property?.onCancel?.();
      dispatchProperties.onCancel();
    },
    ...ownProperties,
  };
};

const ModalContainer = connect(
  mapStateToProperties,
  mapDispatchToProperties,
  mergeProperties,
)(Modal);

export default ModalContainer;
