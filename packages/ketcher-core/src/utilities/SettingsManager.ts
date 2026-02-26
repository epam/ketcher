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
import { LayoutMode } from 'application/editor';

export const KETCHER_SAVED_SETTINGS_KEY = 'ketcher_editor_saved_settings';
export const KETCHER_SAVED_OPTIONS_KEY = 'ketcher-opts';

export type EditorLineLength = Record<
  Exclude<LayoutMode, 'flex-layout-mode'>,
  number
>;

const DefaultEditorLineLength: EditorLineLength = {
  'sequence-layout-mode': 30,
  'snake-layout-mode': 0,
};

export const SetEditorLineLengthAction = 'SetEditorLineLength';

interface SavedSettings {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selectionTool?: any;
  disableCustomQuery?: boolean;
  editorLineLength?: EditorLineLength;
  monomerLibraryUpdates?: string[];
}

interface SavedOptions {
  ignoreChiralFlag?: boolean;
  disableQueryElements?: string[] | null;
}

export class SettingsManager {
  private static disableCustomQueryValue?: boolean;
  private static persistMonomerLibraryUpdatesValue = true;

  static getSettings(): SavedSettings {
    try {
      return JSON.parse(
        localStorage.getItem(KETCHER_SAVED_SETTINGS_KEY) ?? '{}',
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

  static getOptions(): SavedOptions {
    try {
      const optionsFromLocalStorage = JSON.parse(
        localStorage.getItem(KETCHER_SAVED_OPTIONS_KEY) ?? '{}',
      );

      // In 2.25 default bondLength was set to 2.1 by mistake.
      // Current code reset it to 40px
      // Can be removed in future versions
      if (
        optionsFromLocalStorage.bondLength === 2.1 &&
        optionsFromLocalStorage.bondLengthUnit === 'px'
      ) {
        optionsFromLocalStorage.bondLength = 40;
      }

      return optionsFromLocalStorage;
    } catch (e) {
      KetcherLogger.error('SettingsManager.ts::SettingsManager::getOptions', e);
      return {} as SavedOptions;
    }
  }

  static saveOptions(options: SavedOptions) {
    if (!options) {
      return;
    }
    localStorage.setItem(KETCHER_SAVED_OPTIONS_KEY, JSON.stringify(options));
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

  static get editorLineLength(): EditorLineLength {
    const { editorLineLength } = this.getSettings();
    return { ...DefaultEditorLineLength, ...editorLineLength };
  }

  static set editorLineLength(newEditorLineLength: Partial<EditorLineLength>) {
    const settings = this.getSettings();
    const previousEditorLineLength =
      settings.editorLineLength ?? DefaultEditorLineLength;
    const editorLineLength = {
      ...previousEditorLineLength,
      ...newEditorLineLength,
    };

    window.dispatchEvent(
      new CustomEvent<EditorLineLength>(SetEditorLineLengthAction, {
        detail: editorLineLength,
      }),
    );

    this.saveSettings({
      ...settings,
      editorLineLength,
    });
  }

  static get disableCustomQuery() {
    return this.disableCustomQueryValue;
  }

  static set disableCustomQuery(disableCustomQuery: boolean | undefined) {
    this.disableCustomQueryValue = disableCustomQuery;
  }

  static get ignoreChiralFlag() {
    const { ignoreChiralFlag } = this.getOptions();
    return ignoreChiralFlag;
  }

  static set ignoreChiralFlag(ignoreChiralFlag: boolean | undefined) {
    const options = this.getOptions();

    this.saveOptions({
      ...options,
      ignoreChiralFlag,
    });
  }

  static get monomerLibraryUpdates() {
    const { monomerLibraryUpdates } = this.getSettings();
    return monomerLibraryUpdates || [];
  }

  static set monomerLibraryUpdates(monomerLibraryUpdates: string[]) {
    const settings = this.getSettings();

    this.saveSettings({
      ...settings,
      monomerLibraryUpdates,
    });
  }

  static addMonomerLibraryUpdate(newUpdate: string) {
    const updates = this.monomerLibraryUpdates;
    if (!updates.includes(newUpdate)) {
      updates.push(newUpdate);
      this.monomerLibraryUpdates = updates;
    }
  }

  static get persistMonomerLibraryUpdates(): boolean {
    return this.persistMonomerLibraryUpdatesValue;
  }

  static set persistMonomerLibraryUpdates(value: boolean | undefined) {
    this.persistMonomerLibraryUpdatesValue = value ?? true;
  }
}
