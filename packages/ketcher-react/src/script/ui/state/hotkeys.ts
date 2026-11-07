/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
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
import { restorePersistedSelectionTool } from './selectionToolPersistence';

import actions from '../action';
import { isIE } from 'react-device-detect';
import {
  selectAbbreviationLookupValue,
  isAbbreviationLookupOpen,
} from './abbreviationLookup/selectors';
import {
  closeAbbreviationLookup,
  initAbbreviationLookup,
  showAbbreviationLookup,
} from './abbreviationLookup';
import { isArrowKey, moveSelectedItems } from './moveSelectedItems';
import { handleHotkeyOverItem } from './handleHotkeysOverItem';

let keydownListener: ((event: KeyboardEvent) => void) | null = null;
const affectedTools = new Set(['paste', 'template']);
const zoomActionNames = new Set(['zoom-in', 'zoom-out']);

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

function removeNotRenderedStruct(actionTool, group, dispatch) {
  if (affectedTools.has(actionTool.tool) && group?.includes('save')) {
    dispatch(removeStructAction());
  }
}

let abbreviationLookupTimeoutId: number | undefined;
const ABBREVIATION_LOOKUP_TYPING_TIMEOUT = 1000;
const shortcutKeys = new Set([
  '0',
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
]);

function shouldIgnoreKeyEvent(state, event): boolean {
  if (globalThis.isPolymerEditorTurnedOn) {
    return true;
  }
  if (state.modal || isAbbreviationLookupOpen(state)) {
    return true;
  }
  // TODO: It is done to intercept hotkeys when editing inputs in monomer creation wizard
  // It targets plain inputs only, ideally it has to be incorporated with ClipArea functionality
  return isEditableInputTarget(event.target);
}

function shouldShowAbbreviationLookup(key: string, state): boolean {
  const currentlyPressedKeys = selectAbbreviationLookupValue(state);
  const isShortcutKey = shortcutKeys.has(key.toLowerCase());
  const isTheSameKey = key.toLowerCase() === currentlyPressedKeys;
  return Boolean(currentlyPressedKeys && (!isTheSameKey || !isShortcutKey));
}

function handleAbbreviationLookup(key: string, state, dispatch, event) {
  if (shouldShowAbbreviationLookup(key, state)) {
    dispatch(showAbbreviationLookup(event.key));
    clearTimeout(abbreviationLookupTimeoutId);
    abbreviationLookupTimeoutId = undefined;

    const resetAction = restorePersistedSelectionTool(
      SettingsManager.getSelectionTool('micro'),
    );
    dispatch(onAction(resetAction));

    event.preventDefault();
    return true;
  }

  abbreviationLookupTimeoutId = globalThis.window.setTimeout(() => {
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
    actionState[actName]?.disabled === true ||
    actionState[actName]?.hidden === true
  );
}

function getNextAction(actName) {
  return zoomActionNames.has(actName)
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
    return restorePersistedSelectionTool(
      SettingsManager.getSelectionTool('micro'),
    );
  }
  if (index === -1) {
    return {};
  }
  return newAction;
}

