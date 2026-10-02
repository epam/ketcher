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
  applyMiddleware,
  combineReducers,
  legacy_createStore as createStore,
  type Middleware,
  type Reducer,
  type Store,
  type UnknownAction,
} from 'redux';
import type { Editor } from 'ketcher-core';
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
import type { AppDispatch } from './hooks';
import type {
  InitAction,
  ServerState,
  SetEditor,
  SetServerAction,
  StoreOptions,
} from './store.types';

export { onAction, load };

export const SET_SERVER = 'SET_SERVER';

const shared = combineReducers({
  common: commonReducer,
  actionState: actionStateReducer,
  toolbar: toolbarReducer,
  modal: modalReducer,
  abbreviationLookup: abbreviationLookupReducer,
  server: (store: ServerState | null = null) => store,
  editor: (store: Editor | null = null) => store,
  options: optionsReducer,
  templates: templatesReducer,
  functionalGroups: functionalGroupsReducer,
  saltsAndSolvents: saltsAndSolventsReducer,
  requestsStatuses: requestReducer,
  floatingTools: floatingToolsReducer,
  notifications: notificationsReducer,
});

export type RootState = ReturnType<typeof shared>;

type PreloadedRootState = Pick<
  RootState,
  'actionState' | 'editor' | 'modal' | 'server' | 'templates' | 'notifications'
> & { options: RootState['options'] };

export type AppStore = Store<RootState, UnknownAction> & {
  dispatch: AppDispatch;
};

// INIT and UPDATE actions merge arbitrary payload keys into the state
type WorkingState = Partial<RootState> & Record<string, unknown>;

function getRootReducer(
  setEditor: SetEditor,
): Reducer<RootState, UnknownAction, PreloadedRootState> {
  return function root(state, action) {
    let updatedState: WorkingState = { ...state };

    switch (action.type) {
      case 'INIT': {
        const initAction = action as InitAction;
        setEditor(initAction.editor);
        // Extract action data (excluding type) and merge into state
        const { type: _type, ...data } = initAction;
        updatedState = { ...updatedState, ...data };
        // Set server
        updatedState = {
          ...updatedState,
          server: initAction.server || updatedState.server,
        };
        break;
      }

      case 'UPDATE': {
        const { type: _type, ...data } = action;
        updatedState = { ...updatedState, ...data };
        break;
      }

      case SET_SERVER: {
        const { server } = action as SetServerAction;
        updatedState = {
          ...updatedState,
          server: server || updatedState.server,
        };
        break;
      }
    }

    // Slices missing from the preloaded state are filled in by the shared reducers
    const sh = shared(updatedState as RootState, {
      ...action,
      ...pick(['editor', 'server', 'options'], updatedState),
    });

    const finalState = {
      ...updatedState,
      ...sh,
    };

    // TODO: temporary solution. Need to review work with redux store
    (globalThis as { currentState?: RootState }).currentState = finalState;
    return finalState;
  };
}

export default function (
  options: StoreOptions,
  server: ServerState | undefined,
  setEditor: SetEditor,
): AppStore {
  const { buttons = {}, customButtons, ...restOptions } = options;

  // TODO: redux localStorage here
  const initState: PreloadedRootState = {
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

  const middleware: Middleware[] = [thunk];
  if (
    process.env.NODE_ENV !== 'production' &&
    process.env.KETCHER_ENABLE_REDUX_LOGGER === 'true'
  ) {
    middleware.push(logger);
  }

  const rootReducer = getRootReducer(setEditor);
  return createStore(
    rootReducer,
    initState,
    applyMiddleware(...middleware),
  ) as AppStore;
}

export function setServer(server: ServerState): SetServerAction {
  return {
    type: SET_SERVER,
    server,
  };
}
