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

import { KETCHER_SAVED_SETTINGS_KEY } from 'src/constants';

interface SavedSettings {
  selectionTool?: any;
}

export class SettingsManager {
  static getSettings(): SavedSettings {
    try {
      return JSON.parse(
        localStorage.getItem(KETCHER_SAVED_SETTINGS_KEY) || '{}',
      );
    } catch (e) {
      return {} as SavedSettings;
    }
  }

  static saveSettings(settings: SavedSettings) {
    if (!settings) {
      return;
    }
    localStorage.setItem(KETCHER_SAVED_SETTINGS_KEY, JSON.stringify(settings));
  }

  static get selectionTool() {
    const { selectionTool } = this.getSettings();

    return selectionTool;
  }

  static set selectionTool(selectionTool) {
    const settings = this.getSettings();

    this.saveSettings({
      ...settings,
      selectionTool,
    });
  }
}
