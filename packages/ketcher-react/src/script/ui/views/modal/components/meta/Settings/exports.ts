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

// Public surface of the shared Settings window. `ketcher-macromolecules` mounts
// the same presentational panel over `SettingsService` instead of the micro form.
export {
  default as SettingsPanel,
  SETTINGS_PANEL_WIDTH,
  SETTINGS_PANEL_GUTTER,
} from './SettingsPanel';
export type { SettingsPanelProps } from './SettingsPanel';

export { default as SettingsAccordion } from './SettingsAccordion';
export type {
  SettingsAccordionProps,
  SettingsGroup,
} from './SettingsAccordion';

export { default as SettingsFieldRow } from './SettingsFieldRow';
export type {
  SettingsFieldRowProps,
  SettingsFieldLayout,
} from './SettingsFieldRow';

export {
  clampRectToBounds,
  getBoundsRelativeTo,
  useSettingsPanelDrag,
} from './useSettingsPanelDrag';
export type { PanelRect, PanelBounds } from './useSettingsPanelDrag';
