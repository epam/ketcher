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

import {
  Atom,
  type AtomAttributes,
  type AtomQueryProperties,
} from 'domain/entities/atom';
import { Bond, type BondAttributes } from 'domain/entities/bond';
import { Elements, CUSTOM_QUERY_MAX_LENGTH } from 'domain/constants';
import { ifDef } from 'utilities';

function assertCustomQueryLength(customQuery: string, context: string): void {
  if (customQuery.length > CUSTOM_QUERY_MAX_LENGTH) {
    throw new Error(
      `${context} custom query exceeds the maximum allowed length of ${CUSTOM_QUERY_MAX_LENGTH} characters (got ${customQuery.length})`,
    );
  }
}

export function atomToStruct(source) {
  const parameters: Partial<AtomAttributes> = {};

  const queryAttribute: Array<keyof AtomQueryProperties> = [
    'aromaticity',
    'ringMembership',
    'connectivity',
    'ringSize',
    'chirality',
    'customQuery',
  ];
  if (source.type === 'atom-list') {
    parameters.label = 'L#';
    const ids = source.elements
      .map((element) => Elements.get(element)?.number)
      .filter(Boolean) as number[];
    ifDef(parameters, 'atomList', {
      ids,
      notList: source.notList,
    });
  } else {
    ifDef(parameters, 'label', source.label);
    // reaction
    ifDef(parameters, 'aam', source.mapping);
  }
  ifDef(parameters, 'alias', source.alias);
  ifDef(parameters, 'pp', {
    x: source.location[0],
    y: -source.location[1],
    z: source.location[2] || 0,
  });
  ifDef(parameters, 'charge', source.charge);
  ifDef(parameters, 'explicitValence', source.explicitValence);
  ifDef(parameters, 'isotope', source.isotope);
  ifDef(parameters, 'radical', source.radical);
  ifDef(parameters, 'cip', source.cip);
  ifDef(parameters, 'attachmentPoints', source.attachmentPoints);
  // stereo
  ifDef(parameters, 'stereoLabel', source.stereoLabel);
  ifDef(parameters, 'stereoParity', source.stereoParity);
  ifDef(parameters, 'weight', source.weight);
  // query
  ifDef(parameters, 'ringBondCount', source.ringBondCount);
  ifDef(parameters, 'substitutionCount', source.substitutionCount);
  ifDef(parameters, 'unsaturatedAtom', Number(Boolean(source.unsaturatedAtom)));
  ifDef(parameters, 'hCount', source.hCount);
  if (
    source.queryProperties &&
    Object.values(source.queryProperties).some((property) => property !== null)
  ) {
    if (typeof source.queryProperties.customQuery === 'string') {
      assertCustomQueryLength(source.queryProperties.customQuery, 'Atom');
    }
    parameters.queryProperties = {};
    const queryProperties = parameters.queryProperties;
    queryAttribute.forEach((attributeName) => {
      ifDef(
        queryProperties,
        attributeName,
        source.queryProperties[attributeName],
      );
    });
  }

  // An atom with a custom query is always rendered as an "Any atom" (label "A").
  if (parameters.queryProperties?.customQuery) {
    parameters.label = 'A';
  }

  // reaction
  ifDef(parameters, 'invRet', source.invRet);
  ifDef(parameters, 'exactChangeFlag', Number(Boolean(source.exactChangeFlag)));
  // implicit hydrogens
  ifDef(parameters, 'implicitHCount', source.implicitHCount);

  const newAtom = new Atom(parameters as AtomAttributes);
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
  const parameters: Partial<BondAttributes> = {};

  ifDef(parameters, 'type', source.type);
  ifDef(parameters, 'topology', source.topology);
  ifDef(parameters, 'reactingCenterStatus', source.center);
  ifDef(parameters, 'stereo', source.stereo);
  ifDef(parameters, 'cip', source.cip);
  if (typeof source.customQuery === 'string') {
    assertCustomQueryLength(source.customQuery, 'Bond');
  }
  ifDef(parameters, 'customQuery', source.customQuery);
  ifDef(parameters, 'begin', source.atoms[0] + atomOffset);
  ifDef(parameters, 'end', source.atoms[1] + atomOffset);
  ifDef(parameters, 'initiallySelected', source.selected);

  const newBond = new Bond(parameters as BondAttributes);
  newBond.setInitiallySelected(source.selected);
  return newBond;
}
