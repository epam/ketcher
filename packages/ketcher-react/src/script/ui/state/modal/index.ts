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

import { type Dispatch, type AnyAction } from 'redux';
import { formReducer, formsState, type ModalFormState } from './form';

interface ModalDialogProps {
  onResult: (value: unknown) => void;
  onCancel: (reason?: unknown) => void;
  isNestedModal?: boolean;
  isRestoredModal?: boolean;
  [key: string]: unknown;
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
    prop?: Partial<ModalDialogProps>;
  };
}

interface ModalCloseAction {
  type: 'MODAL_CLOSE';
}

type ModalAction = ModalOpenAction | ModalCloseAction | AnyAction;

export type { ModalState, ModalDialogProps };

export function openDialog(
  dispatch: Dispatch,
  dialogName: string,
  props?: Record<string, unknown>,
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    dispatch({
      type: 'MODAL_OPEN',
      data: {
        name: dialogName,
        prop: {
          ...props,
          onResult: resolve,
          onCancel: reject,
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

  switch (type) {
    case 'UPDATE_FORM': {
      // Don't update if modal has already been closed
      // TODO: refactor actions and server functions in /src/script/ui/state/server/index.js to
      // not send 'UPDATE_FORM' action to a closed modal in the first place
      if (!state) {
        return null;
      }
      const formState = formReducer(state.form ?? undefined, action);
      return { ...state, form: formState };
    }

    case 'MODAL_CLOSE': {
      if (state?.parentModal) {
        const restoredProp = {
          ...state.parentModal.prop,
          ...(state.parentModal.form?.result ?? {}),
          isRestoredModal: true,
        } as ModalDialogProps;
        return { ...state.parentModal, prop: restoredProp };
      }
      return null;
    }

    case 'MODAL_OPEN': {
      const { data } = action as ModalOpenAction;
      return {
        name: data.name,
        form: formsState[data.name] || null,
        prop: (data.prop as ModalDialogProps) || null,
        parentModal: data.prop?.isNestedModal ? state : null,
      };
    }

    default:
      return state;
  }
}

export default modalReducer;
