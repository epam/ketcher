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

import { Modal, ModalProps } from './Modal';

import { BaseCallProps } from './modal.types';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { omit } from 'lodash/fp';

type StateProps = Pick<ModalProps, 'modal'>;

const mapStateToProps = (state): StateProps => ({
  modal: state.modal,
});

const mapDispatchToProps = (dispatch: Dispatch): BaseCallProps => ({
  onOk: (_result) => {
    dispatch({ type: 'MODAL_CLOSE' });
  },
  onCancel: () => {
    dispatch({ type: 'MODAL_CLOSE' });
  },
});

const mergeProps = (
  stateProps: StateProps,
  dispatchProps: BaseCallProps
): ModalProps => {
  const prop = stateProps.modal && stateProps.modal.prop;
  const initProps = prop ? omit(['onResult', 'onCancel'], prop) : {};
  return {
    modal: stateProps.modal,
    ...initProps,
    onOk: (result) => {
      if (prop && prop.onResult) prop.onResult(result);
      dispatchProps.onOk(result);
    },
    onCancel: () => {
      if (prop && prop.onCancel) prop.onCancel();
      dispatchProps.onCancel();
    },
  };
};

const ModalContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(Modal);

export default ModalContainer;
