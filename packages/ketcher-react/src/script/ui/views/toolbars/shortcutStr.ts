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
const isMac = /Mac/.test(navigator.platform) // eslint-disable-line no-undef
const shortcutAliasMap = {
  Escape: 'Esc',
  Delete: 'Del',
  Mod: isMac ? '⌘' : 'Ctrl'
}

export function shortcutStr(shortcut?: string | string[]) {
  if (!shortcut) {
    return ''
  }

  const shortcutKey = Array.isArray(shortcut) ? shortcut[0] : shortcut
  return shortcutKey.replace(
    /(\b[a-z]\b$|Mod|Escape|Delete)/g,
    key => shortcutAliasMap[key] || key.toUpperCase()
  )
}
