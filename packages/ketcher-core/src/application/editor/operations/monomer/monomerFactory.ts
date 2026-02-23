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

import { BaseMonomerRenderer } from 'application/render/renderers/BaseMonomerRenderer';
import { MonomerOrAmbiguousType } from 'domain/types';
import { AmbiguousMonomer } from 'domain/entities/AmbiguousMonomer';
import { Chem } from 'domain/entities/Chem';
import { Peptide } from 'domain/entities/Peptide';
import { Phosphate } from 'domain/entities/Phosphate';
import { RNABase } from 'domain/entities/RNABase';
import { Sugar } from 'domain/entities/Sugar';
import { UnresolvedMonomer } from 'domain/entities/UnresolvedMonomer';
import { UnsplitNucleotide } from 'domain/entities/UnsplitNucleotide';
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
    MonomerRenderer = getAmbiguousMonomerRenderer();
    ketMonomerClass = AmbiguousMonomer.getMonomerClass(monomer.monomers);
  } else if (
    monomer.props.MonomerClass === KetMonomerClass.RNA ||
    monomer.props.MonomerClass === KetMonomerClass.DNA
  ) {
    Monomer = UnsplitNucleotide;
    MonomerRenderer = getUnsplitNucleotideRenderer();
    ketMonomerClass = KetMonomerClass.RNA;
  } else if (
    monomer.props.MonomerClass === KetMonomerClass.AminoAcid ||
    monomer.props.MonomerType === MONOMER_CONST.PEPTIDE
  ) {
    Monomer = Peptide;
    MonomerRenderer = getPeptideRenderer();
    ketMonomerClass = KetMonomerClass.AminoAcid;
  } else if (
    monomer.props.MonomerClass === KetMonomerClass.Sugar ||
    (monomer.props.MonomerType === MONOMER_CONST.RNA &&
      monomer.props.MonomerNaturalAnalogCode === MONOMER_CONST.R)
  ) {
    Monomer = Sugar;
    MonomerRenderer = getSugarRenderer();
    ketMonomerClass = KetMonomerClass.Sugar;
  } else if (
    monomer.props.MonomerClass === KetMonomerClass.Phosphate ||
    (monomer.props.MonomerType === MONOMER_CONST.RNA &&
      monomer.props.MonomerNaturalAnalogCode === MONOMER_CONST.P)
  ) {
    Monomer = Phosphate;
    MonomerRenderer = getPhosphateRenderer();
    ketMonomerClass = KetMonomerClass.Phosphate;
  } else if (
    monomer.props.MonomerClass === KetMonomerClass.Base ||
    (monomer.props.MonomerType === MONOMER_CONST.RNA &&
      [...rnaDnaNaturalAnalogues, ...unknownNaturalAnalogues].includes(
        monomer.props.MonomerNaturalAnalogCode,
      ))
  ) {
    Monomer = RNABase;
    MonomerRenderer = getRNABaseRenderer();
    ketMonomerClass = KetMonomerClass.Base;
  } else if (monomer.props.unresolved) {
    Monomer = UnresolvedMonomer;
    MonomerRenderer = getUnresolvedMonomerRenderer();
    ketMonomerClass = KetMonomerClass.CHEM;
  } else {
    Monomer = Chem;
    MonomerRenderer = getChemRenderer();
    ketMonomerClass = KetMonomerClass.CHEM;
  }

  return [Monomer, MonomerRenderer, ketMonomerClass];
};

function getAmbiguousMonomerRenderer() {
  return require('application/render/renderers/AmbiguousMonomerRenderer')
    .AmbiguousMonomerRenderer;
}

function getChemRenderer() {
  return require('application/render/renderers/ChemRenderer').ChemRenderer;
}

function getPeptideRenderer() {
  return require('application/render/renderers/PeptideRenderer')
    .PeptideRenderer;
}

function getPhosphateRenderer() {
  return require('application/render/renderers/PhosphateRenderer')
    .PhosphateRenderer;
}

function getRNABaseRenderer() {
  return require('application/render/renderers/RNABaseRenderer')
    .RNABaseRenderer;
}

function getSugarRenderer() {
  return require('application/render/renderers/SugarRenderer').SugarRenderer;
}

function getUnresolvedMonomerRenderer() {
  return require('application/render/renderers/UnresolvedMonomerRenderer')
    .UnresolvedMonomerRenderer;
}

function getUnsplitNucleotideRenderer() {
  return require('application/render/renderers/UnsplitNucleotideRenderer')
    .UnsplitNucleotideRenderer;
}
