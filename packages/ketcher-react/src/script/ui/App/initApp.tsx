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

import { AppContext, ErrorsContext, SettingsContext } from './../../../contexts'
import { Ketcher, StructService } from 'ketcher-core'

import App from './App.container'
import { Provider } from 'react-redux'
import ReactDOM from 'react-dom'
import createStore from '../state'
import { initKeydownListener } from '../state/hotkeys'
import { initResize } from '../state/toolbar'

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
        <ErrorsContext.Provider value={{ errorHandler: options.errorHandler }}>
          <AppContext.Provider
            value={{
              getKetcherInstance: () => (window as any).ketcher as Ketcher
            }}
          >
            <App ketcher={(window as any).ketcher} />
          </AppContext.Provider>
        </ErrorsContext.Provider>
      </SettingsContext.Provider>
    </Provider>,
    element
  )
}

export { initApp }
