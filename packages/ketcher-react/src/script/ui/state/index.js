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

import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import { load, onAction } from './shared';
import optionsReducer, { initOptionsState } from './options';
import templatesReducer, { initTmplsState } from './templates';
import abbreviationLookupReducer from './abbreviationLookup';
import commonReducer from './common';

import actionStateReducer from './action';
import functionalGroupsReducer from './functionalGroups';
import saltsAndSolventsReducer from './saltsAndSolvents';
import { logger } from 'redux-logger';
import modalReducer from './modal';
import { pick } from 'lodash/fp';
import requestReducer from './request';
import { thunk } from 'redux-thunk';
import toolbarReducer from './toolbar';
import floatingToolsReducer from './floatingTools';
import notificationsReducer, { initNotificationsState } from './notifications';

export { onAction, load };

export const SET_SERVER = 'SET_SERVER';

const shared = combineReducers({
  common: commonReducer,
  actionState: actionStateReducer,
  toolbar: toolbarReducer,
  modal: modalReducer,
  abbreviationLookup: abbreviationLookupReducer,
  server: (store = null) => store,
  editor: (store = null) => store,
  options: optionsReducer,
  templates: templatesReducer,
  functionalGroups: functionalGroupsReducer,
  saltsAndSolvents: saltsAndSolventsReducer,
  requestsStatuses: requestReducer,
  floatingTools: floatingToolsReducer,
  notifications: notificationsReducer,
});

function getRootReducer(setEditor) {
  return function root(state, action) {
    let updatedState = state;

    switch (action.type) {
      case 'INIT': {
        setEditor(action.editor);
        // Extract action data (excluding type) and merge into state
        const data = { ...action };
        delete data.type;
        if (data) {
          updatedState = { ...updatedState, ...data };
        }
        // Set server
        updatedState = {
          ...updatedState,
          server: action.server || updatedState.server,
        };
        break;
      }

      case 'UPDATE': {
        const data = { ...action };
        delete data.type;
        if (data) {
          updatedState = { ...updatedState, ...data };
        }
        break;
      }

      case SET_SERVER: {
        updatedState = {
          ...updatedState,
          server: action.server || updatedState.server,
        };
        break;
      }
    }

    const sh = shared(updatedState, {
      ...action,
      ...pick(['editor', 'server', 'options'], updatedState),
    });

    const finalState =
      sh === updatedState.shared
        ? updatedState
        : {
            ...updatedState,
            ...sh,
          };

    // TODO: temporary solution. Need to review work with redux store
    global.currentState = finalState;
    return finalState;
  };
}

// The store keeps live objects that are circular and very large: the editor
// (its renderer holds DOM nodes), the struct service, and the parsed template
// libraries. DevTools serialises the whole state after every action and keeps
// a copy per action for time travel, which hangs the tab on a graph that size,
// so these are replaced on the way out. Everything else stays inspectable, and
// `templates` keeps its small fields - only the struct library is dropped.
const NOT_SERIALIZED = '<not serialized>';

function sanitizeForDevTools(value) {
  if (value === null || typeof value !== 'object') {
    return value;
  }

  const sanitized = { ...value };

  ['editor', 'server', 'functionalGroups', 'saltsAndSolvents'].forEach(
    (key) => {
      if (key in sanitized) {
        sanitized[key] = NOT_SERIALIZED;
      }
    },
  );

  if (sanitized.templates?.lib) {
    sanitized.templates = { ...sanitized.templates, lib: NOT_SERIALIZED };
  }

  if (sanitized.lib) {
    sanitized.lib = NOT_SERIALIZED;
  }

  return sanitized;
}

export default function (options, server, setEditor) {
  const { buttons = {}, customButtons, ...restOptions } = options;

  // TODO: redux localStorage here
  const initState = {
    actionState: null,
    editor: null,
    modal: null,
    options: Object.assign(initOptionsState, {
      app: restOptions,
      buttons,
      customButtons,
    }),
    server: server || Promise.reject(new Error('Standalone mode!')),
    templates: initTmplsState,
    notifications: initNotificationsState,
  };

  const middleware = [thunk];
  if (
    process.env.NODE_ENV !== 'production' &&
    process.env.KETCHER_ENABLE_REDUX_LOGGER === 'true'
  ) {
    middleware.push(logger);
  }

  const rootReducer = getRootReducer(setEditor);
  // The Redux DevTools extension only sees stores created with its enhancer,
  // which this store never used. Reading the global instead of depending on
  // `@redux-devtools/extension` keeps it a development-only concern: rollup
  // externalises every entry of `dependencies`, so a package added here would
  // become a runtime dependency of every ketcher-react consumer. The
  // `process.env.NODE_ENV` value is inlined at build time, so production
  // builds collapse this to plain `compose`.
  const composeEnhancers =
    (process.env.NODE_ENV !== 'production' &&
      globalThis.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__?.({
        stateSanitizer: sanitizeForDevTools,
        actionSanitizer: sanitizeForDevTools,
      })) ||
    compose;

  return createStore(
    rootReducer,
    initState,
    composeEnhancers(applyMiddleware(...middleware)),
  );
}

export function setServer(server) {
  return {
    type: SET_SERVER,
    server,
  };
}
