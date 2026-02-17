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
import { SettingsManager } from 'ketcher-core';
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
  else if (actObj.action?.tool) return isEqual(activeTool, actObj.action);
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

function buildStateWithStatuses(activeTool, params) {
  return Object.keys(actions).reduce(
    (res, actionName) => {
      const value = status(actionName, res.activeTool, params);
      if (!isEmpty(value)) res[actionName] = value;
      return res;
    },
    { activeTool },
  );
}

export default function (state = null, { type, action, ...params }) {
  let activeTool;
  switch (type) {
    case 'INIT': {
      const savedSelectedTool = SettingsManager.selectionTool;
      action = savedSelectedTool || actions['select-rectangle'].action;
      activeTool = execute(state?.activeTool, {
        ...params,
        action,
      });
      if (activeTool?.tool === 'select') {
        SettingsManager.selectionTool = activeTool;
      }
      return buildStateWithStatuses(activeTool || state?.activeTool, params);
    }

    case 'ACTION': {
      activeTool = execute(state?.activeTool, {
        ...params,
        action,
      });
      if (activeTool?.tool === 'select') {
        SettingsManager.selectionTool = activeTool;
      }
      return buildStateWithStatuses(activeTool || state?.activeTool, params);
    }

    case 'UPDATE':
      return buildStateWithStatuses(activeTool || state?.activeTool, params);

    default:
      return state;
  }
}
