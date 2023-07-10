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

import atoms from './atoms'
import copyAs from './copyAs'
import copyImageToClipboard from './copyImageToClipboard'
import debug from './debug'
import { exec } from '../component/cliparea/cliparea'
import isHidden from './isHidden'
import server from './server'
import templates from './templates'
import tools from './tools'
import zoom from './zoom'
import help from './help'
import functionalGroups from './functionalGroups'
import fullscreen from './fullscreen'
import { removeStructAction, openInfoModal } from '../state/shared'

export * from './action.types';

const config = {
  clear: {
    shortcut: 'Mod+Delete',
    title: 'Clear Canvas',
    action: {
      thunk: (dispatch, getState) => {
        const editor = getState().editor;

        dispatch(removeStructAction());

        if (!editor.struct().isBlank()) editor.struct(null);
      },
    },
    hidden: (options) => isHidden(options, 'clear'),
  },
  open: {
    shortcut: 'Mod+o',
    title: 'Open…',
    action: { dialog: 'open' },
    hidden: (options) => isHidden(options, 'open'),
  },
  save: {
    shortcut: 'Mod+s',
    title: 'Save As…',
    action: { dialog: 'save' },
    hidden: (options) => isHidden(options, 'save'),
  },
  'atom-props': {
    title: 'Atom Properties',
    action: { dialog: 'atomProps' },
    hidden: (options) => isHidden(options, 'atom-props'),
  },
  'bond-props': {
    title: 'Bond Properties',
    action: { dialog: 'bondProps' },
    hidden: (options) => isHidden(options, 'bond-props'),
  },
  undo: {
    shortcut: 'Mod+z',
    title: 'Undo',
    action: (editor) => {
      editor.undo();
    },
    disabled: (editor) => editor.historySize().undo === 0,
    hidden: (options) => isHidden(options, 'undo'),
  },
  redo: {
    shortcut: ['Mod+Shift+z', 'Mod+y'],
    title: 'Redo',
    action: (editor) => {
      editor.redo();
    },
    disabled: (editor) => editor.historySize().redo === 0,
    hidden: (options) => isHidden(options, 'redo'),
  },
  cut: {
    shortcut: 'Mod+x',
    title: 'Cut',
    action: {
      thunk: (dispatch, _) => {
        const isCutSupported = exec('cut')

        if (!isCutSupported) {
          dispatch(openInfoModal('Cut'))
        }
      }
    },
    disabled: (editor) => !hasSelection(editor),
    hidden: (options) => isHidden(options, 'cut'),
  },
  copies: {
    disabled: (editor) => !hasSelection(editor),
    hidden: (options) => isHidden(options, 'copies'),
  },
  copy: {
    shortcut: 'Mod+c',
    title: 'Copy',
    action: {
      thunk: (dispatch, _) => {
        const isCopySupported = exec('copy')

        if (!isCopySupported) {
          dispatch(openInfoModal('Copy'))
        }
      }
    },
    disabled: (editor) => !hasSelection(editor),
    hidden: (options) => isHidden(options, 'copy'),
  },
  'copy-image': {
    shortcut: 'Mod+Shift+f',
    title: 'Copy Image',
    action: () => {
      copyImageToClipboard();
    },
    disabled: (editor) => !hasSelection(editor),
    hidden: (options) => isHidden(options, 'copy-image'),
  },
  'copy-mol': {
    shortcut: 'Mod+m',
    title: 'Copy as MOL',
    action: () => {
      copyAs('mol');
    },
    disabled: (editor) => !hasSelection(editor),
    hidden: (options) => isHidden(options, 'copy-mol'),
  },
  'copy-ket': {
    shortcut: 'Mod+Shift+k',
    title: 'Copy as KET',
    action: () => {
      copyAs('ket');
    },
    disabled: (editor) => !hasSelection(editor),
    hidden: (options) => isHidden(options, 'copy-ket'),
  },
  paste: {
    shortcut: 'Mod+v',
    title: 'Paste',
    action: {
      thunk: (dispatch, _) => {
        const isPasteSupported = exec('paste')

        if (!isPasteSupported) {
          dispatch(openInfoModal('Paste'))
        }
      }
    },
    selected: ({ actions }) =>
      actions && // TMP
      actions.active &&
      actions.active.tool === 'paste',
    hidden: (options) => isHidden(options, 'paste'),
  },
  settings: {
    title: 'Settings',
    action: { dialog: 'settings' },
    hidden: (options) => isHidden(options, 'settings'),
  },
  about: {
    title: 'About',
    action: { dialog: 'about' },
    hidden: (options) => isHidden(options, 'about'),
  },
  'reaction-automap': {
    title: 'Reaction Auto-Mapping Tool',
    action: { dialog: 'automap' },
    hidden: (options) => isHidden(options, 'reaction-automap'),
    disabled: (editor, server, options) =>
      !options.app.server || !editor.struct().hasRxnArrow(),
  },
  'period-table': {
    title: 'Periodic Table',
    action: { dialog: 'period-table' },
    hidden: (options) => isHidden(options, 'period-table'),
  },
  'extended-table': {
    title: 'Extended Table',
    action: { dialog: 'extended-table' },
    hidden: (options) => isHidden(options, 'extended-table'),
  },
  'select-all': {
    title: 'Select All',
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
    title: 'Deselect All',
    shortcut: 'Mod+Shift+a',
    action: (editor) => {
      editor.selection(null);
    },
    hidden: (options) => isHidden(options, 'deselect-all'),
  },
  'select-descriptors': {
    title: 'Select descriptors',
    shortcut: 'Mod+d',
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
    title: 'Any atom',
    action: {
      tool: 'atom',
      opts: {
        label: 'A',
        pseudo: 'A',
        type: 'gen',
      },
    },
    hidden: (options) => isHidden(options, 'any-atom'),
  },
  'info-modal': {
    title: 'Error message',
    action: { dialog: 'info-modal' },
    hidden: (options) => isHidden(options, 'info-modal')
  },
  ...server,
  ...debug,
  ...tools,
  ...atoms,
  ...zoom,
  ...templates,
  ...functionalGroups,
  ...fullscreen,
  ...help,
};

function hasSelection(editor) {
  const selection = editor.selection();
  return (
    selection && // if not only sgroupData selected
    Object.keys(selection).filter((key) => !['sgroupData'].includes(key))
      .length > 0
  );
}

export default config
