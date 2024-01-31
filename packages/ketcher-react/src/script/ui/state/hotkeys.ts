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

import * as clipArea from '../component/cliparea/cliparea';

import {
  KetSerializer,
  formatProperties,
  ChemicalMimeType,
  KetcherLogger,
  ketcherProvider,
  SupportedFormat,
  Editor,
  getStructure,
  MolSerializer,
  runAsyncAction,
  SettingsManager,
  keyNorm,
  initHotKeys,
} from 'ketcher-core';
import { debounce, isEqual } from 'lodash/fp';
import { load, onAction, removeStructAction } from './shared';

import actions from '../action';
import { isIE } from 'react-device-detect';
import {
  selectAbbreviationLookupValue,
  selectIsAbbreviationLookupOpen,
} from './abbreviationLookup/selectors';
import {
  closeAbbreviationLookup,
  initAbbreviationLookup,
  showAbbreviationLookup,
} from './abbreviationLookup';
import { isArrowKey, moveSelectedItems } from './moveSelectedItems';
import { handleHotkeyOverItem } from './handleHotkeysOverItem';

export function initKeydownListener(element) {
  return function (dispatch, getState) {
    const hotKeys = initHotKeys(actions);
    element.addEventListener('keydown', (event) =>
      keyHandle(dispatch, getState, hotKeys, event),
    );
  };
}

function removeNotRenderedStruct(actionTool, group, dispatch) {
  const affectedTools = ['paste', 'template'];
  if (affectedTools.includes(actionTool.tool) && group?.includes('save')) {
    dispatch(removeStructAction());
  }
}

let abbreviationLookupTimeoutId: number | undefined;
const ABBREVIATION_LOOKUP_TYPING_TIMEOUT = 1000;
const shortcutKeys = [
  '1',
  '2',
  '3',
  '4',
  't',
  'h',
  'n',
  'o',
  's',
  'p',
  'f',
  'i',
  'b',
  '+',
  '-',
];

/* HotKeys */
function keyHandle(dispatch, getState, hotKeys, event) {
  const state = getState();

  if (state.modal || selectIsAbbreviationLookupOpen(state)) return;

  const { editor } = state;
  const { render } = editor;
  const actionState = state.actionState;
  const actionTool = actionState.activeTool;

  const key = keyNorm(event);

  let group: any = null;

  if (key && key.length === 1) {
    const currentlyPressedKeys = selectAbbreviationLookupValue(state);
    const isShortcutKey = shortcutKeys.includes(key?.toLowerCase());
    const isTheSameKey = key === currentlyPressedKeys;
    const isAbbreviationLookupShown =
      (!isTheSameKey || !isShortcutKey) && currentlyPressedKeys;
    if (isAbbreviationLookupShown) {
      dispatch(showAbbreviationLookup(event.key));
      clearTimeout(abbreviationLookupTimeoutId);
      abbreviationLookupTimeoutId = undefined;

      const resetAction = SettingsManager.getSettings().selectionTool;
      dispatch(onAction(resetAction));

      event.preventDefault();
      return;
    } else {
      abbreviationLookupTimeoutId = window.setTimeout(() => {
        dispatch(closeAbbreviationLookup());
        abbreviationLookupTimeoutId = undefined;
      }, ABBREVIATION_LOOKUP_TYPING_TIMEOUT);

      dispatch(initAbbreviationLookup(event.key));
    }
  }

  if (key && key.length === 1 && key.match('/')) {
    const hotkeyDialogTypes = {
      atoms: actions['atom-props'].action,
      bonds: actions['bond-props'].action,
    };

    const hoveredItem = getHoveredItem(render.ctab);
    if (!hoveredItem) {
      return;
    }
    const dialogType = Object.keys(hoveredItem)[0];

    if (Object.hasOwn(hotkeyDialogTypes, dialogType)) {
      handleHotkeyOverItem({
        hoveredItem,
        newAction: hotkeyDialogTypes[dialogType],
        editor,
        dispatch,
      });
    }

    event.preventDefault();
  } else if (editor.rotateController.isRotating && key === 'Escape') {
    editor.rotateController.revert();
  } else if ((group = keyNorm.lookup(hotKeys, event)) !== undefined) {
    const index = checkGroupOnTool(group, actionTool); // index currentTool in group || -1
    const groupLength = group !== null ? group.length : 1;
    const newIndex = (index + 1) % groupLength;

    const actName = group[newIndex];
    if (actionState[actName] && actionState[actName].disabled === true) {
      event.preventDefault();
      return;
    }
    // Removing from what should be saved - structure, which was added to paste tool,
    // but not yet rendered on canvas
    removeNotRenderedStruct(actionTool, group, dispatch);

    if (clipArea.actions.indexOf(actName) === -1) {
      let newAction = ['zoom-in', 'zoom-out'].includes(actName)
        ? actions[actName].action()
        : actions[actName].action;
      const hoveredItem = getHoveredItem(render.ctab);
      // check if atom is currently hovered over
      // in this case we do not want to activate the corresponding tool
      // and just insert the atom directly
      if (
        hoveredItem &&
        newAction.tool !== 'select' &&
        newAction.dialog !== 'templates'
      ) {
        newAction = getCurrentAction(group[index]) || newAction;
        handleHotkeyOverItem({
          hoveredItem,
          newAction,
          editor,
          dispatch,
        });
      } else {
        if (newAction.tool === 'select') {
          if (key === 'Escape') {
            newAction = SettingsManager.getSettings().selectionTool;
          } else if (index === -1) {
            newAction = {};
          }
        }
        dispatch(onAction(newAction));
      }

      event.preventDefault();
    } else if (isIE) {
      clipArea.exec(event);
    }
  } else if (isArrowKey(event.key)) {
    moveSelectedItems(editor, event.key, event.shiftKey);
  }
}

