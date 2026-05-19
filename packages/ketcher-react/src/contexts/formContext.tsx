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

import React from 'react';

export interface SchemaProperty {
  title?: string;
  type?: string;
  enum?: unknown[];
  enumNames?: string[];
  default?: unknown;
  format?: string;
  pattern?: string;
  maxLength?: number;
  invalidMessage?: string | ((data: unknown) => string);
}

export interface FormSchema {
  key?: string;
  title?: string;
  default?: unknown;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  properties?: Record<string, SchemaProperty | Record<string, any>>;
}

export interface FieldState {
  dataError: string | undefined;
  value: unknown;
  extraValue: unknown;
  onChange: (val: unknown) => void;
  onExtraChange: (val: unknown) => void;
}

export interface FormStateStore {
  field(
    name: string,
    onChange?: (value: unknown) => void,
    extraName?: string,
  ): FieldState;
  updateState(newState: Record<string, unknown>): void;
  props: {
    result: Record<string, unknown>;
    errors?: Record<string, string>;
  };
}

export interface FormContextValue {
  schema: FormSchema;
  stateStore: FormStateStore;
}

const formContext = React.createContext<FormContextValue | null>(null);

export default formContext;
