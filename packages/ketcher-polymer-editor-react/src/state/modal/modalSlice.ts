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

interface ModalState {
  name: string | null
  isOpen: boolean
}

const initialState: ModalState = {
  name: null,
  isOpen: false
}

export const modalSlice: any = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    openModal: (state, action: PayloadAction<string>) => {
      state.name = action.payload
      state.isOpen = true
    },
    closeModal: (state) => {
      state.name = null
      state.isOpen = false
    }
  }
})

export const { openModal, closeModal } = modalSlice.actions

export const selectModalName = (state: RootState) => state.modal.name
export const selectModalIsOpen = (state: RootState) => state.modal.isOpen

export const modalReducer = modalSlice.reducer
