/****************************************************************************
 * Copyright 2022 EPAM Systems
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

import { Vec2, Axis, Axises, Struct } from 'domain/entities';
import { cloneDeepWith, cloneDeep } from 'lodash';
import { EditorSelection } from 'application/editor';

const customizer = (value: any) => {
  if (typeof value === 'object' && value.y) {
    const clonedValue = cloneDeep(value);
    clonedValue.y = -clonedValue.y;
    return clonedValue;
  }
};

export const getNodeWithInvertedYCoord = (node: object) =>
  cloneDeepWith(node, customizer);

export const setMonomerTemplatePrefix = (templateName: string) =>
  `monomerTemplate-${templateName}`;
export const setMonomerPrefix = (monomerId: number) => `monomer${monomerId}`;

export const setAmbiguousMonomerTemplatePrefix = (templateName: string) =>
  `ambiguousMonomerTemplate-${templateName}`;

export const setAmbiguousMonomerPrefix = (monomerId: number) =>
  `ambiguousMonomer${monomerId}`;

export const getKetRef = (entityId: string) => {
  return { $ref: entityId };
};

const rotateCoordAxisBy180Degrees = (position: Vec2, axis: Axises): Vec2 => {
  const rotatedPosition = {
    x: position.x,
    y: position.y,
    z: position.z,
  };

  rotatedPosition[axis] = -rotatedPosition[axis];

  return new Vec2(rotatedPosition.x, rotatedPosition.y, rotatedPosition.z);
};

/**
 *
 * System coordinates for browser and for chemistry files format (mol, ket, etc.) area are different.
 * It needs to rotate them by 180 degrees in y-axis.
 *
 * @param position - coordinates of the structure
 *
 */
export const switchIntoChemistryCoordSystem = (position: Vec2) => {
  return rotateCoordAxisBy180Degrees(position, Axis.y);
};

export const populateStructWithSelection = (
  populatedStruct: Struct,
  selection?: EditorSelection,
) => {
  if (!selection) {
    return populatedStruct;
  }
  Object.keys(selection).forEach((entity) => {
    const selectedEntities = selection[entity];
    populatedStruct[entity]?.forEach((value, key) => {
      if (typeof value.setInitiallySelected === 'function') {
        value.setInitiallySelected(selectedEntities.includes(key) || undefined);
      }
    });
  });
  return populatedStruct;
};
