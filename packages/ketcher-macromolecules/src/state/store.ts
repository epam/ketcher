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

import { configureStore, Store } from '@reduxjs/toolkit';
import { editorReducer } from 'state/common';
import { libraryReducer } from 'state/library';
import { modalReducer } from 'state/modal';
import { rnaBuilderReducer } from 'state/rna-builder';

export function configureAppStore(preloadedState = {}) {
  const store: Store = configureStore({
    reducer: {
      editor: editorReducer,
      modal: modalReducer,
      library: libraryReducer,
      rnaBuilder: rnaBuilderReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        // TODO: Currently storing the whole editor (with functions within) in the state violates this check. Ideally find a way to store serializable data only
        serializableCheck: false,
      }),
    preloadedState,
  });

  return store;
}

export const store = configureAppStore();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
