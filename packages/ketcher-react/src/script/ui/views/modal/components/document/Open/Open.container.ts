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
import { ComponentType } from 'react'
import { connect } from 'react-redux'

import { exec } from '../../../../../component/cliparea/cliparea'
import { load } from '../../../../../state'
import Open, { OpenProps } from './Open'
import { BaseCallProps } from '../../../modal.types'

type StateProps = OpenProps
type DispatchProps = Pick<BaseCallProps, 'onOk'>

const mapStateToProps = (state): StateProps => ({ server: state.server })

const mapDispatchToProps = (dispatch): DispatchProps => ({
  onOk: result => {
    if (result.fragment) exec('copy')
    dispatch(
      load(result.structStr, {
        badHeaderRecover: true,
        fragment: result.fragment
      })
      // TODO: Removed ownProps.onOk call. consider refactoring of load function in release 2.4
      // See PR #731 (https://github.com/epam/ketcher/pull/731)
    )
  }
})

const OpenContainer: ComponentType = connect(
  mapStateToProps,
  mapDispatchToProps
)(Open)
export default OpenContainer
