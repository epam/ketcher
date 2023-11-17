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

import { KetcherLogger } from './KetcherLogger';

const KETCHER_SAVED_SETTINGS_KEY = 'ketcher_editor_saved_settings';

interface SavedSettings {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selectionTool?: any;
  ignoreChiralFlag?: boolean;
  disableCustomQuery?: boolean;
}

export class SettingsManager {
  static _disableCustomQuery?: boolean;

  static getSettings(): SavedSettings {
    try {
      return JSON.parse(
        localStorage.getItem(KETCHER_SAVED_SETTINGS_KEY) || '{}',
      );
    } catch (e) {
      KetcherLogger.error(
        'settingsManager.ts::SettingsManager::getSettings',
        e,
      );
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

  static get disableCustomQuery() {
    return this._disableCustomQuery;
  }

  static set disableCustomQuery(disableCustomQuery: boolean | undefined) {
    this._disableCustomQuery = disableCustomQuery;
  }

  static get ignoreChiralFlag() {
    const { ignoreChiralFlag } = this.getSettings();
    return ignoreChiralFlag;
  }

  static set ignoreChiralFlag(ignoreChiralFlag: boolean | undefined) {
    const settings = this.getSettings();

    this.saveSettings({
      ...settings,
      ignoreChiralFlag,
    });
  }
}
