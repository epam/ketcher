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

export const ketcherInitEventName = (ketcherId?: string) =>
  ketcherId ? `ketcher-init-${ketcherId}` : 'ketcher-init';

export const MODES = {
  FG: 'fg',
};

export const STRUCT_TYPE = {
  atoms: 'atoms',
  bonds: 'bonds',
};

export const KETCHER_ROOT_NODE_CLASS_NAME = 'Ketcher-root';
export const KETCHER_ROOT_NODE_CSS_SELECTOR = `.${KETCHER_ROOT_NODE_CLASS_NAME}`;

export const EditorClassName = 'Ketcher-polymer-editor-root';
export const KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR = `.${EditorClassName}`;
export const STRUCT_SERVICE_NO_RENDER_INITIALIZED_EVENT =
  'struct-service-no-render-initialized';
export const STRUCT_SERVICE_INITIALIZED_EVENT = 'struct-service-initialized';
export const ACS_STYLE_DEFAULT_SETTINGS = {
  atomColoring: false,
  font: '30px Arial',
  fontsz: 10,
  fontszUnit: 'pt',
  fontszsub: 10,
  fontszsubUnit: 'pt',
  reactionComponentMarginSize: 1.6,
  reactionComponentMarginSizeUnit: 'pt',
  imageResolution: '600',
  bondLength: 30,
  bondLengthUnit: 'pt',
  bondSpacing: 18,
  bondThickness: 0.6,
  bondThicknessUnit: 'pt',
  stereoBondWidth: 2,
  stereoBondWidthUnit: 'pt',
  hashSpacing: 2.5,
  hashSpacingUnit: 'pt',
};
