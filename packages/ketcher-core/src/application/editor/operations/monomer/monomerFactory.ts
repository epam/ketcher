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
  AmbiguousMonomerRenderer,
  BaseMonomerRenderer,
  ChemRenderer,
  PeptideRenderer,
  PhosphateRenderer,
  RNABaseRenderer,
  SugarRenderer,
  UnresolvedMonomerRenderer,
  UnsplitNucleotideRenderer,
} from 'application/render/renderers';
import { MonomerOrAmbiguousType } from 'domain/types';
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
import { KetMonomerClass } from 'application/formatters/types/ket';
import { isAmbiguousMonomerLibraryItem } from 'domain/helpers/monomers';
import {
  MONOMER_CONST,
  rnaDnaNaturalAnalogues,
  unknownNaturalAnalogues,
} from 'domain/constants/monomers';

type DerivedClass<T> = new (...args: unknown[]) => T;

type Monomer =
  | typeof Chem
  | typeof Sugar
  | typeof Peptide
  | typeof RNABase
  | typeof Phosphate;

export const monomerFactory = (
  monomer: MonomerOrAmbiguousType,
): [
  Monomer: Monomer,
  MonomerRenderer: DerivedClass<BaseMonomerRenderer>,
  ketMonomerClass: KetMonomerClass,
] => {
  let Monomer;
  let MonomerRenderer;
  let ketMonomerClass: KetMonomerClass;

  if (isAmbiguousMonomerLibraryItem(monomer)) {
    Monomer = AmbiguousMonomer;
    MonomerRenderer = AmbiguousMonomerRenderer;
    ketMonomerClass = AmbiguousMonomer.getMonomerClass(monomer.monomers);
  } else if (
    monomer.props.MonomerClass === KetMonomerClass.RNA ||
    monomer.props.MonomerClass === KetMonomerClass.DNA
  ) {
    Monomer = UnsplitNucleotide;
    MonomerRenderer = UnsplitNucleotideRenderer;
    ketMonomerClass = KetMonomerClass.RNA;
  } else if (
    monomer.props.MonomerClass === KetMonomerClass.AminoAcid ||
    monomer.props.MonomerType === MONOMER_CONST.PEPTIDE
  ) {
    Monomer = Peptide;
    MonomerRenderer = PeptideRenderer;
    ketMonomerClass = KetMonomerClass.AminoAcid;
  } else if (
    monomer.props.MonomerClass === KetMonomerClass.Sugar ||
    (monomer.props.MonomerType === MONOMER_CONST.RNA &&
      monomer.props.MonomerNaturalAnalogCode === MONOMER_CONST.R)
  ) {
    Monomer = Sugar;
    MonomerRenderer = SugarRenderer;
    ketMonomerClass = KetMonomerClass.Sugar;
  } else if (
    monomer.props.MonomerClass === KetMonomerClass.Phosphate ||
    (monomer.props.MonomerType === MONOMER_CONST.RNA &&
      monomer.props.MonomerNaturalAnalogCode === MONOMER_CONST.P)
  ) {
    Monomer = Phosphate;
    MonomerRenderer = PhosphateRenderer;
    ketMonomerClass = KetMonomerClass.Phosphate;
  } else if (
    monomer.props.MonomerClass === KetMonomerClass.Base ||
    (monomer.props.MonomerType === MONOMER_CONST.RNA &&
      [...rnaDnaNaturalAnalogues, ...unknownNaturalAnalogues].includes(
        monomer.props.MonomerNaturalAnalogCode,
      ))
  ) {
    Monomer = RNABase;
    MonomerRenderer = RNABaseRenderer;
    ketMonomerClass = KetMonomerClass.Base;
  } else if (monomer.props.unresolved) {
    Monomer = UnresolvedMonomer;
    MonomerRenderer = UnresolvedMonomerRenderer;
    ketMonomerClass = KetMonomerClass.CHEM;
  } else {
    Monomer = Chem;
    MonomerRenderer = ChemRenderer;
    ketMonomerClass = KetMonomerClass.CHEM;
  }

  return [Monomer, MonomerRenderer, ketMonomerClass];
};
