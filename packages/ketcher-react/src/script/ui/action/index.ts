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

import atoms from './atoms';
import copyAs from './copyAs';
import copyImageToClipboard from './copyImageToClipboard';
import debug from './debug';
import { exec } from '../component/cliparea/cliparea';
import isHidden from './isHidden';
import server from './server';
import templates from './templates';
import tools from './tools';
import zoom from './zoom';
import help from './help';
import functionalGroups from './functionalGroups';
import fullscreen from './fullscreen';
import { removeStructAction, openInfoModal } from '../state/shared';
import type { Tools, UiAction } from './action.types';
import type Editor from '../../editor/Editor';

export * from './action.types';

const disableIfViewOnly = (editor: Editor): boolean =>
  !!editor.render.options.viewOnlyMode;

const updateConfigItem = (item: UiAction): UiAction => {
  if (typeof item.disabled === 'boolean' || item.enabledInViewOnly === true) {
    return item;
  } else if (typeof item.disabled === 'function') {
    const originalDisabled = item.disabled;
    return {
      ...item,
      disabled: (...props) =>
        disableIfViewOnly(props[0]) || originalDisabled(...props),
    };
  } else {
    return {
      ...item,
      disabled: disableIfViewOnly,
    };
  }
};

const config: Record<string, UiAction> = {
  clear: {
    shortcut: ['Mod+Delete', 'Mod+Backspace'],
    title: 'toolbar:menu.clear',
    action: {
      thunk: (dispatch, getState) => {
        const editor = getState().editor;

        dispatch(removeStructAction());

        if (!editor.struct().isBlank()) editor.struct(null);
      },
    },
    disabled: (editor) => editor.isMonomerCreationWizardActive,
    hidden: (options) => isHidden(options, 'clear'),
  },
  open: {
    shortcut: 'Mod+o',
    title: 'toolbar:menu.open',
    enabledInViewOnly: true,
    action: { dialog: 'open' },
    disabled: (editor) => editor.isMonomerCreationWizardActive,
    hidden: (options) => isHidden(options, 'open'),
  },
  save: {
    shortcut: 'Mod+s',
    title: 'toolbar:menu.save',
    enabledInViewOnly: true,
    action: { dialog: 'save' },
    disabled: (editor) => editor.isMonomerCreationWizardActive,
    hidden: (options) => isHidden(options, 'save'),
  },
  'atom-props': {
    title: 'toolbar:menu.atomProps',
    action: { dialog: 'atomProps' },
    hidden: (options) => isHidden(options, 'atom-props'),
  },
  'bond-props': {
    title: 'toolbar:menu.bondProps',
    action: { dialog: 'bondProps' },
    hidden: (options) => isHidden(options, 'bond-props'),
  },
  undo: {
    shortcut: 'Mod+z',
    title: 'toolbar:menu.undo',
    action: {
      thunk: (_, getState) => {
        const editor = getState().editor;
        editor.undo();
      },
    },
    disabled: (editor) => editor.historySize().undo === 0,
    hidden: (options) => isHidden(options, 'undo'),
  },
  redo: {
    shortcut: ['Mod+Shift+z', 'Mod+y'],
    title: 'toolbar:menu.redo',
    action: {
      thunk: (_, getState) => {
        const editor = getState().editor;
        editor.redo();
      },
    },
    disabled: (editor) => editor.historySize().redo === 0,
    hidden: (options) => isHidden(options, 'redo'),
  },
  cut: {
    shortcut: 'Mod+x',
    title: 'toolbar:menu.cut',
    action: {
      thunk: (dispatch, _) => {
        const isCutSupported = exec('cut');

        if (!isCutSupported) {
          dispatch(openInfoModal('Cut'));
        }
      },
    },
    disabled: (editor) => !hasSelection(editor),
    hidden: (options) => isHidden(options, 'cut'),
  },
  // This is some dirty trick for `ClipboardControls.tsx` component
  copies: {
    enabledInViewOnly: true,
    action: () => undefined,
    disabled: (editor) => !hasSelection(editor),
    hidden: (options) => isHidden(options, 'copies'),
  },
  copy: {
    shortcut: 'Mod+c',
    enabledInViewOnly: true,
    title: 'toolbar:menu.copy',
    action: {
      thunk: (dispatch, _) => {
        const isCopySupported = exec('copy');

        if (!isCopySupported) {
          dispatch(openInfoModal('Copy'));
        }
      },
    },
    disabled: (editor) => !hasSelection(editor),
    hidden: (options) => isHidden(options, 'copy'),
  },
  'copy-image': {
    shortcut: 'Mod+Shift+f',
    enabledInViewOnly: true,
    title: 'toolbar:menu.copyImage',
    action: () => {
      copyImageToClipboard();
    },
    disabled: (editor) => !hasSelection(editor),
    hidden: (options) => isHidden(options, 'copy-image'),
  },
  'copy-mol': {
    shortcut: 'Mod+Shift+m',
    enabledInViewOnly: true,
    title: 'toolbar:menu.copyMol',
    action: () => {
      copyAs('mol');
    },
    disabled: (editor) => !hasSelection(editor),
    hidden: (options) => isHidden(options, 'copy-mol'),
  },
  'copy-ket': {
    shortcut: 'Mod+Shift+k',
    enabledInViewOnly: true,
    title: 'toolbar:menu.copyKet',
    action: () => {
      copyAs('ket');
    },
    disabled: (editor) => !hasSelection(editor),
    hidden: (options) => isHidden(options, 'copy-ket'),
  },
  paste: {
    shortcut: 'Mod+v',
    title: 'toolbar:menu.paste',
    action: {
      thunk: (dispatch, _) => {
        const isPasteSupported = exec('paste');

        if (!isPasteSupported) {
          dispatch(openInfoModal('Paste'));
        }
      },
    },
    selected: ({ actions }) => actions?.active?.tool === 'paste',
    hidden: (options) => isHidden(options, 'paste'),
  },
  settings: {
    title: 'toolbar:menu.settings',
    action: { dialog: 'settings' },
    disabled: (editor) => editor.isMonomerCreationWizardActive,
    hidden: (options) => isHidden(options, 'settings'),
  },
  about: {
    title: 'toolbar:menu.about',
    enabledInViewOnly: true,
    action: { dialog: 'about' },
    hidden: (options) => isHidden(options, 'about'),
  },
  'reaction-automap': {
    title: 'toolbar:menu.reactionAutomap',
    action: { dialog: 'automap' },
    hidden: (options) => isHidden(options, 'reaction-automap'),
    disabled: (editor, _server, options) =>
      !options.app.server || !editor.struct().hasRxnArrow(),
  },
  'period-table': {
    title: 'toolbar:menu.periodTable',
    action: { dialog: 'period-table' },
    hidden: (options) => isHidden(options, 'period-table'),
  },
  'extended-table': {
    title: 'toolbar:menu.extendedTable',
    action: { dialog: 'extended-table' },
    disabled: (editor) => editor.isMonomerCreationWizardActive,
    hidden: (options) => isHidden(options, 'extended-table'),
  },
  'select-all': {
    title: 'toolbar:menu.selectAll',
    enabledInViewOnly: true,
    shortcut: 'Mod+a',
    action: {
      thunk: (dispatch, getState) => {
        const selectionTool = getState().toolbar.visibleTools.select;
        dispatch({ type: 'ACTION', action: tools[selectionTool].action });
        getState().editor.selection('all');
      },
    },
    hidden: (options) => isHidden(options, 'select-all'),
  },
  'deselect-all': {
    title: 'toolbar:menu.deselectAll',
    enabledInViewOnly: true,
    shortcut: 'Mod+Shift+a',
    action: (editor) => {
      editor.selection(null);
    },
    hidden: (options) => isHidden(options, 'deselect-all'),
  },
  'select-descriptors': {
    title: 'toolbar:menu.selectDescriptors',
    shortcut: 'Mod+d',
    enabledInViewOnly: true,
    action: {
      thunk: (dispatch, getState) => {
        const selectionTool = getState().toolbar.visibleTools.select;
        const editor = getState().editor;
        editor.alignDescriptors();
        editor.selection('descriptors');
        dispatch({ type: 'ACTION', action: tools[selectionTool].action });
      },
    },
    hidden: (options) => isHidden(options, 'select-descriptors'),
  },
  'any-atom': {
    title: 'toolbar:menu.anyAtom',
    action: {
      tool: 'atom',
      opts: {
        label: 'A',
        pseudo: 'A',
        type: 'gen',
      },
    },
    disabled: (editor) => editor.isMonomerCreationWizardActive,
    hidden: (options) => isHidden(options, 'any-atom'),
  },
  'info-modal': {
    title: 'toolbar:menu.errorMessage',
    action: { dialog: 'info-modal' },
    hidden: (options) => isHidden(options, 'info-modal'),
  },
};

const configWithNonViewOnlyActionsDisabled: Tools = Object.entries({
  ...config,
  ...server,
  ...debug,
  ...tools,
  ...atoms,
  ...zoom,
  ...templates,
  ...functionalGroups,
  ...fullscreen,
  ...help,
}).reduce(
  (acc, [key, item]) => ({
    ...acc,
    [key]: updateConfigItem(item as UiAction),
  }),
  {},
) as Tools;

function hasSelection(editor) {
  const selection = editor.selection();
  return (
    selection && // if not only sgroupData selected
    Object.keys(selection).filter((key) => !['sgroupData'].includes(key))
      .length > 0
  );
}

export default configWithNonViewOnlyActionsDisabled;
