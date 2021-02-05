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

import { pick } from 'lodash/fp'

import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { logger } from 'redux-logger'

import actionStateReducer from './action'
import modalReducer from './modal'
import optionsReducer, { initOptionsState } from './options'
import templatesReducer, { initTmplsState } from './templates'
import toolbarReducer from './toolbar'
import requestReducer from './request'

import { onAction, load } from './shared'

export { onAction, load }

const shared = combineReducers({
  actionState: actionStateReducer,
  toolbar: toolbarReducer,
  modal: modalReducer,
  server: (store = null) => store,
  editor: (store = null) => store,
  options: optionsReducer,
  templates: templatesReducer,
  requestsStatuses: requestReducer
})

function getRootReducer(setEditor) {
  return function root(state, action) {
    switch (
      action.type // eslint-disable-line default-case
    ) {
      case 'INIT':
        setEditor(action.editor)

      case 'UPDATE': // eslint-disable-line no-case-declarations
        const { type, ...data } = action
        if (data) state = { ...state, ...data }
    }

    const sh = shared(state, {
      ...action,
      ...pick(['editor', 'server', 'options'], state)
    })

    const finalState =
      sh === state.shared
        ? state
        : {
            ...state,
            ...sh
          }

    //TODO: temporary solution. Need to review work with redux store
    global.currentState = finalState
    return finalState
  }
}

export default function (options, server, setEditor) {
  const { buttons = {}, ...restOptions } = options

  // TODO: redux localStorage here
  const initState = {
    actionState: null,
    editor: null,
    modal: null,
    options: Object.assign(initOptionsState, { app: restOptions, buttons }),
    server: server || Promise.reject(new Error('Standalone mode!')),
    templates: initTmplsState
  }

  const middleware = [thunk]

  if (process.env.NODE_ENV !== 'production') middleware.push(logger)

  const rootReducer = getRootReducer(setEditor)
  return createStore(rootReducer, initState, applyMiddleware(...middleware))
}
