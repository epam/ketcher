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
import { StructService } from 'ketcher-core'
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'

import { SettingsContext } from './../../../contexts'
import createStore, { load } from '../state'
import { initKeydownListener } from '../state/hotkeys'
import { initResize } from '../state/toolbar'
import { loadStruct } from '../state/shared'

import App from './App.container'

function initApp(
  element: HTMLDivElement | null,
  staticResourcesUrl: string,
  options: any,
  server: StructService,
  setEditor: (editor: any) => void
) {
  const store = createStore(options, server, setEditor)
  store.dispatch(initKeydownListener(element))
  store.dispatch(initResize())

  ReactDOM.render(
    <Provider store={store}>
      <SettingsContext.Provider value={{ staticResourcesUrl }}>
        <App />
      </SettingsContext.Provider>
    </Provider>,
    element
  )

  return {
    load: (structStr, opts) => store.dispatch(load(structStr, opts)),
    loadStruct
  }
}

export { initApp }
