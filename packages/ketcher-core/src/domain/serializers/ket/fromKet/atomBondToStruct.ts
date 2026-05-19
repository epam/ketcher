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
import { Elements } from 'domain/constants';
import { ifDef } from 'utilities';

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
      .filter((id) => id);
    ifDef(params, 'atomList', {
      ids,
      notList: source.notList,
    });
  } else {
    ifDef(params, 'label', source.label);
    // reaction
    ifDef(params, 'aam', source.mapping);
  }
  ifDef(params, 'alias', source.alias);
  ifDef(params, 'pp', {
    x: source.location[0],
    y: -source.location[1],
    z: source.location[2] || 0.0,
  });
  ifDef(params, 'charge', source.charge);
  ifDef(params, 'explicitValence', source.explicitValence);
  ifDef(params, 'isotope', source.isotope);
  ifDef(params, 'radical', source.radical);
  ifDef(params, 'cip', source.cip);
  ifDef(params, 'attachmentPoints', source.attachmentPoints);
  // stereo
  ifDef(params, 'stereoLabel', source.stereoLabel);
  ifDef(params, 'stereoParity', source.stereoParity);
  ifDef(params, 'weight', source.weight);
  // query
  ifDef(params, 'ringBondCount', source.ringBondCount);
  ifDef(params, 'substitutionCount', source.substitutionCount);
  ifDef(params, 'unsaturatedAtom', Number(Boolean(source.unsaturatedAtom)));
  ifDef(params, 'hCount', source.hCount);
  if (
    source.queryProperties &&
    Object.values(source.queryProperties).some((property) => property !== null)
  ) {
    params.queryProperties = {};
    queryAttribute.forEach((attributeName) => {
      ifDef(
        params.queryProperties,
        attributeName,
        source.queryProperties[attributeName],
      );
    });
  }

  // reaction
  ifDef(params, 'invRet', source.invRet);
  ifDef(params, 'exactChangeFlag', Number(Boolean(source.exactChangeFlag)));
  // implicit hydrogens
  ifDef(params, 'implicitHCount', source.implicitHCount);

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

  ifDef(params, 'type', source.type);
  ifDef(params, 'topology', source.topology);
  ifDef(params, 'reactingCenterStatus', source.center);
  ifDef(params, 'stereo', source.stereo);
  ifDef(params, 'cip', source.cip);
  ifDef(params, 'customQuery', source.customQuery);
  ifDef(params, 'begin', source.atoms[0] + atomOffset);
  ifDef(params, 'end', source.atoms[1] + atomOffset);
  ifDef(params, 'initiallySelected', source.selected);

  const newBond = new Bond(params as BondAttributes);
  newBond.setInitiallySelected(source.selected);
  return newBond;
}
