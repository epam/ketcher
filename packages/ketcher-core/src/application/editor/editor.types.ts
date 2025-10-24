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

import { Action } from '../editor/actions';
import { Render } from 'application/render';
import { Struct } from 'domain/entities';
import { selectionKeys } from './shared/constants';
import { PipelineSubscription, Subscription } from 'subscription';
import { IRnaPreset } from 'application/editor/tools';

export type EditorSelection = {
  [key in typeof selectionKeys[number]]?: number[];
};

export type FloatingToolsParams = {
  visible?: boolean;
  rotateHandlePosition?: { x: number; y: number };
};

export enum EditorType {
  Micromolecules = 0,
  Macromolecules = 1,
}

export interface Editor {
  isDitrty: () => boolean;
  setOrigin: () => void;
  struct: (
    struct?: Struct,
    needToCenterStruct?: boolean,
    x?: number,
    y?: number,
  ) => Struct;
  structToAddFragment: (struct: Struct, x?: number, y?: number) => Struct;
  subscribe: (eventName: string, handler: (data?: any) => any) => any;
  unsubscribe: (eventName: string, subscriber: any) => void;
  selection: (arg?: EditorSelection | 'all' | null) => EditorSelection | null;
  undo: () => void;
  redo: () => void;
  clear: () => void;
  clearHistory: () => void;
  options: (value?: any) => any;
  setOptions: (opts: string) => any;
  zoom: (value?: any) => any;
  structSelected: () => Struct;
  explicitSelected: () => EditorSelection;
  centerStruct: () => void;
  zoomAccordingContent: (struct: Struct) => void;
  errorHandler: ((message: string) => void) | null;
  event: {
    message: Subscription;
    elementEdit: PipelineSubscription;
    bondEdit: PipelineSubscription;
    zoomIn: PipelineSubscription;
    zoomOut: PipelineSubscription;
    rgroupEdit: PipelineSubscription;
    sgroupEdit: PipelineSubscription;
    sdataEdit: PipelineSubscription;
    quickEdit: PipelineSubscription;
    attachEdit: PipelineSubscription;
    removeFG: PipelineSubscription;
    change: Subscription;
    selectionChange: PipelineSubscription;
    aromatizeStruct: PipelineSubscription;
    dearomatizeStruct: PipelineSubscription;
    enhancedStereoEdit: PipelineSubscription;
    confirm: PipelineSubscription;
    showInfo: PipelineSubscription;
    apiSettings: PipelineSubscription;
    cursor: Subscription;
    updateFloatingTools: Subscription<FloatingToolsParams>;
  };
  update: (
    action: Action | true,
    ignoreHistory?: boolean,
    options?: { resizeCanvas: boolean },
  ) => void;
  render: Render;
  // supposed to be RotateController from 'ketcher-react' package
  rotateController: any;
  macromoleculeConvertionError: string | null | undefined;
  setMacromoleculeConvertionError: (errorMessage: string) => void;
  clearMacromoleculeConvertionError: () => void;
  serverSettings: object;
  focusCliparea: () => void;
  closeMonomerCreationWizard: () => void;
  ketcherId: string;
}

export type LibraryItemDragState = {
  item: IRnaPreset;
  position: {
    x: number;
    y: number;
  };
} | null;
