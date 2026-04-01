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
  typeof navigator !== 'undefined' ? /Mac/.test(navigator.platform) : false; // eslint-disable-line no-undef

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

    if (tokens.some((mod) => ModifiersRegex.Mod.test(mod))) {
      activeModifiers.add(
        isMac ? KeyboardModifiers.Meta : KeyboardModifiers.Ctrl,
      );
    }
    if (tokens.some((mod) => ModifiersRegex.Meta.test(mod))) {
      activeModifiers.add(KeyboardModifiers.Meta);
    }
    if (tokens.some((mod) => ModifiersRegex.Ctrl.test(mod))) {
      activeModifiers.add(KeyboardModifiers.Ctrl);
    }
    if (tokens.some((mod) => ModifiersRegex.Alt.test(mod))) {
      activeModifiers.add(KeyboardModifiers.Alt);
    }
    if (tokens.some((mod) => ModifiersRegex.Shift.test(mod))) {
      activeModifiers.add(KeyboardModifiers.Shift);
    }
  } else if (input instanceof KeyboardEvent) {
    const e = input;

    if (e.code.includes(KeyboardModifiers.Control)) {
      return KeyboardModifiers.Ctrl;
    }
    if (e.code.includes(KeyboardModifiers.Alt)) {
      return KeyboardModifiers.Alt;
    }
    if (e.code.includes(KeyboardModifiers.Meta)) {
      return KeyboardModifiers.Meta;
    }
    if (e.code.includes(KeyboardModifiers.Shift)) {
      return KeyboardModifiers.Shift;
    }

    if (e.ctrlKey) {
      activeModifiers.add(KeyboardModifiers.Ctrl);
    }
    if (e.altKey) {
      activeModifiers.add(KeyboardModifiers.Alt);
    }
    if (e.metaKey) {
      activeModifiers.add(KeyboardModifiers.Meta);
    }
    if (e.shiftKey) {
      activeModifiers.add(KeyboardModifiers.Shift);
    }

    key = normalizeCode(e.code);
  } else {
    throw new Error('normalizeShortcut expects string or KeyboardEvent');
  }

  const appliedModifiersInOrder = CanonicalModifiersOrder.filter((modifier) =>
    activeModifiers.has(modifier),
  );
  return [...appliedModifiersInOrder, key].join('+');
};

const normalizeKeyMap = (map) => {
  const copy = Object.create(null);

  Object.keys(map).forEach((prop) => {
    copy[normalizeShortcut(prop)] = map[prop];
  });

  return copy;
};

export const isControlKey = (event: KeyboardEvent | PointerEvent) => {
  return isMac ? event.metaKey : event.ctrlKey;
};

// TODO rename and unify after moving all hotkeys to core editor
//  to handle all events in same way and to have same structure for all hotkey configs
const keyNorm = (obj) => {
  if (obj instanceof KeyboardEvent) {
    return normalizeShortcut(obj);
  }

  return typeof obj === 'object'
    ? normalizeKeyMap(obj)
    : normalizeShortcut(obj);
};

const setHotKey = (
  key: string,
  actName: string,
  hotKeys: Record<string, string | string[]>,
) => {
  const existing = hotKeys[key];
  if (Array.isArray(existing)) {
    existing.push(actName);
  } else {
    hotKeys[key] = [actName];
  }
};

export const initHotKeys = (actions) => {
  const hotKeys = {};
  let act;

  Object.keys(actions).forEach((actName) => {
    act = actions[actName];
    if (!act.shortcut) return;

    if (Array.isArray(act.shortcut)) {
      act.shortcut.forEach((key) => {
        setHotKey(key, actName, hotKeys);
      });
    } else {
      setHotKey(act.shortcut, actName, hotKeys);
    }
  });

  return keyNorm(hotKeys);
};

const lookup = (map: Record<string, string>, event: KeyboardEvent) => {
  return map[normalizeShortcut(event)];
};

keyNorm.lookup = lookup;

export { keyNorm };