// While hovering a bond, cycling through a shared shortcut (e.g. '1' for
// single/up/down/updown) must advance from the bond's own current type/stereo,
// not from the active toolbar tool (which doesn't change just from hovering,
// so re-pressing the key would otherwise always land on the same entry) (#3705).
function getNextBondTypeAction(hoveredItem, group, render) {
  const hoveredBondId = hoveredItem.bonds;
  if (hoveredBondId === undefined) return null;

  const bond = render.ctab.bonds.get(hoveredBondId)?.b;
  if (!bond) return null;

  const currentIndex = group.findIndex((actName) => {
    const options = actions[actName]?.action?.opts;
    return options?.type === bond.type && options?.stereo === bond.stereo;
  });

  return getNextAction(group[(currentIndex + 1) % group.length]);
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
  const groupLength = group === null ? 1 : group.length;
  const newIndex = (index + 1) % groupLength;
  const actName = group[newIndex];

  if (isActionDisabledOrHidden(actionState, actName)) {
    event.preventDefault();
    return;
  }

  if (actName === 'undo' || actName === 'redo') {
    // A history entry can switch editors while this key event is still bubbling.
    event.stopImmediatePropagation();
  }

  removeNotRenderedStruct(actionTool, group, dispatch);

  if (!clipArea.actions.includes(actName)) {
    let newAction = getNextAction(actName);
    const hoveredItem = getHoveredItem(render.ctab);
    const { atoms, bonds } = editor.selection() ?? {};
    const hasSelection = Boolean(atoms?.length) || Boolean(bonds?.length);

    // For erase action, prioritize selected items over hovered item
    if (actName === 'erase' && hasSelection) {
      dispatch(onAction(newAction));
    } else if (shouldHandleItemDirectly(hoveredItem, newAction)) {
      newAction =
        getNextBondTypeAction(hoveredItem, group, render) ||
        getCurrentAction(group[index]) ||
        newAction;
      handleHotkeyOverItem({
        hoveredItem,
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
    clipArea.canExecuteClipboardCommand(event);
  }
}

/*
HotKeys
*/
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
  const hoveredItem = getHoveredItem(render.ctab);

  if (!hoveredItem && key?.length === 1) {
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

  if (key === 'Escape' && editor.rotateController.isRotating) {
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

function getCurrentAction(previousActName) {
  return actions[previousActName]?.action;
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

  group.forEach((actName, index_) => {
    if (isEqual(actions[actName].action, actionTool)) index = index_;
  });

  return index;
}

const rxnTextPlain = /\$RXN\n+\s+0\s+0\s+0\n*/;

/*
ClipArea
*/
export function initClipboard(dispatch, getState) {
  const formats = Object.keys(formatProperties).map(
    (format) => formatProperties[format].mime,
  );

  const debAction = debounce(0, (action) => dispatch(onAction(action)));
  const loadStruct = debounce(0, (structString, options) =>
    dispatch(load(structString, options)),
  );

  return {
    formats,
    focused() {
      const state = getState();
      return !state.modal && !globalThis.isPolymerEditorTurnedOn;
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
        const structString = await getStructStringFromClipboardData(data);
        if (structString || !rxnTextPlain.test(data['text/plain'])) {
          const options = isSmarts
            ? {
                fragment: true,
                isPaste: true,
                'input-format': ChemicalMimeType.DaylightSmarts,
              }
            : { fragment: true, isPaste: true };
          await dispatch(load(structString, options));
        }
      }, ketcherInstance.eventBus);
      return result;
    },
    onLegacyPaste(data, isSmarts: boolean) {
      const structString =
        data[ChemicalMimeType.KET] ||
        data[ChemicalMimeType.Mol] ||
        data[ChemicalMimeType.Rxn] ||
        data['text/plain'];

      if (structString || !rxnTextPlain.test(data['text/plain'])) {
        if (isSmarts) {
          loadStruct(structString, {
            fragment: true,
            isPaste: true,
            'input-format': ChemicalMimeType.DaylightSmarts,
          });
        } else {
          loadStruct(structString, { fragment: true, isPaste: true });
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
  const hasSimpleObjectOrText = Boolean(
    struct.simpleObjects.size || struct.texts.size,
  );
  if (hasSimpleObjectOrText && isIE && errorHandler) {
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

  const resource = {};
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

    resource[ChemicalMimeType.KET] = ket;

    const type = struct.isReaction
      ? ChemicalMimeType.Mol
      : ChemicalMimeType.Rxn;

    resource['text/plain'] = data;
    resource[type] = data;

    return resource;
  } catch (error) {
    KetcherLogger.error('hotkeys.ts::clipData', error);
    if (errorHandler) {
      errorHandler(error instanceof Error ? error.message : String(error));
    }
  }

  return null;
}

function legacyClipData(editor: Editor) {
  if (!isAbleToCopy(editor)) {
    return null;
  }

  const resource = {};
  const struct = editor.structSelected();
  const errorHandler = editor.errorHandler;
  const molSerializer = new MolSerializer();
  try {
    const serializer = new KetSerializer();
    const ket = serializer.serialize(struct);
    resource[ChemicalMimeType.KET] = ket;

    const type = struct.isReaction
      ? ChemicalMimeType.Mol
      : ChemicalMimeType.Rxn;
    const data = molSerializer.serialize(struct);
    resource['text/plain'] = data;
    resource[type] = data;

    return resource;
  } catch (error) {
    KetcherLogger.error('hotkeys.ts::legacyClipData', error);
    if (errorHandler) {
      errorHandler(error instanceof Error ? error.message : String(error));
    }
  }

  return null;
}
