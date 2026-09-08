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
import { castDraft, Draft } from 'immer';
import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit';
import { AdditionalModalProps } from 'components/modal/modalContainer/types';
import { RootState } from 'state';

interface ModalState {
  name: string | null;
  isOpen: boolean;
  additionalProps: AdditionalModalProps | null;
  errorTooltips: string[];
  errorModalText: string;
  errorModalTitle: string;
}

const initialState: ModalState = {
  name: null,
  isOpen: false,
  additionalProps: null,
  errorTooltips: [],
  errorModalText: '',
  errorModalTitle: '',
};

export type ModalName =
  | 'open'
  | 'save'
  | 'delete'
  | 'updateSequenceInRNABuilder'
  | 'monomerConnection'
  | 'confirmationDialog'
  | 'settings';

// Explicit reducer signatures keep the exported slice's type nameable:
// letting TS infer `Draft<ModalState>` here (which recurses into
// `AdditionalModalProps`'s class instances) makes the declaration emitter
// try to print immer's internal, unexported `WritableNonArrayDraft` type.
type ModalCaseReducers = {
  openModal: (
    state: Draft<ModalState>,
    action: PayloadAction<
      ModalName | { name: ModalName; additionalProps: AdditionalModalProps }
    >,
  ) => void;
  closeModal: (state: Draft<ModalState>) => void;
  openErrorTooltip: (
    state: Draft<ModalState>,
    action: PayloadAction<string>,
  ) => void;
  closeErrorTooltip: (
    state: Draft<ModalState>,
    action: PayloadAction<string | undefined>,
  ) => void;
  openErrorModal: (
    state: Draft<ModalState>,
    action: PayloadAction<
      string | { errorMessage: string; errorTitle: string }
    >,
  ) => void;
  closeErrorModal: (state: Draft<ModalState>) => void;
};

export const modalSlice: Slice<ModalState, ModalCaseReducers, 'modal'> =
  createSlice({
    name: 'modal',
    initialState,
    reducers: {
      openModal: (
        state,
        action: PayloadAction<
          ModalName | { name: ModalName; additionalProps: AdditionalModalProps }
        >,
      ) => {
        if (typeof action.payload === 'string') {
          state.name = action.payload;
        } else {
          state.name = action.payload.name;
          state.additionalProps = castDraft(action.payload.additionalProps);
        }

        state.isOpen = true;
      },
      closeModal: (state) => {
        state.name = null;
        state.isOpen = false;
        state.additionalProps = null;
      },
      openErrorTooltip: (state, action: PayloadAction<string>) => {
        if (!state.errorTooltips.includes(action.payload)) {
          state.errorTooltips.push(action.payload);
        }
      },
      closeErrorTooltip: (state, action: PayloadAction<string | undefined>) => {
        state.errorTooltips = action.payload
          ? state.errorTooltips.filter((text) => text !== action.payload)
          : [];
      },
      openErrorModal: (
        state,
        action: PayloadAction<
          string | { errorMessage: string; errorTitle: string }
        >,
      ) => {
        if (typeof action.payload === 'string') {
          state.errorModalText = action.payload;
        } else {
          const { errorMessage, errorTitle } = action.payload;
          state.errorModalText = errorMessage;
          state.errorModalTitle = errorTitle;
        }
      },
      closeErrorModal: (state) => {
        state.errorModalText = '';
      },
    },
  });

export const {
  openModal,
  closeModal,
  openErrorTooltip,
  closeErrorTooltip,
  openErrorModal,
  closeErrorModal,
} = modalSlice.actions;

export const selectModalName = (state: RootState): string | null =>
  state.modal.name;
export const selectModalIsOpen = (state: RootState): boolean =>
  state.modal.isOpen;
export const selectAdditionalProps = (
  state: RootState,
): AdditionalModalProps | null => state.modal.additionalProps;
export const selectErrorTooltips = (state: RootState): string[] =>
  state.modal.errorTooltips;
export const selectErrorModalText = (state: RootState): string => {
  return state.modal.errorModalText;
};
export const selectErrorModalTitle = (state: RootState): string => {
  return state.modal.errorModalTitle;
};

export const modalReducer = modalSlice.reducer;
