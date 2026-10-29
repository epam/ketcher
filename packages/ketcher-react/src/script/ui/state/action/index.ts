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

import { isEmpty, isEqual, pickBy } from 'lodash/fp';
import { type Struct, SettingsManager } from 'ketcher-core';
import actions, { type UiAction, type UiActionAction } from '../../action';
import type Editor from '../../../editor/Editor';
import {
  normalizeSelectionToolForPersistence,
  restorePersistedSelectionTool,
} from '../selectionToolPersistence';

type ActionParameters = {
  editor: Editor & {
    struct(): Struct;
    struct(value: Struct | null): Struct;
  };
  server: unknown;
  options: {
    app: {
      server?: unknown;
      templates?: unknown;
      functionalGroups?: unknown;
    };
    buttons?: Record<string, { hidden?: boolean }>;
  };
};

type ExecuteParameters = ActionParameters & {
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
} & Partial<ActionParameters>;

function execute(
  activeTool: UiActionAction | null | undefined,
  { action, editor, server, options }: ExecuteParameters,
): UiActionAction | null | undefined {
  if (typeof action !== 'function' && action.tool) {
    if (editor.tool(action.tool, action.opts)) {
      return action;
    }
  } else if (typeof action === 'function') {
    (
      action as (
        editor: ActionParameters['editor'],
        server: ActionParameters['server'],
        options: ActionParameters['options'],
      ) => void
    )(editor, server, options);
  } else {
    console.info('no action');
  }
  return activeTool;
}

function selected(
  actObject: UiAction,
  activeTool: UiActionAction | null | undefined,
  { editor, server }: Pick<ActionParameters, 'editor' | 'server'>,
): boolean {
  if (typeof actObject.selected === 'function')
    return actObject.selected(editor, server);
  else if (typeof actObject.action !== 'function' && actObject.action?.tool)
    return isEqual(activeTool, actObject.action);
  return false;
}

function disabled(
  actObject: UiAction,
  { editor, server, options }: ActionParameters,
): boolean {
  if (typeof actObject.disabled === 'function')
    return actObject.disabled(editor, server, options);
  return false;
}

function hidden(
  actObject: UiAction,
  { options }: Pick<ActionParameters, 'options'>,
): boolean {
  if (typeof actObject.hidden === 'function') return actObject.hidden(options);
  return false;
}

function status(
  actionName: string,
  activeTool: UiActionAction | null | undefined,
  parameters: ActionParameters,
): ActionStatus {
  const actObject = actions[actionName];
  return pickBy((x) => x, {
    selected: selected(actObject, activeTool, parameters),
    disabled: disabled(actObject, parameters),
    hidden: hidden(actObject, parameters),
  });
}

/**
 * Builds the state object with action statuses for all actions
 * @param activeTool - The currently active tool
 * @param parameters - Additional parameters for status computation
 * @returns State object containing active tool and action statuses
 */
function buildStateWithStatuses(
  activeTool: UiActionAction | null | undefined,
  parameters: ActionParameters,
): ActionState {
  return Object.keys(actions).reduce(
    (resource, actionName) => {
      const value = status(actionName, resource.activeTool, parameters);
      if (!isEmpty(value)) resource[actionName] = value;
      return resource;
    },
    { activeTool } as ActionState,
  );
}

export default function (
  state: ActionState | null = null,
  { type, action, ...parameters }: ReducerAction,
): ActionState | null {
  let activeTool: UiActionAction | null | undefined;
  switch (type) {
    case 'INIT': {
      const savedSelectedTool = SettingsManager.getSelectionTool('micro');
      const resolvedAction =
        restorePersistedSelectionTool(savedSelectedTool) ||
        actions['select-rectangle'].action;
      activeTool = execute(state?.activeTool, {
        ...(parameters as ActionParameters),
        action: resolvedAction,
      });
      const persistedSelectionTool =
        normalizeSelectionToolForPersistence(activeTool);
      if (persistedSelectionTool) {
        SettingsManager.setSelectionTool('micro', persistedSelectionTool);
      }
      return buildStateWithStatuses(
        activeTool || state?.activeTool,
        parameters as ActionParameters,
      );
    }

    case 'ACTION': {
      activeTool = execute(state?.activeTool, {
        ...(parameters as ActionParameters),
        action: action as UiActionAction,
      });
      const persistedSelectionTool =
        normalizeSelectionToolForPersistence(activeTool);
      if (persistedSelectionTool) {
        SettingsManager.setSelectionTool('micro', persistedSelectionTool);
      }
      return buildStateWithStatuses(
        activeTool || state?.activeTool,
        parameters as ActionParameters,
      );
    }

    case 'UPDATE':
      return buildStateWithStatuses(
        activeTool || state?.activeTool,
        parameters as ActionParameters,
      );

    default:
      return state;
  }
}
