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

import { Axis, Axises, Struct, Vec2 } from 'domain/entities';
import { cloneDeep, cloneDeepWith } from 'lodash';
import { EditorSelection } from 'application/editor';
import { KetMonomerClass, MonomerTransformation } from 'application/formatters';
import { MONOMER_CONST, RNA_DNA_NON_MODIFIED_PART } from 'domain/constants';

const customizer = (value: any) => {
  if (typeof value === 'object' && value.y) {
    const clonedValue = cloneDeep(value);
    clonedValue.y = -clonedValue.y;
    return clonedValue;
  }
};

export const getNodeWithInvertedYCoord = <T>(node: T): T =>
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

export const getHELMClassByKetMonomerClass = (
  monomerClass: KetMonomerClass,
) => {
  if (monomerClass === KetMonomerClass.AminoAcid) {
    return MONOMER_CONST.PEPTIDE;
  }

  if (monomerClass === KetMonomerClass.CHEM) {
    return MONOMER_CONST.CHEM;
  }

  return MONOMER_CONST.RNA;
};

export const fillNaturalAnalogueForPhosphateAndSugar = (
  naturalAnalogue: string,
  monomerClass: KetMonomerClass,
) => {
  if (naturalAnalogue !== '') {
    return naturalAnalogue;
  }

  if (monomerClass === KetMonomerClass.Sugar) {
    return RNA_DNA_NON_MODIFIED_PART.SUGAR_RNA;
  }

  if (monomerClass === KetMonomerClass.Phosphate) {
    return RNA_DNA_NON_MODIFIED_PART.PHOSPHATE;
  }

  return naturalAnalogue;
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

export const modifyTransformation = (transformation: MonomerTransformation) => {
  const { rotate } = transformation;
  const newTransformation = cloneDeep(transformation);

  /*
   * Ketcher provides rotation angle according to the rotation tool – 0 is in the middle, minus angle rotates anti-clockwise, plus angle rotates clockwise
   * Indigo uses trigonometric circle – 0 is on the right, plus angle rotates anti-clockwise, minus angle rotates clockwise
   * Hence, we have to invert the angle when saving and when loading from KET file
   */
  if (rotate) {
    newTransformation.rotate = -rotate;
  }

  return newTransformation;
};

export const populateStructWithSelection = (
  populatedStruct: Struct,
  selection?: EditorSelection,
  resetSelection = false,
) => {
  if (!selection) {
    return populatedStruct;
  }
  Object.keys(selection).forEach((entity) => {
    const selectedEntities = selection[entity];
    populatedStruct[entity]?.forEach((value, key) => {
      if (typeof value.setInitiallySelected === 'function') {
        if (resetSelection) {
          value.setInitiallySelected(
            selectedEntities.includes(key) || undefined,
          );
        } else {
          if (selectedEntities.includes(key)) {
            value.setInitiallySelected(true);
          }
        }
      }
    });
  });
  return populatedStruct;
};
