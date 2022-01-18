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
  RightToolbar,
  RightToolbarCallProps,
  RightToolbarProps
} from './RightToolbar'

import { ComponentType } from 'react'
import { Dispatch } from 'redux'
import { connect } from 'react-redux'
import { onAction } from '../../../state'

type StateProps = Omit<RightToolbarProps, 'className'>
type OwnProps = Pick<RightToolbarProps, 'className'>

const mapStateToProps = (state): StateProps => ({
  active: state.actionState && state.actionState.activeTool,
  status: state.actionState || {},
  freqAtoms: state.toolbar.freqAtoms,
  opened: state.toolbar.opened,
  indigoVerification: state.requestsStatuses.indigoVerification,
  disableableButtons: []
})

const mapDispatchToProps = (dispatch: Dispatch): RightToolbarCallProps => ({
  onAction: (action) => dispatch(onAction(action)),
  onOpen: (menuName, isSelected) =>
    dispatch({
      type: 'OPENED',
      data: { menuName, isSelected }
    })
})

const RightToolbarContainer: ComponentType<OwnProps> = connect(
  mapStateToProps,
  mapDispatchToProps
)(RightToolbar)

export { RightToolbarContainer }
export default RightToolbarContainer
