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

import { Struct } from 'ketcher-core';

// Electron mass in atomic mass units (CODATA 2018)
export const ELECTRON_MASS_AMU = 0.00054857990946;

interface Selection {
  atoms?: number[];
}

export function getStructTotalCharge(
  struct: Struct,
  selection?: Selection | null,
): number {
  let totalCharge = 0;

  if (selection?.atoms && selection.atoms.length > 0) {
    const atomSet = new Set(selection.atoms);
    struct.atoms.forEach((atom, aid) => {
      if (atomSet.has(aid) && atom.charge) {
        totalCharge += atom.charge;
      }
    });
  } else {
    struct.atoms.forEach((atom) => {
      if (atom.charge) {
        totalCharge += atom.charge;
      }
    });
  }

  return totalCharge;
}

function getComponentCharge(struct: Struct, atomSet: Set<number>): number {
  let charge = 0;
  atomSet.forEach((aid) => {
    const atom = struct.atoms.get(aid);
    if (atom?.charge) {
      charge += atom.charge;
    }
  });
  return charge;
}

function adjustReactionComponentMasses(
  componentStr: string,
  components: Array<Set<number>>,
  struct: Struct,
): string | null {
  const componentParts = componentStr.split('+');
  if (componentParts.length !== components.length) return null;

  const adjusted = componentParts.map((part, index) => {
    const charge = getComponentCharge(struct, components[index]);
    if (charge === 0) return part;

    return part.replace(/[\d.]+/g, (numStr) => {
      const num = parseFloat(numStr);
      return String(num - charge * ELECTRON_MASS_AMU);
    });
  });

  return adjusted.join('+');
}

function adjustReactionMassForCharge(valueStr: string, struct: Struct): string {
  const parts = valueStr.split(' > ');
  if (parts.length !== 2) return valueStr;

  const { reactants, products } = struct.getComponents();

  const adjustedReactants = adjustReactionComponentMasses(
    parts[0],
    reactants,
    struct,
  );
  const adjustedProducts = adjustReactionComponentMasses(
    parts[1],
    products,
    struct,
  );

  if (adjustedReactants === null || adjustedProducts === null) return valueStr;

  return `${adjustedReactants} > ${adjustedProducts}`;
}

export function adjustMassForCharge(
  value: string | number,
  struct: Struct,
  selection?: Selection | null,
): string | number {
  if (typeof value === 'number') {
    const totalCharge = getStructTotalCharge(struct, selection);
    if (totalCharge === 0) return value;
    return value - totalCharge * ELECTRON_MASS_AMU;
  }

  if (typeof value === 'string' && value.includes(' > ')) {
    return adjustReactionMassForCharge(value, struct);
  }

  return value;
}
