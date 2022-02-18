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

import { configureStore, Store } from '@reduxjs/toolkit'
import { editorReducer } from 'state/common'
import createSagaMiddleware from 'redux-saga'
import { rootSaga } from 'state/rootSaga'
import { modalReducer } from 'state/modal'

export function configureAppStore(preloadedState = {}) {
  const sagaMiddleware = createSagaMiddleware()

  const store: Store = configureStore({
    reducer: {
      editor: editorReducer,
      modal: modalReducer
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: false
      }).concat(sagaMiddleware),
    preloadedState
  })

  sagaMiddleware.run(rootSaga)

  return store
}

export const store = configureAppStore()

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
