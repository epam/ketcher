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
  AmbiguousMonomerType,
  MonomerOrAmbiguousType,
} from 'domain/types';
import type { KetMonomerClass } from 'domain/constants/monomers';
import { AmbiguousMonomer } from 'domain/entities/AmbiguousMonomer';
import { isAmbiguousMonomerLibraryItem } from 'domain/helpers/monomers';
import type { BaseMonomerRenderer } from './BaseMonomerRenderer';
import { AmbiguousMonomerRenderer } from './AmbiguousMonomerRenderer';
import { monomerRendererFactory } from './monomerRendererFactory';
import type { ConcreteMonomerEntityClass } from 'domain/helpers/monomerEntityFactory';

type DerivedRendererClass = new (
  ...arguments_: unknown[]
) => BaseMonomerRenderer;

type MonomerFactoryResult<T extends MonomerOrAmbiguousType> =
  T extends AmbiguousMonomerType
    ? [
        EntityClass: typeof AmbiguousMonomer,
        RendererClass: typeof AmbiguousMonomerRenderer,
        ketMonomerClass: KetMonomerClass,
      ]
    : [
        EntityClass: ConcreteMonomerEntityClass,
        RendererClass: DerivedRendererClass,
        ketMonomerClass: KetMonomerClass,
      ];

/**
 * Maps any monomer library item (concrete or ambiguous) to its entity class,
 * renderer class, and KetMonomerClass. Lives in the render layer because its
 * primary job is selecting renderer constructors.
 *
 * The old location (application/editor/operations/monomer/monomerFactory) is
 * kept as a re-export shim for backward compatibility.
 */
export function monomerFactory<T extends MonomerOrAmbiguousType>(
  monomer: T,
): MonomerFactoryResult<T> {
  if (isAmbiguousMonomerLibraryItem(monomer)) {
    return [
      AmbiguousMonomer,
      AmbiguousMonomerRenderer,
      AmbiguousMonomer.getMonomerClass(monomer.monomers),
    ] as MonomerFactoryResult<T>;
  }
  return monomerRendererFactory(monomer) as MonomerFactoryResult<T>;
}
