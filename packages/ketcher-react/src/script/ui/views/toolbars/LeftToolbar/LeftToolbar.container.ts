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

import {
  LeftToolbar,
  LeftToolbarCallProps,
  LeftToolbarProps,
} from './LeftToolbar';

import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { onAction } from '../../../state';

type StateProps = Omit<LeftToolbarProps, 'className'>;
const disableableButtons = [];
const mapStateToProps = (state: any): StateProps => ({
  status: state.actionState || {},
  opened: state.toolbar.opened,
  indigoVerification: state.requestsStatuses.indigoVerification,
  disableableButtons,
});

const mapDispatchToProps = (dispatch: Dispatch): LeftToolbarCallProps => ({
  onAction: (action) => dispatch(onAction(action)),
  onOpen: (menuName, isSelected) =>
    dispatch({
      type: 'OPENED',
      data: { menuName, isSelected },
    }),
});

const LeftToolbarContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(LeftToolbar);

export { LeftToolbarContainer };
