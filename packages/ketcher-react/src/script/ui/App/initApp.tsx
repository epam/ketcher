/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import {
  AppContext,
  ErrorsContext,
  SettingsContext,
} from './../../../contexts';
import type { Api } from 'src/script/api';

import App from './App.container';
import { Provider } from 'react-redux';
import type { Root } from 'react-dom/client';
import createStore, { setServer } from '../state';
import { initKeydownListener, removeKeydownListener } from '../state/hotkeys';
import { initResize, removeResizeListener } from '../state/toolbar';
import { initMouseListener, removeMouseListeners } from '../state/mouse';
import type Editor from 'src/script/editor';
import type { ButtonsConfig } from '../../builders/ketcher/ButtonsConfig';
import type { CustomButton } from '../../builders/ketcher/CustomButtons';
import type { StoreOptions } from '../state/store.types';

export interface InitAppOptions extends StoreOptions {
  buttons: ButtonsConfig;
  errorHandler: ((message: string) => void) | null;
  version: string;
  buildDate: string;
  buildNumber: string;
  customButtons: Array<CustomButton>;
}

function initApp(
  prevKetcherId: string,
  ketcherId: string,
  element: HTMLDivElement | null,
  appRoot: Root,
  staticResourcesUrl: string,
  options: InitAppOptions,
  server: Api,
  resolve: (args: { editor: Editor; setServer: (server: Api) => void }) => void,
  togglerComponent?: JSX.Element,
) {
  // hack to return server setter to Editor.tsx
  // because it does not have access to store

  let getServerSetter: () => (structService: Api) => void;

  const setEditor = (editor) => {
    const setServer = getServerSetter();
    resolve({ editor, setServer });
  };
  const store = createStore(options, server, setEditor);

  getServerSetter = () => {
    return (structService: Api) => {
      store.dispatch(setServer(structService));
    };
  };

  store.dispatch(initKeydownListener(element));
  store.dispatch(initMouseListener(element));
  store.dispatch(initResize());

  appRoot.render(
    <Provider store={store}>
      <SettingsContext.Provider value={{ staticResourcesUrl }}>
        <ErrorsContext.Provider
          value={{ errorHandler: options.errorHandler ?? (() => {}) }}
        >
          <AppContext.Provider
            value={{
              ketcherId,
              prevKetcherId,
            }}
          >
            <App togglerComponent={togglerComponent} />
          </AppContext.Provider>
        </ErrorsContext.Provider>
      </SettingsContext.Provider>
    </Provider>,
  );

  return () => {
    store.dispatch(removeKeydownListener(element));
    store.dispatch(removeMouseListeners(element));
    removeResizeListener();
  };
}

export { initApp };
