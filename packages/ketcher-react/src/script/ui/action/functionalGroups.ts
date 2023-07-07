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

import isHidden from './isHidden';
import { MODES } from 'src/constants';

const functionalGroupsLib = {
  'functional-groups': {
    shortcut: 'Shift+f',
    // TODO Update HELP about current tools
    title: 'Functional Groups',
    action: { dialog: 'templates', prop: { tab: 1 } },
    selected: (editor) => editor._tool.mode === MODES.FG,
    disabled: (_, __, options) => {
      return !options.app.functionalGroups;
    },
    hidden: (options) => isHidden(options, 'functional-groups'),
  },
};

export default functionalGroupsLib;