function getCurrentAction(prevActName) {
  return actions[prevActName]?.action;
}

function getHoveredItem(
  ctab: Record<string, Map<number, Record<string, unknown>>>,
): Record<string, number> | null {
  const hoveredItem = {};

  for (const ctabItem in ctab) {
    if (Object.keys(hoveredItem).length) {
      break;
    }

    if (!(ctab[ctabItem] instanceof Map)) {
      continue;
    }

    ctab[ctabItem].forEach((item, id) => {
      if (item.hover) {
        hoveredItem[ctabItem] = id;
      }
    });
  }

  return Object.keys(hoveredItem).length ? hoveredItem : null;
}

function checkGroupOnTool(group, actionTool) {
  let index = group.indexOf(actionTool.tool);

  group.forEach((actName, i) => {
    if (isEqual(actions[actName].action, actionTool)) index = i;
  });

  return index;
}

const rxnTextPlain = /\$RXN\n+\s+0\s+0\s+0\n*/;

/* ClipArea */
export function initClipboard(dispatch) {
  const formats = Object.keys(formatProperties).map(
    (format) => formatProperties[format].mime,
  );

  const debAction = debounce(0, (action) => dispatch(onAction(action)));
  const loadStruct = debounce(0, (structStr, opts) =>
    dispatch(load(structStr, opts)),
  );

  return {
    formats,
    focused() {
      const state = global.currentState;
      return !state.modal;
    },
    onLegacyCut() {
      const state = global.currentState;
      const editor = state.editor;
      const data = legacyClipData(editor);
      if (data) debAction({ tool: 'eraser', opts: 1 });
      else editor.selection(null);
      return data;
    },
    async onCut() {
      const ketcherInstance = ketcherProvider.getKetcher();
      const result = await runAsyncAction(async () => {
        const state = global.currentState;
        const editor = state.editor;

        const data = await clipData(editor);
        if (data) debAction({ tool: 'eraser', opts: 1 });
        else editor.selection(null);
        return data;
      }, ketcherInstance.eventBus);
      return result;
    },
    onLegacyCopy() {
      const state = global.currentState;
      const editor = state.editor;
      const data = legacyClipData(editor);
      editor.selection(null);
      return data;
    },
    async onCopy() {
      const ketcherInstance = ketcherProvider.getKetcher();
      const result = await runAsyncAction(async () => {
        const state = global.currentState;
        const editor = state.editor;
        const data = await clipData(editor);
        editor.selection(null);
        return data;
      }, ketcherInstance.eventBus);
      return result;
    },
    async onPaste(data, isSmarts: boolean) {
      const ketcherInstance = ketcherProvider.getKetcher();
      const result = await runAsyncAction(async () => {
        const structStr = await getStructStringFromClipboardData(data);
        if (structStr || !rxnTextPlain.test(data['text/plain'])) {
          if (isSmarts) {
            loadStruct(structStr, {
              fragment: true,
              isPaste: true,
              'input-format': ChemicalMimeType.DaylightSmarts,
            });
          } else {
            loadStruct(structStr, { fragment: true, isPaste: true });
          }
        }
      }, ketcherInstance.eventBus);
      return result;
    },
    onLegacyPaste(data, isSmarts: boolean) {
      const structStr =
        data[ChemicalMimeType.KET] ||
        data[ChemicalMimeType.Mol] ||
        data[ChemicalMimeType.Rxn] ||
        data['text/plain'];

      if (structStr || !rxnTextPlain.test(data['text/plain'])) {
        if (isSmarts) {
          loadStruct(structStr, {
            fragment: true,
            isPaste: true,
            'input-format': ChemicalMimeType.DaylightSmarts,
          });
        } else {
          loadStruct(structStr, { fragment: true, isPaste: true });
        }
      }
    },
  };
}

