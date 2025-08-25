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

import { keyNorm, initHotKeys } from '../../utilities/keynorm';
import { CoreEditor } from './Editor';
import { EditorType } from './editor.types';
import { hotkeysConfiguration } from './editorEvents';

export interface UniversalHotkeyHandler {
  (editor: CoreEditor, event: KeyboardEvent): boolean;
}

export interface UniversalHotkeyConfig {
  shortcut: string | string[];
  handler: UniversalHotkeyHandler;
  description?: string;
}

export class UniversalHotkeysManager {
  private editor: CoreEditor;
  private hotkeyConfigs: Map<string, UniversalHotkeyConfig> = new Map();
  private eventListener: ((event: KeyboardEvent) => void) | null = null;
  private moleculesActions: Record<string, unknown> | null = null;

  constructor(editor: CoreEditor) {
    this.editor = editor;
    this.initializeDefaultHotkeys();
  }

  public setMoleculesActions(actions: Record<string, unknown>) {
    this.moleculesActions = actions;
    this.initializeMoleculesHotkeys();
  }

  private initializeMoleculesHotkeys() {
    if (!this.moleculesActions) return;

    Object.entries(this.moleculesActions).forEach(
      ([key, action]: [string, unknown]) => {
        const actionConfig = action as { shortcut?: string | string[] };
        if (actionConfig.shortcut) {
          this.addHotkey(key, {
            shortcut: actionConfig.shortcut,
            handler: (editor: CoreEditor, _event: KeyboardEvent) => {
              if (editor._type === EditorType.Macromolecules) return false;
              console.log('Molecules hotkey triggered:', key);
              return true;
            },
          });
        }
      },
    );
  }

  private initializeDefaultHotkeys() {
    Object.entries(hotkeysConfiguration).forEach(([key, config]) => {
      this.addHotkey(key, {
        shortcut: config.shortcut,
        handler: (editor: CoreEditor, _event: KeyboardEvent) => {
          if (editor._type === EditorType.Micromolecules) return false;
          config.handler(editor);
          return true;
        },
      });
    });
  }

  public addHotkey(name: string, config: UniversalHotkeyConfig) {
    this.hotkeyConfigs.set(name, config);
  }

  public removeHotkey(name: string) {
    this.hotkeyConfigs.delete(name);
  }

  public setup() {
    if (this.eventListener) {
      document.removeEventListener('keydown', this.eventListener);
    }

    this.eventListener = (event: KeyboardEvent) => {
      this.handleKeyEvent(event);
    };

    document.addEventListener('keydown', this.eventListener);
  }

  public cleanup() {
    if (this.eventListener) {
      document.removeEventListener('keydown', this.eventListener);
      this.eventListener = null;
    }
  }

  private handleKeyEvent(event: KeyboardEvent) {
    if (event.defaultPrevented) return;

    const target = event.target as HTMLElement | null;
    const isEditableTarget = !!(
      target &&
      (target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        target.closest('[contenteditable="true"]'))
    );

    if (isEditableTarget) return;

    const hotkeysMap: Record<string, string> = {};
    this.hotkeyConfigs.forEach((config, name) => {
      if (Array.isArray(config.shortcut)) {
        config.shortcut.forEach((shortcut) => {
          hotkeysMap[shortcut] = name;
        });
      } else {
        hotkeysMap[config.shortcut] = name;
      }
    });

    const actionsForInitHotKeys: Record<
      string,
      { shortcut: string | string[] }
    > = {};
    Object.entries(hotkeysMap).forEach(([_shortcut, actionName]) => {
      const config = this.hotkeyConfigs.get(actionName);
      if (config) {
        actionsForInitHotKeys[actionName] = { shortcut: config.shortcut };
      }
    });

    const hotKeys = initHotKeys(actionsForInitHotKeys);
    const shortcutKey = keyNorm.lookup(hotKeys, event);

    if (shortcutKey) {
      const actionName = Array.isArray(shortcutKey)
        ? shortcutKey[0]
        : shortcutKey;
      const config = this.hotkeyConfigs.get(actionName);

      if (config) {
        const handled = config.handler(this.editor, event);
        if (handled) {
          event.preventDefault();
        }
      }
    }
  }

  public getHotkeysList(): Array<{
    name: string;
    config: UniversalHotkeyConfig;
  }> {
    return Array.from(this.hotkeyConfigs.entries()).map(([name, config]) => ({
      name,
      config,
    }));
  }
}
