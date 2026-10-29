/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

<<<<<<< HEAD
import type { Struct } from 'ketcher-core';
import type { OptionsState } from './options/types';
=======
import type { AutomapMode, Struct } from 'ketcher-core';
import type { Action, compose } from 'redux';
import type { ButtonsConfig } from '../../builders/ketcher/ButtonsConfig';
import type { CustomButton } from '../../builders/ketcher/CustomButtons';
import type { OptionsState } from './options/types';
import type Editor from 'src/script/editor';
import type { Api } from 'src/script/api';
import type { ToolVariant } from '../action';
import type { ThunkAction } from 'redux-thunk';
import type { ToolbarState } from './toolbar/types';
>>>>>>> origin/master

export type {
  AnalyseRoundName,
  AnalyseState,
  AnalyseValues,
  OptionsState,
} from './options/types';

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
    struct: Struct;
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

export interface StoreState {
  editor: Editor;
  server: Api;
  templates: TemplatesState;
  modal: ModalState;
  toolbar: ToolbarState & {
    visibleTools: ToolbarState['visibleTools'] & { select: ToolVariant };
  };
  options: OptionsState;
}

export type SetEditor = (editor: Editor) => void;

export type ServerState = Api;

export interface StoreOptions {
  buttons?: ButtonsConfig;
  customButtons?: Array<CustomButton>;
  [key: string]: unknown;
}

export interface InitAction extends Action<'INIT'> {
  editor: Editor;
  server?: Api;
  [key: string]: unknown;
}

export interface SetServerAction extends Action<'SET_SERVER'> {
  server?: Api;
}

export type DevToolsSanitizer = (value: unknown) => unknown;

export interface ReduxDevToolsOptions {
  stateSanitizer?: DevToolsSanitizer;
  actionSanitizer?: DevToolsSanitizer;
}

export type ReduxDevToolsCompose = (
  options?: ReduxDevToolsOptions,
) => typeof compose;

export type DevToolsGlobal = typeof globalThis & {
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: ReduxDevToolsCompose;
};

export interface KetcherCheckErrors {
  chiral_flag?: string;
  valence?: string;
}
export type AutomapRequest = {
  mode: AutomapMode;
};

export type ServerTransformMethod =
  | 'layout'
  | 'clean'
  | 'aromatize'
  | 'dearomatize'
  | 'calculateCip'
  | 'toggleExplicitHydrogens'
  | 'automap'
  | 'check'
  | 'calculate';

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  StoreState,
  unknown,
  Action<string>
>;

export type CurrentAppState = Pick<StoreState, 'options'> & {
  editor: Editor | null;
};
