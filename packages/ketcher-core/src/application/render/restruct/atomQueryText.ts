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

import type { Atom, AtomQueryProperties } from 'domain/entities/atom';

function getRingBondCountAttrText(value: number) {
  let attrText: string;
  if (value > 0) {
    attrText = 'rb' + value.toString();
  } else if (value === -1) {
    attrText = 'rb0';
  } else if (value === -2) {
    attrText = 'rb*';
  } else {
    throw new Error('Ring bond count invalid');
  }
  return attrText;
}

function getRingConnectivity(value: number) {
  if (value > 0) {
    return 'x' + value.toString();
  } else if (value === -1 || value === -2) {
    return 'x0';
  } else {
    return '';
  }
}

function getDegree(value: number) {
  if (value > 0) {
    return 'D' + value.toString();
  } else if (value === -1 || value === -2) {
    return 'D0';
  } else {
    return '';
  }
}

function getSubstitutionCountAttrText(value: number) {
  let attrText: string;
  if (value > 0) {
    attrText = 's' + value.toString();
  } else if (value === -1) {
    attrText = 's0';
  } else if (value === -2) {
    attrText = 's*';
  } else {
    throw new Error('Substitution count invalid');
  }
  return attrText;
}

type AtomCustomQueryValue = string | number | boolean;

/**
 * Minimum shape required by getAtomCustomQuery.
 * Satisfied by both a full Atom instance (query-specific fields nested
 * under queryProperties) and the flat Redux form state produced by the
 * Atom dialog (those fields hoisted to top level by fromAtom).
 */
export type AtomQueryInput = Partial<
  Pick<
    Atom,
    | 'isotope'
    | 'charge'
    | 'explicitValence'
    | 'ringBondCount'
    | 'substitutionCount'
    | 'hCount'
    | 'implicitHCount'
  >
> & {
  unsaturatedAtom?: number | boolean; // number on Atom, boolean in form state
  queryProperties?: Partial<AtomQueryProperties>;
} & Partial<AtomQueryProperties>; // flat query fields (form state path)

/**
 * Maps atom properties and SMARTS/query-specific atom fields to the textual
 * Molfile query attributes rendered by getAtomCustomQuery().
 */
type AtomCustomQueryPropertyName =
  | 'aromaticity'
  | 'charge'
  | 'chirality'
  | 'connectivity'
  | 'explicitValence'
  | 'hCount'
  | 'implicitHCount'
  | 'isotope'
  | 'ringBondCount'
  | 'ringMembership'
  | 'ringSize'
  | 'substitutionCount'
  | 'unsaturatedAtom';
type AtomCustomQueryPattern = {
  /**
  Atom property name used to determine whether the query attribute applies.
  */
  propertyName: AtomCustomQueryPropertyName;
  /**
  Reads the raw atom/query-property value before text normalization.
  */
  getValue: (atom: AtomQueryInput) => AtomCustomQueryValue | null | undefined;
  /**
  Converts a normalized value to its Molfile query attribute representation.
  */
  format: (value: string) => string;
};

const EXCLUDED_QUERY_ATTRIBUTES = new Set<AtomCustomQueryPropertyName>([
  'charge',
  'explicitValence',
  'isotope',
]);

