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
import { ReStruct } from 'application/render';
import { Action } from 'application/editor';
import { MonomerAdd } from 'application/editor/operations/monomer';
import { PresetAdd } from 'application/editor/operations/monomer/PresetAdd';
import { Vec2 } from 'domain/entities';
import { MonomerItemType } from 'domain/types';

type DataPreset = {
  sugar: MonomerItemType;
  sugarPosition: Vec2 | undefined;
  rnaBase: MonomerItemType | undefined;
  rnaBasePosition: Vec2 | undefined;
  phosphate: MonomerItemType | undefined;
  phosphatePosition: Vec2 | undefined;
};

export function fromMonomerAddition(
  renderersContainer: ReStruct,
  monomer: MonomerItemType,
  position: Vec2,
): Action {
  const action = new Action();
  action.addOp(new MonomerAdd(monomer, position)).perform(renderersContainer);
  return action;
}

export function fromPresetAddition(
  renderersContainer: ReStruct,
  presets: DataPreset,
): Action {
  const action = new Action();
  action
    .addOp(new PresetAdd(renderersContainer, presets))
    .perform(renderersContainer);

  return action;
}
