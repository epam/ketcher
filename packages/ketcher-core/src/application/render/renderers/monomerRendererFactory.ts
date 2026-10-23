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
  type ConcreteMonomerEntityClass,
  monomerEntityFactory,
} from 'domain/helpers/monomerEntityFactory';
import type { MonomerItemType } from 'domain/types';
import type { KetMonomerClass } from 'domain/constants/monomers';
import {
  Chem,
  Peptide,
  Phosphate,
  RNABase,
  Sugar,
  UnresolvedMonomer,
  UnsplitNucleotide,
} from 'domain/entities';
import type { BaseMonomerRenderer } from './BaseMonomerRenderer';
import { ChemRenderer } from './ChemRenderer';
import { PeptideRenderer } from './PeptideRenderer';
import { PhosphateRenderer } from './PhosphateRenderer';
import { RNABaseRenderer } from './RNABaseRenderer';
import { SugarRenderer } from './SugarRenderer';
import { UnresolvedMonomerRenderer } from './UnresolvedMonomerRenderer';
import { UnsplitNucleotideRenderer } from './UnsplitNucleotideRenderer';

type DerivedRendererClass = new (...args: unknown[]) => BaseMonomerRenderer;

const entityToRenderer = new Map<
  ConcreteMonomerEntityClass,
  DerivedRendererClass
>([
  // TODO: refactoring for more elegant type casting
  [Chem, ChemRenderer as unknown as DerivedRendererClass],
  [Peptide, PeptideRenderer as unknown as DerivedRendererClass],
  [Phosphate, PhosphateRenderer as unknown as DerivedRendererClass],
  [RNABase, RNABaseRenderer as unknown as DerivedRendererClass],
  [Sugar, SugarRenderer as unknown as DerivedRendererClass],
  [
    UnresolvedMonomer,
    UnresolvedMonomerRenderer as unknown as DerivedRendererClass,
  ],
  [
    UnsplitNucleotide,
    UnsplitNucleotideRenderer as unknown as DerivedRendererClass,
  ],
]);

/**
 * Maps a concrete monomer library item to its entity class, renderer class,
 * and KetMonomerClass. Does not handle ambiguous monomers — use
 * monomerFactory for those.
 */
export const monomerRendererFactory = (
  monomer: MonomerItemType,
): [
  EntityClass: ConcreteMonomerEntityClass,
  RendererClass: DerivedRendererClass,
  ketMonomerClass: KetMonomerClass,
] => {
  const [EntityClass, ketMonomerClass] = monomerEntityFactory(monomer);
  const RendererClass = entityToRenderer.get(EntityClass);
  // 'RendererClass as DerivedRendererClass' - to satisfy the return type, but it should always be defined since the map is exhaustive
  return [EntityClass, RendererClass as DerivedRendererClass, ketMonomerClass];
};
