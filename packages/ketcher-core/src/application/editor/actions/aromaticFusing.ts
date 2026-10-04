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

import type { ReStruct } from 'application/render';
import type { Action } from './action';
import type { EditorTemplate, PasteItems } from './template.types';

type SimpleFusing = (
  restruct: ReStruct,
  template: EditorTemplate,
  bid: number,
) => [Action, PasteItems];

export function fromAromaticTemplateOnBond(
  restruct: ReStruct,
  template: EditorTemplate,
  bid: number,
  _events: unknown,
  simpleFusing: SimpleFusing,
): Promise<[Action, PasteItems]> {
  const pasteResult = simpleFusing(restruct, template, bid);
  return Promise.resolve(pasteResult);
}
