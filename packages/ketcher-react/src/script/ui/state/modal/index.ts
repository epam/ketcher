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

import { formReducer, formsState } from './form';
import type { Dispatch, UnknownAction } from 'redux';

type ModalFormResult = Record<string, unknown>;
type ModalFormState = typeof formsState[keyof typeof formsState];

interface ModalDialogProps extends Record<string, unknown> {
  isNestedModal?: boolean;
  isRestoredModal?: boolean;
  onResult?: (value: unknown) => void;
  onCancel?: (reason?: unknown) => void;
}

interface ModalState {
  name: string;
  form: ModalFormState | null;
  prop: ModalDialogProps | null;
  parentModal: ModalState | null;
}

interface ModalOpenAction {
  type: 'MODAL_OPEN';
  data: {
    name: string;
    prop?: ModalDialogProps | null;
  };
}

interface ModalCloseAction {
  type: 'MODAL_CLOSE';
}

interface UpdateFormAction {
  type: 'UPDATE_FORM';
  data: Record<string, unknown>;
}

type ModalAction =
  | ModalOpenAction
  | ModalCloseAction
  | UpdateFormAction
  | {
      type: string;
      data?: unknown;
    };

type ModalDispatch = Dispatch<UnknownAction>;

function getFormResult(form: ModalFormState | null): ModalFormResult {
  if (!form || typeof form !== 'object' || !('result' in form)) {
    return {};
  }

  const result = (form as { result?: unknown }).result;
  return result && typeof result === 'object'
    ? (result as ModalFormResult)
    : {};
}

export function openDialog<T = unknown>(
  dispatch: ModalDispatch,
  dialogName: string,
  props: ModalDialogProps = {},
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    dispatch({
      type: 'MODAL_OPEN',
      data: {
        name: dialogName,
        prop: {
          ...props,
          onResult: (value) => resolve(value as T),
          onCancel: (reason) => reject(reason),
        },
      },
    });
  });
}

function modalReducer(
  state: ModalState | null = null,
  action: ModalAction,
): ModalState | null {
  const { type } = action;

  if (type === 'UPDATE_FORM') {
    // Don't update if modal has already been closed
    // TODO: refactor actions and server functions in /src/script/ui/state/server/index.js to
    // not send 'UPDATE_FORM' action to a closed modal in the first place
    if (!state) {
      return null;
    }

    const formState = formReducer(state.form, action) as ModalFormState;
    return { ...state, form: formState };
  }

  switch (type) {
    case 'MODAL_CLOSE':
      if (state?.parentModal) {
        return {
          ...state.parentModal,
          prop: {
            ...(state.parentModal.prop || {}),
            ...getFormResult(state.parentModal.form),
            isRestoredModal: true,
          },
        };
      }
      return null;

    case 'MODAL_OPEN': {
      const data = (action as ModalOpenAction).data;
      const modalForms = formsState as Record<string, ModalFormState>;

      return {
        name: data.name,
        form: modalForms[data.name] || null,
        prop: data.prop || null,
        parentModal: data.prop?.isNestedModal ? state : null,
      };
    }

    default:
      return state;
  }
}

export default modalReducer;

export type { ModalDialogProps, ModalState };
