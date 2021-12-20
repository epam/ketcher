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

import { createSlice } from '@reduxjs/toolkit'
import { RootState } from 'state'

interface EditorState {
  isReady: boolean | null
}

const initialState: EditorState = {
  isReady: null
}

export const editorSlice: any = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    init: (state) => {
      state.isReady = false
    },
    initSuccess: (state) => {
      state.isReady = true
    },
    initFailure: (state) => {
      state.isReady = false
    }
  }
})

export const { init, initSuccess, initFailure } = editorSlice.actions

export const selectEditorIsReady = (state: RootState) => state.editor.isReady

export const editorReducer = editorSlice.reducer