async function safelyGetMimeType(
  clipboardItem: ClipboardItem,
  mimeType: string,
) {
  try {
    const result = await clipboardItem.getType(mimeType);
    return result;
  } catch {
    return '';
  }
}

async function getStructStringFromClipboardData(
  data: ClipboardItem[],
): Promise<string> {
  const clipboardItem = data[0];

  if (clipboardItem instanceof ClipboardItem) {
    const structStr =
      (await safelyGetMimeType(clipboardItem, `web ${ChemicalMimeType.KET}`)) ||
      (await safelyGetMimeType(clipboardItem, `web ${ChemicalMimeType.Mol}`)) ||
      (await safelyGetMimeType(clipboardItem, `web ${ChemicalMimeType.Rxn}`)) ||
      (await safelyGetMimeType(clipboardItem, 'text/plain'));
    return structStr === '' ? '' : structStr.text();
  } else {
    return (
      data[ChemicalMimeType.KET] ||
      data[ChemicalMimeType.Mol] ||
      data[ChemicalMimeType.Rxn] ||
      data['text/plain']
    );
  }
}

function isAbleToCopy(editor: Editor): boolean {
  const struct = editor.structSelected();
  const errorHandler = editor.errorHandler;

  if (struct.isBlank()) {
    return false;
  }
  const simpleObjectOrText = Boolean(
    struct.simpleObjects.size || struct.texts.size,
  );
  if (simpleObjectOrText && isIE && errorHandler) {
    errorHandler(
      'The structure you are trying to copy contains Simple object or/and Text object.' +
        'To copy Simple object or Text object in Internet Explorer try "Copy as KET" button',
    );
    return false;
  }

  return true;
}

async function clipData(editor: Editor) {
  if (!isAbleToCopy(editor)) {
    return null;
  }

  const res = {};
  const struct = editor.structSelected();
  const errorHandler = editor.errorHandler;

  try {
    const serializer = new KetSerializer();
    const ket = serializer.serialize(struct);
    const ketcherInstance = ketcherProvider.getKetcher();

    const data = await getStructure(
      SupportedFormat.molAuto,
      ketcherInstance.formatterFactory,
      struct,
    );

    res[ChemicalMimeType.KET] = ket;

    const type = struct.isReaction
      ? ChemicalMimeType.Mol
      : ChemicalMimeType.Rxn;

    res['text/plain'] = data;
    res[type] = data;

    return res;
  } catch (e: any) {
    KetcherLogger.error('hotkeys.ts::clipData', e);
    errorHandler && errorHandler(e.message);
  }

  return null;
}

function legacyClipData(editor: Editor) {
  if (!isAbleToCopy(editor)) {
    return null;
  }

  const res = {};
  const struct = editor.structSelected();
  const errorHandler = editor.errorHandler;
  const molSerializer = new MolSerializer();
  try {
    const serializer = new KetSerializer();
    const ket = serializer.serialize(struct);
    res[ChemicalMimeType.KET] = ket;

    const type = struct.isReaction
      ? ChemicalMimeType.Mol
      : ChemicalMimeType.Rxn;
    const data = molSerializer.serialize(struct);
    res['text/plain'] = data;
    res[type] = data;

    return res;
  } catch (e: any) {
    KetcherLogger.error('hotkeys.ts::legacyClipData', e);
    errorHandler && errorHandler(e.message);
  }

  return null;
}