const atomCustomQueryPatterns: readonly AtomCustomQueryPattern[] = [
  {
    propertyName: 'isotope',
    getValue: (atom) => atom.isotope,
    format: (value) => value,
  },
  {
    propertyName: 'aromaticity',
    getValue: (atom) =>
      atom.queryProperties?.aromaticity ?? atom.aromaticity ?? null,
    format: (value) => (value === 'aromatic' ? 'a' : 'A'),
  },
  {
    propertyName: 'charge',
    getValue: (atom) => atom.charge,
    format: (value) => {
      if (value === '') return value;
      const regExpResult = /^([+-]?)(\d{1,3}|1000)([+-]?)$/.exec(value);
      const charge = regExpResult
        ? Number.parseInt(
            regExpResult[1] + regExpResult[3] + regExpResult[2],
          ).toString()
        : value;
      return charge.startsWith('-') ? charge : `+${charge}`;
    },
  },
  {
    propertyName: 'unsaturatedAtom',
    getValue: (atom) => atom.unsaturatedAtom,
    format: (value) => (value === 'true' || Number(value) === 1 ? 'u' : ''),
  },
  {
    propertyName: 'explicitValence',
    getValue: (atom) => atom.explicitValence,
    format: (value) => (Number(value) === -1 ? '' : `v${value}`),
  },
  {
    propertyName: 'ringBondCount',
    getValue: (atom) => atom.ringBondCount,
    format: (value) => getRingConnectivity(Number(value)),
  },
  {
    propertyName: 'substitutionCount',
    getValue: (atom) => atom.substitutionCount,
    format: (value) => getDegree(Number(value)),
  },
  {
    propertyName: 'hCount',
    getValue: (atom) => atom.hCount,
    // Molfile query hydrogen counts are encoded as H<count - 1>.
    format: (value) =>
      Number(value) > 0 ? 'H' + (Number(value) - 1).toString() : '',
  },
  {
    propertyName: 'implicitHCount',
    getValue: (atom) => atom.implicitHCount,
    format: (value) => `h${value}`,
  },
  {
    propertyName: 'ringMembership',
    getValue: (atom) =>
      atom.queryProperties?.ringMembership ?? atom.ringMembership ?? null,
    format: (value) => `R${value}`,
  },
  {
    propertyName: 'ringSize',
    getValue: (atom) => atom.queryProperties?.ringSize ?? atom.ringSize ?? null,
    format: (value) => `r${value}`,
  },
  {
    propertyName: 'connectivity',
    getValue: (atom) =>
      atom.queryProperties?.connectivity ?? atom.connectivity ?? null,
    format: (value) => `X${value}`,
  },
  {
    propertyName: 'chirality',
    getValue: (atom) =>
      atom.queryProperties?.chirality ?? atom.chirality ?? null,
    format: (value) => (value === 'clockwise' ? '@@' : '@'),
  },
];

export function checkIsSmartPropertiesExist(atom: AtomQueryInput) {
  const smartsSpecificProperties = [
    'ringMembership',
    'ringSize',
    'connectivity',
    'chirality',
    'aromaticity',
    'customQuery',
  ];
  return (
    (atom.implicitHCount ?? null) !== null ||
    smartsSpecificProperties.some((name) => {
      const value = atom.queryProperties?.[name];
      return Boolean(value) || value === 0;
    })
  );
}

export function getAtomCustomQuery(
  atom: AtomQueryInput,
  shouldIncludeOnlyQueryAttributes?: boolean,
) {
  let queryAttrsText = '';

  const addSemicolon = () => {
    if (queryAttrsText.length > 0) queryAttrsText += ';';
  };

  for (const { propertyName, getValue, format } of atomCustomQueryPatterns) {
    if (
      shouldIncludeOnlyQueryAttributes &&
      EXCLUDED_QUERY_ATTRIBUTES.has(propertyName)
    ) {
      continue;
    }

    const value = getValue(atom);
    if (value === null || value === undefined) {
      continue;
    }

    const attrText = format(String(value));
    if (attrText) {
      addSemicolon();
    }
    queryAttrsText += attrText;
  }

  return queryAttrsText;
}

export function getQueryAttrsText(atom: AtomQueryInput): string {
  let queryAttrsText = '';

  const addSemicolon = () => {
    if (queryAttrsText.length > 0) queryAttrsText += ';';
  };

  const ringBondCount = atom.ringBondCount ?? 0;
  const substitutionCount = atom.substitutionCount ?? 0;
  const unsaturatedAtom = Number(atom.unsaturatedAtom ?? 0);
  const hCount = atom.hCount ?? 0;

  if (ringBondCount !== 0) {
    queryAttrsText += getRingBondCountAttrText(ringBondCount);
  }
  if (substitutionCount !== 0) {
    addSemicolon();
    queryAttrsText += getSubstitutionCountAttrText(substitutionCount);
  }
  if (unsaturatedAtom > 0) {
    addSemicolon();
    if (unsaturatedAtom === 1) queryAttrsText += 'u';
    else throw new Error('Unsaturated atom invalid value');
  }
  if (hCount > 0) {
    addSemicolon();
    queryAttrsText += 'H' + (hCount - 1).toString();
  }
  return queryAttrsText;
}

export function getAtomQueryLabelText(atom: AtomQueryInput): string {
  if (!checkIsSmartPropertiesExist(atom)) {
    return getQueryAttrsText(atom);
  }

  return atom.queryProperties?.customQuery ?? getAtomCustomQuery(atom, true);
}
