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

// TODO: This is a partial type definition of the Redux store.
// The actual store structure is more complex and should be expanded
// as more components are migrated to TypeScript.
// Ideally each reducer should have its own state type, which are then
// combined here to form the complete StoreState.

export interface TemplatesState {
  attach: {
    name: string;
    atomid: number;
    bondid: number;
  };
  lib: Array<{
    struct: import('ketcher-core').Struct;
    props: {
      atomid?: string | number;
      bondid?: string | number;
      group?: string;
      [key: string]: string | number | undefined;
    };
  }>;
}

export interface ModalState {
  form: {
    errors: Record<string, string>;
    valid: boolean;
    result: Record<string, unknown>;
  };
}

export interface OptionsState {
  settings: Record<string, unknown>;
}

export interface StoreState {
  templates: TemplatesState;
  modal: ModalState;
  options: OptionsState;
}
