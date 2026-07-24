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
  type Editor,
  KetSerializer,
  formatProperties,
  ChemicalMimeType,
  KetcherLogger,
  ketcherProvider,
  SupportedFormat,
  getStructure,
  isEditableInputTarget,
  MolSerializer,
  runAsyncAction,
  SettingsManager,
  keyNorm,
  initHotKeys,
  getStructStringFromClipboardData,
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

let keydownListener: ((event: KeyboardEvent) => void) | null = null;

export function initKeydownListener(element) {
  return function (dispatch, getState) {
    const hotKeys = initHotKeys(actions);

    keydownListener = (event) => keyHandle(dispatch, getState, hotKeys, event);
    element.addEventListener('keydown', keydownListener);
  };
}

export function removeKeydownListener(element) {
  return function () {
    if (keydownListener) {
      element.removeEventListener('keydown', keydownListener);
    }
  };
}

function removeNotRenderedStruct(actionTool, group, newAction, dispatch) {
  const affectedTools = ['paste', 'template'];
  const isPreviewTool = affectedTools.includes(actionTool.tool);
  const isSaveAction = group?.includes('save');
  const shouldResetPreviewTool =
    Boolean(newAction?.tool) && !affectedTools.includes(newAction.tool);

  if (isPreviewTool && (isSaveAction || shouldResetPreviewTool)) {
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

function shouldIgnoreKeyEvent(state, event): boolean {
  if (state.modal || selectIsAbbreviationLookupOpen(state)) {
    return true;
  }
  // TODO: It is done to intercept hotkeys when editing inputs in monomer creation wizard
  // It targets plain inputs only, ideally it has to be incorporated with ClipArea functionality
  // Ideally x2 – create a common event interception layer for both micro and macro editors
  return isEditableInputTarget(event.target);
}

function shouldShowAbbreviationLookup(key: string, state): boolean {
  const currentlyPressedKeys = selectAbbreviationLookupValue(state);
  const isShortcutKey = shortcutKeys.includes(key.toLowerCase());
  const isTheSameKey = key.toLowerCase() === currentlyPressedKeys;
  return Boolean((!isTheSameKey || !isShortcutKey) && currentlyPressedKeys);
}

function handleAbbreviationLookup(key: string, state, dispatch, event) {
  if (shouldShowAbbreviationLookup(key, state)) {
    dispatch(showAbbreviationLookup(event.key));
    clearTimeout(abbreviationLookupTimeoutId);
    abbreviationLookupTimeoutId = undefined;

    const resetAction = SettingsManager.getSettings().selectionTool;
    dispatch(onAction(resetAction));

    event.preventDefault();
    return true;
  }

  abbreviationLookupTimeoutId = window.setTimeout(() => {
    dispatch(closeAbbreviationLookup());
    abbreviationLookupTimeoutId = undefined;
  }, ABBREVIATION_LOOKUP_TYPING_TIMEOUT);

  dispatch(initAbbreviationLookup(event.key));
  return false;
}

function handleSlashKey(
  hoveredItem: Record<string, number> | null,
  editor,
  dispatch,
  event,
) {
  const hotkeyDialogTypes = {
    atoms: actions['atom-props'].action,
    bonds: actions['bond-props'].action,
  };

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
}

function handleRotateEscape(editor) {
  editor.rotateController.revert();
}

function isActionDisabledOrHidden(actionState, actName): boolean {
  return (
    (actionState[actName] && actionState[actName].disabled === true) ||
    actionState[actName]?.hidden === true
  );
}

function getNextAction(actName) {
  return ['zoom-in', 'zoom-out'].includes(actName)
    ? actions[actName].action()
    : actions[actName].action;
}

function shouldHandleItemDirectly(
  hoveredItem: Record<string, number> | null,
  newAction,
): hoveredItem is Record<string, number> {
  return Boolean(
    hoveredItem &&
      newAction.tool !== 'select' &&
      newAction.dialog !== 'templates',
  );
}

function handleSelectTool(newAction, key: string, index: number) {
  if (key === 'Escape') {
    return SettingsManager.getSettings().selectionTool;
  }
  if (index === -1) {
    return {};
  }
  return newAction;
}

function handleHotkeyGroup(
  group,
  actionTool,
  actionState,
  key: string,
  editor,
  render,
  dispatch,
  event,
) {
  const index = checkGroupOnTool(group, actionTool);
  const groupLength = group !== null ? group.length : 1;
  const newIndex = (index + 1) % groupLength;
  const actName = group[newIndex];

  if (isActionDisabledOrHidden(actionState, actName)) {
    event.preventDefault();
    return;
  }

  if (clipArea.actions.indexOf(actName) === -1) {
    let newAction = getNextAction(actName);
    removeNotRenderedStruct(actionTool, group, newAction, dispatch);

    const hoveredItem =
      getHoveredItem(render.ctab, editor) ?? getHoveredItemFromCursor(editor);
    const resolvedHoveredItem = resolveHoveredItemForAction(
      hoveredItem,
      newAction,
      editor,
    );
    const { atoms, bonds } = editor.selection() ?? {};
    const hasSelection = Boolean(atoms?.length) || Boolean(bonds?.length);

    // For erase action, prioritize selected items over hovered item
    if (actName === 'erase' && hasSelection) {
      dispatch(onAction(newAction));
    } else if (shouldHandleItemDirectly(resolvedHoveredItem, newAction)) {
      newAction = getCurrentAction(group[index]) || newAction;
      handleHotkeyOverItem({
        hoveredItem: resolvedHoveredItem,
        newAction,
        editor,
        dispatch,
      });
    } else {
      if (newAction.tool === 'select') {
        newAction = handleSelectTool(newAction, key, index);
      }
      dispatch(onAction(newAction));
    }

    event.preventDefault();
  } else if (isIE) {
    clipArea.exec(event);
  }
}

/* HotKeys */
function keyHandle(dispatch, getState, hotKeys, event) {
  const state = getState();

  if (shouldIgnoreKeyEvent(state, event)) {
    return;
  }

  const { editor } = state;
  const { render } = editor;
  const actionState = state.actionState;
  const actionTool = actionState.activeTool;
  const key = keyNorm(event);
  const hoveredItem =
    getHoveredItem(render.ctab, editor) ?? getHoveredItemFromCursor(editor);

  if (key && key.length === 1 && !hoveredItem) {
    const abbreviationLookupHandled = handleAbbreviationLookup(
      key,
      state,
      dispatch,
      event,
    );
    if (abbreviationLookupHandled) {
      return;
    }
  }

  if (key === 'Slash') {
    handleSlashKey(hoveredItem, editor, dispatch, event);
    return;
  }

  if (editor.rotateController.isRotating && key === 'Escape') {
    handleRotateEscape(editor);
    return;
  }

  const group = keyNorm.lookup(hotKeys, event);
  if (group !== undefined) {
    handleHotkeyGroup(
      group,
      actionTool,
      actionState,
      key,
      editor,
      render,
      dispatch,
      event,
    );
    return;
  }

  if (isArrowKey(event.key)) {
    moveSelectedItems(editor, event.key, event.shiftKey);
  }
}

function getCurrentAction(prevActName) {
  return actions[prevActName]?.action;
}

function resolveHoveredItemForAction(
  hoveredItem: Record<string, number> | null,
  newAction,
  editor: Editor,
): Record<string, number> | null {
  if (!hoveredItem || newAction?.tool !== 'atom') {
    return hoveredItem;
  }

  const hoveredItemType = Object.keys(hoveredItem)[0];
  if (['atoms', 'sgroups', 'functionalGroups'].includes(hoveredItemType)) {
    return hoveredItem;
  }

  const editorWithCursor = editor as Editor & {
    lastEvent?: Event | null;
    findItem?: (
      event: Event | MouseEvent | { clientX: number; clientY: number },
      maps: Array<string> | null,
      skip?: unknown,
    ) => { id: number; map: string } | null;
  };
  const lastEvent = editorWithCursor.lastEvent;

  if (!(lastEvent instanceof MouseEvent) || !editorWithCursor.findItem) {
    return hoveredItem;
  }

  const atomLikeItem = editorWithCursor.findItem(lastEvent, [
    'atoms',
    'functionalGroups',
    'sgroups',
  ]);

  if (!atomLikeItem) {
    return hoveredItem;
  }

  const normalizedMap =
    atomLikeItem.map === 'functionalGroups' ? 'sgroups' : atomLikeItem.map;

  return { [normalizedMap]: atomLikeItem.id };
}

function getHoveredItemFromCursor(
  editor: Editor,
): Record<string, number> | null {
  const editorWithCursor = editor as Editor & {
    lastEvent?: Event | null;
    findItem?: (
      event: Event | MouseEvent | { clientX: number; clientY: number },
      maps: Array<string> | null,
      skip?: unknown,
    ) => { id: number; map: string } | null;
  };
  const lastEvent = editorWithCursor.lastEvent;

  if (!(lastEvent instanceof MouseEvent) || !editorWithCursor.findItem) {
    return null;
  }

  const cursorItem =
    editorWithCursor.findItem(lastEvent, [
      'atoms',
      'functionalGroups',
      'sgroups',
    ]) ??
    editorWithCursor.findItem(lastEvent, [
      'atoms',
      'bonds',
      'sgroups',
      'functionalGroups',
    ]);

  if (!cursorItem) {
    return null;
  }

  const normalizedMap =
    cursorItem.map === 'functionalGroups' ? 'sgroups' : cursorItem.map;

  return { [normalizedMap]: cursorItem.id };
}

function getHoveredItem(
  ctab: Record<string, Map<number, Record<string, unknown>>>,
  editor: Editor,
): Record<string, number> | null {
  const hoveredItems: Array<{ map: string; id: number }> = [];

  for (const ctabItem in ctab) {
    if (!(ctab[ctabItem] instanceof Map)) {
      continue;
    }

    ctab[ctabItem].forEach((item, id) => {
      if (item.hover) {
        hoveredItems.push({ map: ctabItem, id });
      }
    });
  }

  if (!hoveredItems.length) {
    return null;
  }

  const hoveredItemUnderCursor = getHoveredItemUnderCursor(
    hoveredItems,
    editor,
  );
  if (hoveredItemUnderCursor) {
    return hoveredItemUnderCursor;
  }

  const hoveredAtom = hoveredItems.find((item) => item.map === 'atoms');
  const target = hoveredAtom ?? hoveredItems[0];

  return { [target.map]: target.id };
}

function getHoveredItemUnderCursor(
  hoveredItems: Array<{ map: string; id: number }>,
  editor: Editor,
): Record<string, number> | null {
  const editorWithCursor = editor as Editor & {
    lastEvent?: Event | null;
    findItem?: (
      event: Event | MouseEvent | { clientX: number; clientY: number },
      maps: Array<string> | null,
      skip?: unknown,
    ) => { id: number; map: string } | null;
  };
  const lastEvent = editorWithCursor.lastEvent;

  if (!(lastEvent instanceof MouseEvent) || !editorWithCursor.findItem) {
    return null;
  }

  const itemUnderCursor =
    editorWithCursor.findItem(lastEvent, [
      'atoms',
      'functionalGroups',
      'sgroups',
    ]) ??
    editorWithCursor.findItem(lastEvent, [
      'atoms',
      'bonds',
      'sgroups',
      'functionalGroups',
    ]);

  if (!itemUnderCursor) {
    return null;
  }

  const normalizedMap =
    itemUnderCursor.map === 'functionalGroups'
      ? 'sgroups'
      : itemUnderCursor.map;

  const isHoveredItemUnderCursor = hoveredItems.some(
    (item) => item.map === normalizedMap && item.id === itemUnderCursor.id,
  );

  if (!isHoveredItemUnderCursor) {
    return null;
  }

  return { [normalizedMap]: itemUnderCursor.id };
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
export function initClipboard(dispatch, getState) {
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
      const state = getState();
      return !state.modal;
    },
    onLegacyCopy() {
      const state = getState();
      const editor = state.editor;
      const data = legacyClipData(editor);
      editor.selection(null);
      return data;
    },
    onLegacyCut() {
      const state = getState();
      const editor = state.editor;
      const data = legacyClipData(editor);
      if (data) debAction({ tool: 'eraser', opts: 1 });
      else editor.selection(null);
      return data;
    },
    async onCut() {
      const state = getState();
      const ketcherInstance = ketcherProvider.getKetcher(
        state.editor.ketcherId,
      );
      const result = await runAsyncAction(async () => {
        const editor = getState().editor;

        const data = await clipData(editor);
        if (data) debAction({ tool: 'eraser', opts: 1 });
        else editor.selection(null);
        return data;
      }, ketcherInstance.eventBus);
      return result;
    },
    async onCopy() {
      const state = getState();
      const ketcherInstance = ketcherProvider.getKetcher(
        state.editor.ketcherId,
      );
      const result = await runAsyncAction(async () => {
        const editor = getState().editor;
        const data = await clipData(editor);
        editor.selection(null);
        return data;
      }, ketcherInstance.eventBus);
      return result;
    },
    async onPaste(data, isSmarts: boolean) {
      const state = getState();
      const ketcherInstance = ketcherProvider.getKetcher(
        state.editor.ketcherId,
      );
      const result = await runAsyncAction(async () => {
        const structStr = await getStructStringFromClipboardData(data);
        if (structStr || !rxnTextPlain.test(data['text/plain'])) {
          const opts = isSmarts
            ? {
                fragment: true,
                isPaste: true,
                'input-format': ChemicalMimeType.DaylightSmarts,
              }
            : { fragment: true, isPaste: true };
          await dispatch(load(structStr, opts));
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
    const ketcherInstance = ketcherProvider.getKetcher(editor.ketcherId);

    const data = await getStructure(
      editor.ketcherId,
      ketcherInstance.formatterFactory,
      struct,
      SupportedFormat.molAuto,
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
