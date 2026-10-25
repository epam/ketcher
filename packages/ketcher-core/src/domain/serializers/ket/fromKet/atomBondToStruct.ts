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
  Atom,
  type AtomAttributes,
  type AtomQueryProperties,
} from 'domain/entities/atom';
import { Bond, type BondAttributes } from 'domain/entities/bond';
import { Elements, CUSTOM_QUERY_MAX_LENGTH } from 'domain/constants';
import { ifDefined } from 'utilities';

function assertCustomQueryLength(customQuery: string, context: string): void {
  if (customQuery.length > CUSTOM_QUERY_MAX_LENGTH) {
    throw new Error(
      `${context} custom query exceeds the maximum allowed length of ${CUSTOM_QUERY_MAX_LENGTH} characters (got ${customQuery.length})`,
    );
  }
}

export function atomToStruct(source) {
  const params: Partial<AtomAttributes> = {};

  const queryAttribute: Array<keyof AtomQueryProperties> = [
    'aromaticity',
    'ringMembership',
    'connectivity',
    'ringSize',
    'chirality',
    'customQuery',
  ];
  if (source.type === 'atom-list') {
    params.label = 'L#';
    const ids = source.elements
      .map((el) => Elements.get(el)?.number)
      .filter(Boolean) as number[];
    ifDefined(params, 'atomList', {
      ids,
      notList: source.notList,
    });
  } else {
    ifDefined(params, 'label', source.label);
    // reaction
    ifDefined(params, 'aam', source.mapping);
  }
  ifDefined(params, 'alias', source.alias);
  ifDefined(params, 'pp', {
    x: source.location[0],
    y: -source.location[1],
    z: source.location[2] || 0,
  });
  ifDefined(params, 'charge', source.charge);
  ifDefined(params, 'explicitValence', source.explicitValence);
  ifDefined(params, 'isotope', source.isotope);
  ifDefined(params, 'radical', source.radical);
  ifDefined(params, 'cip', source.cip);
  ifDefined(params, 'attachmentPoints', source.attachmentPoints);
  // stereo
  ifDefined(params, 'stereoLabel', source.stereoLabel);
  ifDefined(params, 'stereoParity', source.stereoParity);
  ifDefined(params, 'weight', source.weight);
  // query
  ifDefined(params, 'ringBondCount', source.ringBondCount);
  ifDefined(params, 'substitutionCount', source.substitutionCount);
  ifDefined(params, 'unsaturatedAtom', Number(Boolean(source.unsaturatedAtom)));
  ifDefined(params, 'hCount', source.hCount);
  if (
    source.queryProperties &&
    Object.values(source.queryProperties).some((property) => property !== null)
  ) {
    if (typeof source.queryProperties.customQuery === 'string') {
      assertCustomQueryLength(source.queryProperties.customQuery, 'Atom');
    }
    params.queryProperties = {};
    const queryProperties = params.queryProperties;
    queryAttribute.forEach((attributeName) => {
      ifDefined(
        queryProperties,
        attributeName,
        source.queryProperties[attributeName],
      );
    });
  }

  // An atom with a custom query is always rendered as an "Any atom" (label "A").
  if (params.queryProperties?.customQuery) {
    params.label = 'A';
  }

  // reaction
  ifDefined(params, 'invRet', source.invRet);
  ifDefined(params, 'exactChangeFlag', Number(Boolean(source.exactChangeFlag)));
  // implicit hydrogens
  ifDefined(params, 'implicitHCount', source.implicitHCount);

  const newAtom = new Atom(params as AtomAttributes);
  newAtom.setInitiallySelected(source.selected);
  return newAtom;
}

/**
 *
 * @param source
 * @param atomOffset – if bond is a part of a fragment, then we need to consider atoms from previous fragment.
 * source.atoms contains numbers related to fragment, but we need to count atoms related to struct. Example:
 * fragments: [{
 *   atoms: [...],
 *   bonds: [...], this bonds point to atoms in the first fragment
 * }, {
 *   atoms: [...],
 *   bonds: [...], this bonds point to atoms in the second fragment
 * }]
 * When we add bonds from second fragment we need to count atoms from fragments[0].atoms.length + 1, not from zero
 * @returns newly created Bond
 */
export function bondToStruct(source, atomOffset = 0) {
  const params: Partial<BondAttributes> = {};

  ifDefined(params, 'type', source.type);
  ifDefined(params, 'topology', source.topology);
  ifDefined(params, 'reactingCenterStatus', source.center);
  ifDefined(params, 'stereo', source.stereo);
  ifDefined(params, 'cip', source.cip);
  if (typeof source.customQuery === 'string') {
    assertCustomQueryLength(source.customQuery, 'Bond');
  }
  ifDefined(params, 'customQuery', source.customQuery);
  ifDefined(params, 'begin', source.atoms[0] + atomOffset);
  ifDefined(params, 'end', source.atoms[1] + atomOffset);
  ifDefined(params, 'initiallySelected', source.selected);

  const newBond = new Bond(params as BondAttributes);
  newBond.setInitiallySelected(source.selected);
  return newBond;
}
