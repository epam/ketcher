/* eslint-disable no-redeclare */
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

const isMac =
  typeof navigator !== 'undefined' ? /Mac/.test(navigator.platform) : false;

export const KeyboardModifiers = {
  Alt: 'Alt',
  Control: 'Control',
  Ctrl: 'Ctrl',
  Meta: 'Meta',
  Shift: 'Shift',
} as const;

export const KeyCodePrefixes = {
  Key: 'Key',
  Digit: 'Digit',
};

type HotKeyMap = Record<string, string[]>;
type HotKeyAction = {
  shortcut?: string | string[];
};
type HotKeyActions = Record<string, HotKeyAction>;

export const CanonicalModifiersOrder = [
  KeyboardModifiers.Ctrl,
  KeyboardModifiers.Alt,
  KeyboardModifiers.Shift,
  KeyboardModifiers.Meta,
];

export const ModifiersRegex = {
  Mod: /^mod$/i,
  Meta: /^(meta|cmd|m)$/i,
  Ctrl: /^(ctrl|control|c)$/i,
  Alt: /^(alt|a)$/i,
  Shift: /^(shift|s)$/i,
};

const normalizeCode = (code: string) => {
  if (code.startsWith(KeyCodePrefixes.Key)) {
    return code.slice(3);
  }
  if (code.startsWith(KeyCodePrefixes.Digit)) {
    return code.slice(5);
  }

  return code;
};

const normalizeShortcut = (input: string | KeyboardEvent) => {
  const activeModifiers = new Set<string>();
  let key: string;

  if (typeof input === 'string') {
    const tokens = input.split(/\+(?!$)/).map((p) => p.trim());
    key = tokens.pop() ?? '';
    if (key.length === 1) {
      key = key.toUpperCase();
    }

    if (tokens.some((module_) => ModifiersRegex.Mod.test(module_))) {
      activeModifiers.add(
        isMac ? KeyboardModifiers.Meta : KeyboardModifiers.Ctrl,
      );
    }
    if (tokens.some((module_) => ModifiersRegex.Meta.test(module_))) {
      activeModifiers.add(KeyboardModifiers.Meta);
    }
    if (tokens.some((module_) => ModifiersRegex.Ctrl.test(module_))) {
      activeModifiers.add(KeyboardModifiers.Ctrl);
    }
    if (tokens.some((module_) => ModifiersRegex.Alt.test(module_))) {
      activeModifiers.add(KeyboardModifiers.Alt);
    }
    if (tokens.some((module_) => ModifiersRegex.Shift.test(module_))) {
      activeModifiers.add(KeyboardModifiers.Shift);
    }
  } else if (input instanceof KeyboardEvent) {
    const event_ = input;

    if (event_.code.includes(KeyboardModifiers.Control)) {
      return KeyboardModifiers.Ctrl;
    }
    if (event_.code.includes(KeyboardModifiers.Alt)) {
      return KeyboardModifiers.Alt;
    }
    if (event_.code.includes(KeyboardModifiers.Meta)) {
      return KeyboardModifiers.Meta;
    }
    if (event_.code.includes(KeyboardModifiers.Shift)) {
      return KeyboardModifiers.Shift;
    }

    if (event_.ctrlKey) {
      activeModifiers.add(KeyboardModifiers.Ctrl);
    }
    if (event_.altKey) {
      activeModifiers.add(KeyboardModifiers.Alt);
    }
    if (event_.metaKey) {
      activeModifiers.add(KeyboardModifiers.Meta);
    }
    if (event_.shiftKey) {
      activeModifiers.add(KeyboardModifiers.Shift);
    }

    key = normalizeCode(event_.code);
  } else {
    throw new TypeError('normalizeShortcut expects string or KeyboardEvent');
  }

  const appliedModifiersInOrder = CanonicalModifiersOrder.filter((modifier) =>
    activeModifiers.has(modifier),
  );
  return [...appliedModifiersInOrder, key].join('+');
};

const normalizeKeyMap = (map: HotKeyMap): HotKeyMap => {
  const copy = Object.create(null) as HotKeyMap;

  Object.keys(map).forEach((property) => {
    copy[normalizeShortcut(property)] = map[property];
  });

  return copy;
};

export const isControlKey = (event: KeyboardEvent | PointerEvent) => {
  return isMac ? event.metaKey : event.ctrlKey;
};

// TODO rename and unify after moving all hotkeys to core editor
//  to handle all events in same way and to have same structure for all hotkey configs
/**
 * Normalizes a shortcut string, keyboard event, or normalized hotkey map.
 * String and event inputs return a normalized shortcut key, while map inputs
 * return a copy with normalized shortcut keys.
 */
function keyNormBase(object: KeyboardEvent): string;
function keyNormBase(object: string): string;
function keyNormBase(object: HotKeyMap): HotKeyMap;
function keyNormBase(
  object: string | KeyboardEvent | HotKeyMap,
): string | HotKeyMap {
  if (object instanceof KeyboardEvent) {
    return normalizeShortcut(object);
  }

  return typeof object === 'object'
    ? normalizeKeyMap(object)
    : normalizeShortcut(object);
}

const setHotKey = (key: string, actName: string, hotKeys: HotKeyMap) => {
  const existing = hotKeys[key];
  if (Array.isArray(existing)) {
    existing.push(actName);
  } else {
    hotKeys[key] = [actName];
  }
};

export const initHotKeys = (actions: HotKeyActions) => {
  const hotKeys: HotKeyMap = {};

  Object.keys(actions).forEach((actName) => {
    const act = actions[actName];
    if (!act.shortcut) return;

    if (Array.isArray(act.shortcut)) {
      act.shortcut.forEach((key) => {
        setHotKey(key, actName, hotKeys);
      });
    } else {
      setHotKey(act.shortcut, actName, hotKeys);
    }
  });

  return keyNormBase(hotKeys);
};

type KeyNorm = typeof keyNormBase & {
  /**
   * Returns the action group bound to a keyboard event. Multiple action names
   * may be returned when the same hotkey is shared, in the order they were
   * registered. Undefined means no binding was found for that shortcut.
   */
  lookup: (map: HotKeyMap, event: KeyboardEvent) => string[] | undefined;
};

const keyNorm: KeyNorm = Object.assign(keyNormBase, {
  lookup: (map: HotKeyMap, event: KeyboardEvent): string[] | undefined => {
    return map[normalizeShortcut(event)];
  },
});

export { keyNorm };
