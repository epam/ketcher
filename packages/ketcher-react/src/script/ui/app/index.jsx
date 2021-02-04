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

import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { SettingsContext } from './../../../contexts'

import App from './app'

import createStore, { load } from '../state'
import { initKeydownListener } from '../state/hotkeys'
import { initResize } from '../state/toolbar'
import { loadStruct } from '../state/shared'

/**
 * @param {HTMLInputElement | null} element
 * @param {string} staticResourcesUrl
 * @param {any} options
 * @param {import('../../api').Api} server
 * @param {function} setEditor
 * */
function initApp(element, staticResourcesUrl, options, server, setEditor) {
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

export default initApp
