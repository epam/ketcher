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

import { applyMiddleware, combineReducers, createStore } from 'redux'
import { load, onAction } from './shared'
import optionsReducer, { initOptionsState } from './options'
import templatesReducer, { initTmplsState } from './templates'

import actionStateReducer from './action'
import functionalGroupsReducer from './functionalGroups'
import saltsAndSolventsReducer from './saltsAndSolvents'
import { logger } from 'redux-logger'
import modalReducer from './modal'
import { pick } from 'lodash/fp'
import requestReducer from './request'
import thunk from 'redux-thunk'
import toolbarReducer from './toolbar'
import floatingToolsReducer from './floatingTools'

export { onAction, load }

const shared = combineReducers({
  actionState: actionStateReducer,
  toolbar: toolbarReducer,
  modal: modalReducer,
  server: (store = null) => store,
  editor: (store = null) => store,
  options: optionsReducer,
  templates: templatesReducer,
  functionalGroups: functionalGroupsReducer,
  saltsAndSolvents: saltsAndSolventsReducer,
  requestsStatuses: requestReducer,
  floatingTools: floatingToolsReducer
})

function getRootReducer(setEditor) {
  return function root(state, action) {
    // TODO need a refactoring for this reducer since it uses (probably unintentionally falling through switch-case)
    // F.e. when it gets action: INIT it will call all cases below - INIT+UPDATE
    /* eslint-disable no-fallthrough */
    switch (action.type) {
      case 'INIT': {
        setEditor(action.editor)
      }

      case 'UPDATE': {
        const {
          /* eslint-disable @typescript-eslint/no-unused-vars */
          type,
          /* eslint-enable @typescript-eslint/no-unused-vars */
          ...data
        } = action
        if (data) state = { ...state, ...data }
      }
    }
    /* eslint-enable no-fallthrough */

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

    // TODO: temporary solution. Need to review work with redux store
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
  if (
    process.env.NODE_ENV !== 'production' &&
    process.env.KETCHER_ENABLE_REDUX_LOGGER === 'true'
  ) {
    middleware.push(logger)
  }

  const rootReducer = getRootReducer(setEditor)
  return createStore(rootReducer, initState, applyMiddleware(...middleware))
}
