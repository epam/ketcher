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

import { initSdata, nucleotideComponentReducer, sdataReducer } from './sdata';

import { getDefaultOptions } from '../../data/schema/options-schema';
import { sdataCustomSchema } from '../../data/schema/sdata-schema';
import { SUPERATOM_CLASS } from 'ketcher-core';
import { AnyAction } from 'redux';

type ModalFormErrors = Record<string, unknown>;

type MoleculeErrors = Record<string, string>;

interface ModalFormState<TResult = Record<string, unknown>> {
  errors: ModalFormErrors;
  valid?: boolean;
  result?: TResult;
  moleculeErrors?: MoleculeErrors;
}

type ModalFormsState = Record<string, ModalFormState>;

interface UpdateFormAction<TData = Partial<ModalFormState>> extends AnyAction {
  type: 'UPDATE_FORM';
  data: TData;
}

type ModalReducerAction = UpdateFormAction | AnyAction;

export const formsState: ModalFormsState = {
  // TODO: create from schema.{smth}.defaultValue
  // TODO: change validation method, no 'valid:true' props as default
  atomProps: {
    errors: {},
    valid: true,
    result: {
      label: '',
      charge: null,
      explicitValence: -1,
      hCount: 0,
      invRet: 0,
      isotope: null,
      radical: 0,
      ringBondCount: 0,
      substitutionCount: 0,
      aromaticity: null,
      implicitHCount: null,
      ringMembership: null,
      ringSize: null,
      connectivity: null,
      chirality: null,
      customQuery: null,
    },
  },
  attachmentPoints: {
    errors: {},
    valid: true,
    result: {
      primary: false,
      secondary: false,
    },
  },
  automap: {
    errors: {},
    valid: true,
    result: {
      mode: 'discard',
    },
  },
  bondProps: {
    errors: {},
    valid: true,
    result: {
      type: 'single',
      topology: 0,
      center: 0,
      customQuery: null,
    },
  },
  check: {
    errors: {},
    moleculeErrors: {},
  },
  labelEdit: {
    errors: {},
    valid: true,
    result: {
      label: '',
    },
  },
  rgroup: {
    errors: {},
    valid: true,
    result: {
      values: [],
    },
  },
  rgroupLogic: {
    errors: {},
    valid: true,
    result: {
      ifthen: 0,
      range: '>0',
      resth: false,
    },
  },
  save: {
    errors: {},
    valid: true,
    result: {
      filename: 'ketcher',
      format: 'mol',
    },
  },
  settings: {
    errors: {},
    valid: true,
    result: getDefaultOptions(),
  },
  text: {
    errors: {},
    valid: true,
    result: {},
  },
  attach: {
    errors: {},
    valid: true,
    result: {},
  },
  sgroup: initSdata(sdataCustomSchema),
};

export function updateFormState<TData extends Partial<ModalFormState>>(
  data: TData,
): UpdateFormAction<TData> {
  return {
    type: 'UPDATE_FORM',
    data,
  };
}

export function checkErrors(errors: MoleculeErrors): UpdateFormAction {
  return {
    type: 'UPDATE_FORM',
    data: { moleculeErrors: errors },
  };
}

export function setDefaultSettings(): UpdateFormAction {
  return {
    type: 'UPDATE_FORM',
    data: {
      result: getDefaultOptions(),
      valid: true,
      errors: {} as ModalFormErrors,
    },
  };
}

export function formReducer(
  state: unknown = { errors: {} },
  action: ModalReducerAction,
): unknown {
  const actionData =
    'data' in action ? (action.data as Partial<ModalFormState>) : {};
  const formState = state as ModalFormState;
  const actionResult = actionData.result as Record<string, unknown>;
  const newType = actionResult?.type;

  if (newType === 'DAT') return sdataReducer(formState, action);
  if (
    newType === 'SUP' &&
    formState?.result?.type !== 'nucleotideComponent' &&
    (Object.values(SUPERATOM_CLASS) as string[]).includes(
      actionResult?.class as string,
    )
  )
    return nucleotideComponentReducer(formState, action);

  return { ...(state as object), ...actionData };
}
