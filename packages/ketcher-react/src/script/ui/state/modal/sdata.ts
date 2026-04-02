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

import {
  getSdataDefault,
  sdataSchema,
  sdataCustomSchema,
} from '../../data/schema/sdata-schema';

type ModalErrors = Record<string, unknown>;

interface ModalValidationState<TResult extends Record<string, unknown>> {
  errors: ModalErrors;
  valid: boolean;
  result: TResult;
}

interface ModalReducerActionData<TResult extends Record<string, unknown>> {
  valid: boolean;
  errors: ModalErrors;
  result: Partial<TResult> & Record<string, unknown>;
}

interface ModalReducerAction<TResult extends Record<string, unknown>> {
  data: ModalReducerActionData<TResult>;
}

interface SdataInitializerSchema {
  key?: string;
}

interface SdataResult extends Record<string, unknown> {
  context: string;
  fieldName: string;
  fieldValue: string;
  radiobuttons: string;
  type: 'DAT' | 'nucleotideComponent';
  init?: boolean;
}

type SdataState = ModalValidationState<SdataResult>;

type SdataActionData = Omit<ModalReducerActionData<SdataResult>, 'result'> & {
  result: Partial<SdataResult> & Record<string, unknown>;
};

type SdataAction = Omit<ModalReducerAction<SdataResult>, 'data'> & {
  data: SdataActionData;
};

type SdataStateWithResult = Pick<SdataState, 'result'> &
  Partial<Omit<SdataState, 'result'>>;

type SchemaMap = Record<string, Record<string, unknown>>;

const getSdataDefaultValue = (...args: unknown[]): string =>
  (getSdataDefault as (...params: unknown[]) => string)(...args);

export const initSdata = (schema: SdataInitializerSchema): SdataState => {
  const isCustomShema = schema.key === 'Custom';

  const context = isCustomShema
    ? getSdataDefaultValue(sdataCustomSchema, 'context')
    : getSdataDefaultValue(sdataSchema);
  const fieldName = isCustomShema
    ? getSdataDefaultValue(sdataCustomSchema, 'fieldName')
    : getSdataDefaultValue(sdataSchema, context);
  const fieldValue = isCustomShema
    ? getSdataDefaultValue(sdataCustomSchema, 'fieldValue')
    : getSdataDefaultValue(sdataSchema, context, fieldName);
  const radiobuttons = 'Absolute';

  return {
    errors: {},
    valid: true,
    result: {
      context,
      fieldName,
      fieldValue,
      radiobuttons,
      type: 'DAT',
    },
  };
};

const correctErrors = (
  state: SdataStateWithResult,
  payload: SdataActionData,
): SdataState => {
  const { valid, errors } = payload;
  const fieldName = String(state.result.fieldName || '');
  const fieldValue = String(state.result.fieldValue || '');

  return {
    result: state.result,
    valid: valid && !!fieldName && !!fieldValue,
    errors,
  };
};

const onContextChange = (
  state: SdataState,
  payload: Partial<SdataResult> & Record<string, unknown>,
): SdataStateWithResult => {
  const context = String(payload.context ?? state.result.context);
  const fieldValue = String(payload.fieldValue ?? '');
  const radiobuttons = String(
    payload.radiobuttons ?? state.result.radiobuttons,
  );
  const type = payload.type ?? state.result.type;

  const fieldName = getSdataDefaultValue(sdataCustomSchema, 'fieldName');

  let fValue = fieldValue;
  if (fValue === state.result.fieldValue)
    fValue = getSdataDefaultValue(sdataCustomSchema, 'fieldValue');

  return {
    result: {
      context,
      fieldName,
      fieldValue: fValue,
      radiobuttons,
      type,
    },
  };
};

const onFieldNameChange = (
  state: SdataState,
  payload: Partial<SdataResult> & Record<string, unknown>,
): SdataStateWithResult => {
  const fieldName = String(payload.fieldName ?? '');

  const context = state.result.context;
  const sdataMap = sdataSchema as SchemaMap;
  const radiobuttons = String(
    payload.radiobuttons ?? state.result.radiobuttons,
  );
  const type = payload.type ?? state.result.type;

  let fieldValue = String(payload.fieldValue ?? '');

  if (sdataMap[context]?.[fieldName])
    fieldValue = getSdataDefaultValue(sdataSchema, context, fieldName);

  if (
    fieldValue === state.result.fieldValue &&
    sdataMap[context]?.[state.result.fieldName]
  )
    fieldValue = '';

  return {
    result: {
      context,
      fieldName,
      fieldValue,
      radiobuttons,
      type,
    },
  };
};

export function sdataReducer(
  state: SdataState,
  action: SdataAction,
): SdataState {
  if (action.data.result.init) {
    return correctErrors(
      {
        ...state,
        result: { ...state.result, ...action.data.result },
      },
      action.data,
    );
  }

  const actionContext = action.data.result.context;
  const actionFieldName = action.data.result.fieldName;

  let newstate: SdataStateWithResult | null = null;

  if (actionContext !== state.result.context)
    newstate = onContextChange(state, action.data.result);
  else if (actionFieldName !== state.result.fieldName)
    newstate = onFieldNameChange(state, action.data.result);

  newstate = newstate ?? {
    ...state,
    result: { ...state.result, ...action.data.result },
  };

  return correctErrors(newstate, action.data);
}

export function nucleotideComponentReducer(
  state: SdataState,
  action: SdataAction,
): SdataState {
  return {
    ...state,
    result: {
      ...state.result,
      ...action.data.result,
      type: 'nucleotideComponent',
    },
  };
}
