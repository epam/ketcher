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

import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from 'state'

interface EditorState {
  isReady: boolean | null
  activeTool: string
  peptides: any[]
  favorites: any[]
  searchFilter: string
}

const initialState: EditorState = {
  isReady: null,
  activeTool: 'select',
  peptides: [],
  favorites: [],
  searchFilter: ''
}

const addMonomerToFavorites = (state: EditorState, monomer: any) => {
  let existingGroup = state.favorites.find(
    (group: any) => group.groupTitle === monomer.props.MonomerNaturalAnalogCode
  )
  const newMonomer = { ...monomer, favorite: true }
  if (!existingGroup) {
    existingGroup = {
      groupTitle: monomer.props.MonomerNaturalAnalogCode,
      groupItems: [newMonomer]
    }
    state.favorites.push(existingGroup)
  }
  const existingItem = existingGroup.groupItems.find(
    (item: any) => item.props.Name === monomer.props.Name
  )
  if (!existingItem) {
    existingGroup.groupItems.push(newMonomer)
  }
}

const removeMonomerFromFavorites = (state: EditorState, monomer: any) => {
  const existingGroup = state.favorites.find(
    (group: any) => group.groupTitle === monomer.props.MonomerNaturalAnalogCode
  )
  if (existingGroup) {
    const existingFavoriteIndex = existingGroup.groupItems.findIndex(
      (item: any) => item.props.Name === monomer.props.Name
    )
    if (existingFavoriteIndex !== -1) {
      existingGroup.groupItems.splice(existingFavoriteIndex, 1)
    }
  }
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
    },
    selectTool: (state, action: PayloadAction<string>) => {
      state.activeTool = action.payload
    },
    loadMonomerLibrary: (state, action: PayloadAction<any>) => {
      state.peptides = action.payload
    },
    addMonomerFavorites: (state, action: PayloadAction<any>) => {
      addMonomerToFavorites(state, action.payload)
    },
    removeMonomerFavorites: (state, action: PayloadAction<any>) => {
      removeMonomerFromFavorites(state, action.payload)
    },
    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.searchFilter = action.payload
    }
  }
})

export const {
  init,
  initSuccess,
  initFailure,
  selectTool,
  loadMonomerLibrary,
  addMonomerFavorites,
  removeMonomerFavorites,
  setSearchFilter
} = editorSlice.actions

export const selectEditorIsReady = (state: RootState) => state.editor.isReady
export const selectEditorActiveTool = (state: RootState) =>
  state.editor.activeTool

export const editorReducer = editorSlice.reducer
