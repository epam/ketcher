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
import actions, { UiAction, UiActionAction } from '../../action';
import Editor from '../../../editor/Editor';

type ActionParams = {
  editor: Editor;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  server: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options: any;
};

type ExecuteParams = ActionParams & {
  action: UiActionAction;
};

type ActionStatus = {
  selected?: boolean;
  disabled?: boolean;
  hidden?: boolean;
};

type ActionState = {
  activeTool: UiActionAction | null | undefined;
  [actionName: string]: ActionStatus | UiActionAction | null | undefined;
};

type ReducerAction = {
  type: string;
  action?: UiActionAction;
} & Partial<ActionParams>;

function execute(
  activeTool: UiActionAction | null | undefined,
  { action, editor, server, options }: ExecuteParams,
): UiActionAction | null | undefined {
  if (typeof action !== 'function' && action.tool) {
    if (editor.tool(action.tool, action.opts)) {
      return action;
    }
  } else if (typeof action === 'function') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (action as (editor: Editor, server: any, options: any) => void)(
      editor,
      server,
      options,
    );
  } else {
    console.info('no action');
  }
  return activeTool;
}

function selected(
  actObj: UiAction,
  activeTool: UiActionAction | null | undefined,
  { editor, server }: Pick<ActionParams, 'editor' | 'server'>,
): boolean {
  if (typeof actObj.selected === 'function')
    return actObj.selected(editor, server);
  else if (typeof actObj.action !== 'function' && actObj.action?.tool)
    return isEqual(activeTool, actObj.action);
  return false;
}

function disabled(
  actObj: UiAction,
  { editor, server, options }: ActionParams,
): boolean {
  if (typeof actObj.disabled === 'function')
    return actObj.disabled(editor, server, options);
  return false;
}

function hidden(
  actObj: UiAction,
  { options }: Pick<ActionParams, 'options'>,
): boolean {
  if (typeof actObj.hidden === 'function') return actObj.hidden(options);
  return false;
}

function status(
  actionName: string,
  activeTool: UiActionAction | null | undefined,
  params: ActionParams,
): ActionStatus {
  const actObj = actions[actionName];
  return pickBy((x) => x, {
    selected: selected(actObj, activeTool, params),
    disabled: disabled(actObj, params),
    hidden: hidden(actObj, params),
  });
}

/**
 * Builds the state object with action statuses for all actions
 * @param activeTool - The currently active tool
 * @param params - Additional parameters for status computation
 * @returns State object containing active tool and action statuses
 */
function buildStateWithStatuses(
  activeTool: UiActionAction | null | undefined,
  params: ActionParams,
): ActionState {
  return Object.keys(actions).reduce(
    (res, actionName) => {
      const value = status(actionName, res.activeTool, params);
      if (!isEmpty(value)) res[actionName] = value;
      return res;
    },
    { activeTool } as ActionState,
  );
}

export default function (
  state: ActionState | null = null,
  { type, action, ...params }: ReducerAction,
): ActionState | null {
  let activeTool: UiActionAction | null | undefined;
  switch (type) {
    case 'INIT': {
      const savedSelectedTool = SettingsManager.selectionTool;
      const resolvedAction =
        savedSelectedTool || actions['select-rectangle'].action;
      activeTool = execute(state?.activeTool, {
        ...(params as ActionParams),
        action: resolvedAction,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((activeTool as any)?.tool === 'select') {
        SettingsManager.selectionTool = activeTool;
      }
      return buildStateWithStatuses(
        activeTool || state?.activeTool,
        params as ActionParams,
      );
    }

    case 'ACTION': {
      activeTool = execute(state?.activeTool, {
        ...(params as ActionParams),
        action: action as UiActionAction,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((activeTool as any)?.tool === 'select') {
        SettingsManager.selectionTool = activeTool;
      }
      return buildStateWithStatuses(
        activeTool || state?.activeTool,
        params as ActionParams,
      );
    }

    case 'UPDATE':
      return buildStateWithStatuses(
        activeTool || state?.activeTool,
        params as ActionParams,
      );

    default:
      return state;
  }
}
