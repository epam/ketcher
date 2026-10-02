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

import templates from '../data/templates';
import isHidden from './isHidden';
import type { Struct } from 'ketcher-core';
import type { UiAction } from './action.types';
import type { Tool } from '../../editor/tool/Tool';

type ToolWithMode = Tool & {
  mode: unknown;
};

const templateStructs = templates as Struct[];

const isToolWithMode = (tool: Tool | null): tool is ToolWithMode =>
  typeof tool === 'object' && tool !== null && 'mode' in tool;

const templateLib: Record<string, UiAction> = {
  'template-lib': {
    shortcut: 'Shift+t',
    title: 'Structure Library',
    action: { dialog: 'templates', prop: { tab: null } },
    selected: (editor) =>
      isToolWithMode(editor._tool) && editor._tool.mode === 'classic',
    disabled: (_editor, _server, options) => !options.app.templates,
    hidden: (options) => isHidden(options, 'template-lib'),
  },
};

const templateActions = templateStructs.reduce<Record<string, UiAction>>(
  (res, struct, i) => {
    res[`template-${i}`] = {
      title: `${struct.name}`,
      shortcut: 't',
      action: {
        tool: 'template',
        opts: { struct },
      },
    };
    return res;
  },
  templateLib,
);

export default templateActions;
