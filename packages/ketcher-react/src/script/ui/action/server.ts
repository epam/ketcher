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
import { serverTransform } from '../state/server';
import type { UiAction } from './action.types';

type ServerConfig = {
  [key: string]: UiAction;
};

const config: ServerConfig = {
  layout: {
    shortcut: 'Mod+l',
    title: 'toolbar:server.layout',
    action: {
      thunk: serverTransform('layout'),
    },
    disabled: (_editor, _server, options) => !options.app.server,
    hidden: (options) => isHidden(options, 'layout'),
  },
  clean: {
    shortcut: 'Mod+Shift+l',
    title: 'toolbar:server.clean',
    action: {
      thunk: serverTransform('clean'),
    },
    disabled: (_editor, _server, options) => !options.app.server,
    hidden: (options) => isHidden(options, 'clean'),
  },
  arom: {
    shortcut: 'Alt+a',
    title: 'toolbar:server.aromatize',
    action: {
      thunk: serverTransform('aromatize'),
    },
    disabled: (_editor, _server, options) => !options.app.server,
    hidden: (options) => isHidden(options, 'arom'),
  },
  dearom: {
    shortcut: 'Mod+Alt+a',
    title: 'toolbar:server.dearomatize',
    action: {
      thunk: serverTransform('dearomatize'),
    },
    disabled: (_editor, _server, options) => !options.app.server,
    hidden: (options) => isHidden(options, 'dearom'),
  },
  cip: {
    shortcut: 'Mod+p',
    title: 'toolbar:server.calculateCip',
    action: {
      thunk: serverTransform('calculateCip'),
    },
    disabled: (_editor, _server, options) => !options.app.server,
    hidden: (options) => isHidden(options, 'cip'),
  },
  check: {
    shortcut: 'Alt+s',
    enabledInViewOnly: true,
    title: 'toolbar:server.checkStructure',
    action: { dialog: 'check' },
    disabled: (_editor, _server, options) => !options.app.server,
    hidden: (options) => isHidden(options, 'check'),
  },
  analyse: {
    shortcut: 'Alt+c',
    enabledInViewOnly: true,
    title: 'toolbar:server.calculatedValues',
    action: { dialog: 'analyse' },
    disabled: (_editor, _server, options) => !options.app.server,
    hidden: (options) => isHidden(options, 'analyse'),
  },
  recognize: {
    title: 'toolbar:server.recognizeMolecule',
    action: { dialog: 'recognize' },
    disabled: (_editor, _server, options) =>
      !options.app.server ||
      !(options.app as { imagoVersions?: unknown[] }).imagoVersions?.length,
    hidden: (options) => isHidden(options, 'recognize'),
  },
  miew: {
    title: 'toolbar:server.viewer3d',
    enabledInViewOnly: true,
    action: { dialog: 'miew' },
    hidden: (options) => isHidden(options, 'miew'),
  },
  'explicit-hydrogens': {
    title: 'toolbar:server.explicitHydrogens',
    action: {
      thunk: serverTransform('toggleExplicitHydrogens'),
    },
    disabled: (_editor, _server, options) => !options.app.server,
    hidden: (options) => isHidden(options, 'explicit-hydrogens'),
  },
};

export default config;
