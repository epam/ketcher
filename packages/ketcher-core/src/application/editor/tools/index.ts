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
import { ToolConstructorInterface } from './Tool';
import { MonomerTool } from 'application/editor/tools/Monomer';
import { RnaPresetTool } from 'application/editor/tools/RnaPreset';
import { SelectRectangle } from 'application/editor/tools/SelectRectangle';
import { PolymerBond } from 'application/editor/tools/Bond';
import { EraserTool } from 'application/editor/tools/Erase';
import { ClearTool } from 'application/editor/tools/Clear';

export const toolsMap: Record<string, ToolConstructorInterface> = {
  monomer: MonomerTool,
  preset: RnaPresetTool,
  'select-rectangle': SelectRectangle,
  'bond-single': PolymerBond,
  erase: EraserTool,
  clear: ClearTool,
};

export * from './Tool';
