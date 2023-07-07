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

import { TopToolbar } from './TopToolbar';

import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { onAction } from '../../../state';
import action from 'src/script/ui/action/index.js';
import { shortcutStr } from '../shortcutStr';
import { removeStructAction } from 'src/script/ui/state/shared';
import { createSelector } from 'reselect';

const getActionState = (state) => state.actionState || {};

const disabledButtonsSelector = createSelector(
  [getActionState],
  (actionState) =>
    Object.keys(actionState).reduce((acc: string[], item) => {
      if (actionState[item]?.disabled) {
        acc.push(item);
      }
      return acc;
    }, []),
);
const hiddenButtonsSelector = createSelector([getActionState], (actionState) =>
  Object.keys(actionState).reduce((acc: string[], item) => {
    if (actionState[item]?.hidden) {
      acc.push(item);
    }
    return acc;
  }, []),
);

const disableableButtons = [
  'layout',
  'clean',
  'arom',
  'dearom',
  'cip',
  'enhanced-stereo',
];

const shortcuts = Object.keys(action).reduce((acc, key) => {
  if (action[key]?.shortcut) {
    const shortcut = action[key].shortcut;
    const processedShortcut = shortcutStr(shortcut);
    acc[key] = processedShortcut;
  }
  return acc;
}, {});

const mapStateToProps = (state: any) => {
  return {
    currentZoom: Math.round(state.actionState?.zoom?.selected * 100),
    disabledButtons: disabledButtonsSelector(state),
    hiddenButtons: hiddenButtonsSelector(state),
    shortcuts,
    status: state.actionState || {},
    opened: state.toolbar.opened,
    indigoVerification: state.requestsStatuses.indigoVerification,
    disableableButtons,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  const dispatchAction = (actionName) => {
    dispatch(onAction(action[actionName].action));
  };

  return {
    onClear: () => dispatchAction('clear'),
    onFileOpen: () => dispatchAction('open'),
    onSave: () => {
      dispatch(removeStructAction());
      dispatchAction('save');
    },
    onUndo: () => dispatchAction('undo'),
    onRedo: () => dispatchAction('redo'),
    onCopy: () => dispatchAction('copy'),
    onCopyMol: () => dispatchAction('copy-mol'),
    onCopyKet: () => dispatchAction('copy-ket'),
    onCopyImage: () => dispatchAction('copy-image'),
    onCut: () => dispatchAction('cut'),
    onPaste: () => dispatchAction('paste'),
    onZoomIn: () => dispatchAction('zoom-in'),
    onZoomOut: () => dispatchAction('zoom-out'),
    onZoom: (zoomValue: number) =>
      dispatch(onAction((editor) => editor.zoom(zoomValue / 100))),
    onSettingsOpen: () => dispatchAction('settings'),
    onLayout: () => dispatchAction('layout'),
    onClean: () => dispatchAction('clean'),
    onAromatize: () => dispatchAction('arom'),
    onDearomatize: () => dispatchAction('dearom'),
    onCalculate: () => dispatchAction('cip'),
    onCheck: () => dispatchAction('check'),
    onAnalyse: () => dispatchAction('analyse'),
    onMiew: () => dispatchAction('miew'),
    onAction: (action) => dispatch(onAction(action)),
    onOpen: (menuName, isSelected) =>
      dispatch({
        type: 'OPENED',
        data: { menuName, isSelected },
      }),
    onFullscreen: () => dispatchAction('fullscreen'),
    onHelp: () => dispatchAction('help'),
    onAbout: () => dispatchAction('about'),
  };
};

const TopToolbarContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(TopToolbar);

export { TopToolbarContainer };
