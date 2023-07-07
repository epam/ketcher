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

/*
  This map is used to draw anything on 'layers'
  You can treat these values as z-index: backround has the lowest z-index, indices has the highest
*/
export enum LayerMap {
  background = 'background',
  selectionPlate = 'selectionPlate',
  hovering = 'hovering',
  warnings = 'warnings',
  data = 'data',
  additionalInfo = 'additionalInfo',
  indices = 'indices',
}

export enum StereoColoringType {
  LabelsOnly = 'LabelsOnly',
  BondsOnly = 'BondsOnly',
  LabelsAndBonds = 'LabelsAndBonds',
  Off = 'Off',
}

export enum StereLabelStyleType {
  IUPAC = 'Iupac',
  Classic = 'Classic',
  On = 'On',
  Off = 'Off',
}
