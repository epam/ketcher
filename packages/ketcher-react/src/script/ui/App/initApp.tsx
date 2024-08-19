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
  AppContext,
  ErrorsContext,
  SettingsContext,
} from './../../../contexts';
import { Ketcher, StructService } from 'ketcher-core';

import App from './App.container';
import { Provider } from 'react-redux';
import { uniqueId } from 'lodash';
import { Root } from 'react-dom/client';
import createStore, { setServer } from '../state';
import { initKeydownListener, removeKeydownListener } from '../state/hotkeys';
import { initResize } from '../state/toolbar';
import { initMouseListener, removeMouseListeners } from '../state/mouse';

function initApp(
  element: HTMLDivElement | null,
  appRoot: Root,
  staticResourcesUrl: string,
  options: any,
  server: StructService,
  resolve: (args: {
    editor: any;
    setKetcher: (ketcher: Ketcher) => void;
    ketcherId: string;
    setServer: (server: StructService) => void;
  }) => void,
  togglerComponent?: JSX.Element,
) {
  let ketcherRef: Ketcher | null = null;
  const setKetcher = (ketcher: Ketcher) => {
    ketcherRef = ketcher;
  };
  const ketcherId = uniqueId();
  // hack to return server setter to Editor.tsx
  // because it does not have access to store
  // eslint-disable-next-line prefer-const
  let getServerSetter: () => (structService: StructService) => void;

  const setEditor = (editor) => {
    const setServer = getServerSetter();
    resolve({ editor, setKetcher, ketcherId, setServer });
  };
  const store = createStore(options, server, setEditor);

  getServerSetter = () => {
    return (structService: StructService) => {
      store.dispatch(setServer(structService));
    };
  };

  store.dispatch(initKeydownListener(element));
  store.dispatch(initMouseListener(element));
  store.dispatch(initResize());

  appRoot.render(
    <Provider store={store}>
      <SettingsContext.Provider value={{ staticResourcesUrl }}>
        <ErrorsContext.Provider value={{ errorHandler: options.errorHandler }}>
          <AppContext.Provider
            value={{
              // Expected this is set before load
              getKetcherInstance: () => ketcherRef as unknown as Ketcher,
              ketcherId,
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
  };
}

export { initApp };
