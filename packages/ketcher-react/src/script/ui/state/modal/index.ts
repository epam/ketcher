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
type BaseModalFormState = typeof formsState[keyof typeof formsState];
type ModalFormState = Omit<BaseModalFormState, 'result'> & {
  result: ModalFormResult;
};

interface ModalDialogProps {
  [key: string]: unknown;
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

interface ModalOpenAction extends UnknownAction {
  type: 'MODAL_OPEN';
  data: {
    name: string;
    prop?: ModalDialogProps | null;
  };
}

interface ModalCloseAction extends UnknownAction {
  type: 'MODAL_CLOSE';
}

interface UpdateFormAction extends UnknownAction {
  type: 'UPDATE_FORM';
  data: Record<string, unknown>;
}

type ModalAction = ModalOpenAction | ModalCloseAction | UpdateFormAction;

type ModalDispatch = Dispatch<ModalAction>;

function isUpdateFormAction(action: UnknownAction): action is UpdateFormAction {
  return action.type === 'UPDATE_FORM' && 'data' in action;
}

function isModalOpenAction(action: UnknownAction): action is ModalOpenAction {
  return action.type === 'MODAL_OPEN' && 'data' in action;
}

function ensureFormState(
  form: BaseModalFormState | null | undefined,
): ModalFormState | null {
  if (!form) {
    return null;
  }

  const result =
    'result' in form && form.result && typeof form.result === 'object'
      ? (form.result as ModalFormResult)
      : {};

  return {
    ...form,
    result,
  };
}

function getFormResult(form: ModalFormState | null): ModalFormResult {
  return form?.result ?? {};
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
  action: UnknownAction,
): ModalState | null {
  if (isUpdateFormAction(action)) {
    // Don't update if modal has already been closed
    // TODO: refactor actions and server functions in /src/script/ui/state/server/index.js to
    // not send 'UPDATE_FORM' action to a closed modal in the first place
    if (!state) {
      return null;
    }

    const formState = ensureFormState(
      formReducer(state.form ?? undefined, action),
    );
    return { ...state, form: formState };
  }

  const { type } = action;

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

    case 'MODAL_OPEN':
      if (isModalOpenAction(action)) {
        const { data } = action;

        return {
          name: data.name,
          form: ensureFormState(formsState[data.name]),
          prop: data.prop || null,
          parentModal: data.prop?.isNestedModal ? state : null,
        };
      }
      return state;

    default:
      return state;
  }
}

export default modalReducer;

export type { ModalDialogProps, ModalState };
