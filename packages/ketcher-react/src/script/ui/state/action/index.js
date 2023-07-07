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

import { isEmpty, isEqual, pickBy } from 'lodash/fp';

import { SettingsManager } from '../../utils/settingsManager';
import actions from '../../action';

function execute(activeTool, { action, editor, server, options }) {
  if (action.tool) {
    if (editor.tool(action.tool, action.opts)) {
      return action;
    }
  } else if (typeof action === 'function') {
    action(editor, server, options);
  } else {
    console.info('no action');
  }
  return activeTool;
}

function selected(actObj, activeTool, { editor, server }) {
  if (typeof actObj.selected === 'function')
    return actObj.selected(editor, server);
  else if (actObj.action && actObj.action.tool)
    return isEqual(activeTool, actObj.action);
  return false;
}

function disabled(actObj, { editor, server, options }) {
  if (typeof actObj.disabled === 'function')
    return actObj.disabled(editor, server, options);
  return false;
}

function hidden(actObj, { options }) {
  if (typeof actObj.hidden === 'function') return actObj.hidden(options);
  return false;
}

function status(actionName, activeTool, params) {
  const actObj = actions[actionName];
  return pickBy((x) => x, {
    selected: selected(actObj, activeTool, params),
    disabled: disabled(actObj, params),
    hidden: hidden(actObj, params),
  });
}

// TODO need a refactoring for this reducer since it uses (probably unintentionally falling through switch-case)
// F.e. when it gets action: INIT it will call all cases below - INIT+ACTION+UPDATE
/* eslint-disable no-fallthrough */
export default function (state = null, { type, action, ...params }) {
  let activeTool;
  switch (type) {
    case 'INIT': {
      const savedSelectedTool = SettingsManager.selectionTool;
      action = savedSelectedTool || actions['select-rectangle'].action;
    }

    case 'ACTION': {
      activeTool = execute(state && state.activeTool, {
        ...params,
        action,
      });
      if (activeTool.tool === 'select') {
        SettingsManager.selectionTool = activeTool;
      }
    }

    case 'UPDATE':
      return Object.keys(actions).reduce(
        (res, actionName) => {
          const value = status(actionName, res.activeTool, params);
          if (!isEmpty(value)) res[actionName] = value;
          return res;
        },
        { activeTool: activeTool || state.activeTool },
      );

    default:
      return state;
  }
}
/* eslint-enable no-fallthrough */
