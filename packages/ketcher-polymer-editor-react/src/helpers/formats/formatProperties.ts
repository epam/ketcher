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

import {
  ChemicalMimeType,
  SupportedFormatProperties,
} from './supportedFormatProperties';

export type SupportedFormats = 'mol' | 'helm';

type FormatProperties = {
  [key in SupportedFormats]: SupportedFormatProperties;
};

const formatProperties: FormatProperties = {
  mol: new SupportedFormatProperties(
    'MDL Molfile V3000',
    ChemicalMimeType.Mol,
    ['.mol'],
    true,
    { 'molfile-saving-mode': '3000' },
  ),
  helm: new SupportedFormatProperties('HELM', ChemicalMimeType.Helm, ['.helm']),
};

export const getPropertiesByFormat = (format: SupportedFormats) => {
  return formatProperties[format];
};
