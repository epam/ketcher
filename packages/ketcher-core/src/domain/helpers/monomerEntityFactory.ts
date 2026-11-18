/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import type {
  MonomerItemType,
  MonomerOrAmbiguousType,
  AmbiguousMonomerType,
} from 'domain/types';
import {
  AmbiguousMonomer,
  Chem,
  Peptide,
  Phosphate,
  RNABase,
  Sugar,
  UnresolvedMonomer,
  UnsplitNucleotide,
} from 'domain/entities';
import {
  isAmbiguousMonomerLibraryItem,
  isMonomerItemPhosphate,
  isMonomerItemSugar,
} from 'domain/helpers/monomers';
import {
  KetMonomerClass,
  MONOMER_CONST,
  rnaDnaNaturalAnalogues,
  unknownNaturalAnalogues,
} from 'domain/constants/monomers';

/**
Entity classes for concrete (non-ambiguous) monomers only.
*/
export type ConcreteMonomerEntityClass =
  | typeof Chem
  | typeof Peptide
  | typeof Phosphate
  | typeof RNABase
  | typeof Sugar
  | typeof UnresolvedMonomer
  | typeof UnsplitNucleotide;

/**
All monomer entity classes, including ambiguous.
*/
export type MonomerEntityClass =
  ConcreteMonomerEntityClass | typeof AmbiguousMonomer;

type MonomerEntityFactoryResult<T extends MonomerOrAmbiguousType> =
  T extends MonomerItemType
    ? [
        EntityClass: ConcreteMonomerEntityClass,
        ketMonomerClass: KetMonomerClass,
      ]
    : [EntityClass: MonomerEntityClass, ketMonomerClass: KetMonomerClass];

/**
 * Maps a monomer library item (concrete or ambiguous) to the corresponding
 * domain entity class and KetMonomerClass enum value.
 * This is a pure domain helper — it has no renderer imports.
 */
export function monomerEntityFactory<
  T extends MonomerItemType | AmbiguousMonomerType,
>(monomer: T): MonomerEntityFactoryResult<T> {
  if (isAmbiguousMonomerLibraryItem(monomer)) {
    return [
      AmbiguousMonomer,
      AmbiguousMonomer.getMonomerClass(monomer.monomers),
    ] as MonomerEntityFactoryResult<T>;
  }

  if (
    monomer.props.MonomerClass === KetMonomerClass.RNA ||
    monomer.props.MonomerClass === KetMonomerClass.DNA
  ) {
    return [
      UnsplitNucleotide,
      KetMonomerClass.RNA,
    ] as MonomerEntityFactoryResult<T>;
  }

  if (
    monomer.props.MonomerClass === KetMonomerClass.AminoAcid ||
    monomer.props.MonomerType === MONOMER_CONST.PEPTIDE
  ) {
    return [
      Peptide,
      KetMonomerClass.AminoAcid,
    ] as MonomerEntityFactoryResult<T>;
  }

  if (isMonomerItemSugar(monomer)) {
    return [Sugar, KetMonomerClass.Sugar] as MonomerEntityFactoryResult<T>;
  }

  if (isMonomerItemPhosphate(monomer)) {
    return [
      Phosphate,
      KetMonomerClass.Phosphate,
    ] as MonomerEntityFactoryResult<T>;
  }

  if (
    monomer.props.MonomerClass === KetMonomerClass.Base ||
    (monomer.props.MonomerType === MONOMER_CONST.RNA &&
      [...rnaDnaNaturalAnalogues, ...unknownNaturalAnalogues].includes(
        monomer.props.MonomerNaturalAnalogCode,
      ))
  ) {
    return [RNABase, KetMonomerClass.Base] as MonomerEntityFactoryResult<T>;
  }

  if (monomer.props.unresolved) {
    return [
      UnresolvedMonomer,
      KetMonomerClass.CHEM,
    ] as MonomerEntityFactoryResult<T>;
  }

  return [Chem, KetMonomerClass.CHEM] as MonomerEntityFactoryResult<T>;
}
