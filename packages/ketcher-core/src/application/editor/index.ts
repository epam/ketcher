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

import utils from './shared/utils';

export const vectorUtils = {
  fracAngle: utils.fracAngle,
  calcAngle: utils.calcAngle,
  degrees: utils.degrees,
  calcNewAtomPos: utils.calcNewAtomPos,
};

export * from './operations';
export * from './actions';
export * from './shared/constants';
export * from './editor.types';
export * from './Editor';
