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

export const MONOMER_LIBRARY_FAVORITES = 'FAVORITES';
export const MONOMER_LIBRARY_PEPTIDES = 'PEPTIDE';

export const MONOMER_TYPES = {
  PEPTIDE: 'PEPTIDE',
  CHEM: 'CHEM',
  RNA: 'RNA',
} as const;
export type LibraryNameType =
  | typeof MONOMER_LIBRARY_FAVORITES
  | keyof typeof MONOMER_TYPES;

export enum MonomerGroups {
  SUGARS = 'Sugars',
  BASES = 'Bases',
  PHOSPHATES = 'Phosphates',
  PEPTIDES = 'Amino acids',
  NUCLEOTIDES = 'Nucleotides',
}

export enum MonomerGroupCodes {
  R = 'R',
  A = 'A',
  C = 'C',
  G = 'G',
  T = 'T',
  U = 'U',
  X = 'X',
  P = 'P',
}

export const MonomerCodeToGroup: Record<MonomerGroupCodes, MonomerGroups> = {
  R: MonomerGroups.SUGARS,
  A: MonomerGroups.BASES,
  C: MonomerGroups.BASES,
  G: MonomerGroups.BASES,
  T: MonomerGroups.BASES,
  U: MonomerGroups.BASES,
  X: MonomerGroups.BASES,
  P: MonomerGroups.PHOSPHATES,
} as const;

export const FAVORITE_ITEMS_UNIQUE_KEYS = 'favoriteItemsUniqueKeys';
export const CUSTOM_PRESETS = 'ketcher_custom_presets';

// It's set as Z, so it will always be put in the end when alphabetically sorting groups by code
export const NoNaturalAnalogueGroupCode = 'Z';
export const NoNaturalAnalogueGroupTitle = 'No natural analogue';

export const DNA_TEMPLATE_NAME_PART = 'thymine';
export const RNA_TEMPLATE_NAME_PART = 'uracil';
