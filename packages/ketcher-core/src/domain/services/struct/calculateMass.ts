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

import { CalculateData, CalculateResult } from './structService.types';

export const ELECTRON_MASS_AMU = 0.00054857990946;

interface KetNodeRef {
  $ref?: string;
}

interface KetAtom {
  charge?: number;
}

interface KetFragment {
  atoms?: KetAtom[];
}

interface KetNode {
  atoms?: KetAtom[];
  fragments?: KetFragment[];
}

interface KetDocument {
  root?: {
    nodes?: Array<KetNode | KetNodeRef>;
  };
  [key: string]: unknown;
}

function getNodeAtomCharges(node?: KetNode): number[] {
  if (!node) {
    return [];
  }

  return [
    ...(node.fragments?.flatMap((fragment) =>
      (fragment.atoms ?? []).map((atom) => atom.charge ?? 0),
    ) ?? []),
    ...(node.atoms ?? []).map((atom) => atom.charge ?? 0),
  ];
}

function isKetNodeRef(node: KetNode | KetNodeRef): node is KetNodeRef {
  return '$ref' in node;
}

function getSelectedCharge(data: CalculateData): number {
  const ket = JSON.parse(data.struct) as KetDocument;
  const atomCharges = (ket.root?.nodes ?? []).flatMap((node) => {
    if (isKetNodeRef(node) && node.$ref) {
      return getNodeAtomCharges(ket[node.$ref] as KetNode | undefined);
    }

    return getNodeAtomCharges(node as KetNode);
  });
  const atomIds = data.selected?.length
    ? data.selected
    : atomCharges.map((_, atomId) => atomId);

  return atomIds.reduce(
    (totalCharge, atomId) => totalCharge + (atomCharges[atomId] ?? 0),
    0,
  );
}

function adjustMassValueForCharge(
  massValue: string | number | boolean | undefined,
  totalCharge: number,
): string | number | undefined {
  if (typeof massValue === 'number') {
    return massValue - totalCharge * ELECTRON_MASS_AMU;
  }

  if (typeof massValue !== 'string') {
    return undefined;
  }

  const parsedMass = Number(massValue);

  if (!Number.isFinite(parsedMass)) {
    return undefined;
  }

  const decimalPart = massValue.split('.')[1];
  const decimalPlaces = decimalPart?.length;
  // Positive charge means missing electrons, so the electron mass must be
  // subtracted from the neutral exact mass; negative charge adds electrons.
  const adjustedMass = parsedMass - totalCharge * ELECTRON_MASS_AMU;

  return decimalPlaces === undefined
    ? String(adjustedMass)
    : adjustedMass.toFixed(decimalPlaces);
}

export function adjustCalculatedMassForCharge(
  data: CalculateData,
  result: CalculateResult,
): CalculateResult {
  const monoisotopicMass = result['monoisotopic-mass'];
  const totalCharge = getSelectedCharge(data);
  const adjustedMass = adjustMassValueForCharge(monoisotopicMass, totalCharge);

  if (totalCharge === 0 || adjustedMass === undefined) {
    return result;
  }

  return {
    ...result,
    'monoisotopic-mass': adjustedMass,
  };
}
