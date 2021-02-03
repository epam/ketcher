/****************************************************************************
 * Copyright 2020 EPAM Systems
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

import React, { useEffect, useRef } from 'react'
import { connect } from 'react-redux'
import { onAction } from '../state'
import { checkServer } from '../state/server'
import Editor from '../views/Editor'
import AppModal from '../views/modal'
import Toolbar from '../views/toolbar'
import AppClipArea from '../views/AppClipArea'
import { initTmplLib } from '../state/templates'
import { useSettingsContext } from '../../../hooks'

function AppHiddenView({ onInitTmpls }) {
  const rootRef = useRef(null)
  const { staticResourcesUrl } = useSettingsContext()

  useEffect(() => {
    onInitTmpls(rootRef.current, staticResourcesUrl)
  }, [])

  return <div className="cellar" ref={rootRef} />
}

const AppHidden = connect(null, dispatch => ({
  onInitTmpls: (cacheEl, url) => initTmplLib(dispatch, url, cacheEl)
}))(AppHiddenView)

function AppView(props) {
  useEffect(() => {
    props.checkServer()
  }, [])

  return (
    <React.Fragment>
      <AppHidden />
      <Editor id="canvas" />
      <Toolbar {...props} />
      <AppClipArea />
      <AppModal />
    </React.Fragment>
  )
}

const App = connect(null, { onAction, checkServer })(AppView)

export default App
