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
  Bond,
  SGroup,
  Struct,
  SGroupAttachmentPoint,
  RGroupAttachmentPoint,
  AttachmentPoints,
  AtomQueryProperties,
} from 'domain/entities';

import { Elements } from 'domain/constants';
import { ifDef } from 'utilities';
import { mergeFragmentsToStruct } from './mergeFragmentsToStruct';

export function toRlabel(values) {
  let res = 0;
  values.forEach((val) => {
    const rgi = val - 1;
    res |= 1 << rgi;
  });
  return res;
}

export function moleculeToStruct(ketItem: any): Struct {
  const struct = mergeFragmentsToStruct(ketItem, new Struct());

  if (ketItem.atoms) {
    ketItem.atoms.forEach((atom) => {
      let atomId: number | null = null;
      if (atom.type === 'rg-label') {
        atomId = struct.atoms.add(rglabelToStruct(atom));
      }
      if (atom.type === 'atom-list') {
        atomId = struct.atoms.add(atomListToStruct(atom));
      }
      if (!atom.type) {
        atomId = struct.atoms.add(atomToStruct(atom));
      }
      if (atomId !== null) {
        addRGroupAttachmentPointsToStruct(
          struct,
          atomId,
          atom.attachmentPoints,
        );
      }
    });
  }

  if (ketItem.bonds) {
    ketItem.bonds.forEach((bond) => struct.bonds.add(bondToStruct(bond)));
  }

  if (ketItem.sgroups) {
    ketItem.sgroups.forEach((sgroup) =>
      struct.sgroups.add(sgroupToStruct(sgroup)),
    );
  }

  struct.initHalfBonds();
  struct.initNeighbors();
  struct.markFragments(ketItem.properties);
  struct.bindSGroupsToFunctionalGroups();

  return struct;
}

export function atomToStruct(source) {
  const params: any = {};

  const queryAttribute: Array<keyof AtomQueryProperties> = [
    'aromaticity',
    'degree',
    'ringMembership',
    'connectivity',
    'ringSize',
    'ringConnectivity',
    'chirality',
    'atomicMass',
  ];
  ifDef(params, 'label', source.label);
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
  ifDef(params, 'aam', source.mapping);
  ifDef(params, 'invRet', source.invRet);
  ifDef(params, 'exactChangeFlag', Number(Boolean(source.exactChangeFlag)));
  // implicit hydrogens
  ifDef(params, 'implicitHCount', source.implicitHCount);
  return new Atom(params);
}

export function rglabelToStruct(source) {
  const params: any = {};
  params.label = 'R#';
  ifDef(params, 'pp', {
    x: source.location[0],
    y: -source.location[1],
    z: source.location[2] || 0.0,
  });
  ifDef(params, 'attachmentPoints', source.attachmentPoints);
  const rglabel = toRlabel(source.$refs.map((el) => parseInt(el.slice(3))));
  ifDef(params, 'rglabel', rglabel);
  return new Atom(params);
}

export function atomListToStruct(source) {
  const params: any = {};
  params.label = 'L#';
  ifDef(params, 'pp', {
    x: source.location[0],
    y: -source.location[1],
    z: source.location[2] || 0.0,
  });
  ifDef(params, 'attachmentPoints', source.attachmentPoints);
  const ids = source.elements
    .map((el) => Elements.get(el)?.number)
    .filter((id) => id);
  ifDef(params, 'atomList', {
    ids,
    notList: source.notList,
  });
  return new Atom(params);
}

function addRGroupAttachmentPointsToStruct(
  struct: Struct,
  attachedAtomId: number,
  attachmentPoints: AttachmentPoints | null,
) {
  const rgroupAttachmentPoints: RGroupAttachmentPoint[] = [];
  if (attachmentPoints === AttachmentPoints.FirstSideOnly) {
    rgroupAttachmentPoints.push(
      new RGroupAttachmentPoint(attachedAtomId, 'primary'),
    );
  } else if (attachmentPoints === AttachmentPoints.SecondSideOnly) {
    rgroupAttachmentPoints.push(
      new RGroupAttachmentPoint(attachedAtomId, 'secondary'),
    );
  } else if (attachmentPoints === AttachmentPoints.BothSides) {
    rgroupAttachmentPoints.push(
      new RGroupAttachmentPoint(attachedAtomId, 'primary'),
    );
    rgroupAttachmentPoints.push(
      new RGroupAttachmentPoint(attachedAtomId, 'secondary'),
    );
  }
  rgroupAttachmentPoints.forEach((rgroupAttachmentPoint) => {
    struct.rgroupAttachmentPoints.add(rgroupAttachmentPoint);
  });
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
  const params: any = {};

  ifDef(params, 'type', source.type);
  ifDef(params, 'topology', source.topology);
  ifDef(params, 'reactingCenterStatus', source.center);
  ifDef(params, 'stereo', source.stereo);
  ifDef(params, 'cip', source.cip);
  // if (params.stereo)
  // 	params.stereo = params.stereo > 1 ? params.stereo * 2 : params.stereo;
  // params.xxx = 0;
  ifDef(params, 'begin', source.atoms[0] + atomOffset);
  ifDef(params, 'end', source.atoms[1] + atomOffset);

  return new Bond(params);
}

type KetAttachmentPoint = {
  attachmentAtom: number;
  leavingAtom?: number;
  attachmentId?: string;
};

export function sgroupToStruct(source) {
  const sgroup = new SGroup(source.type);
  ifDef(sgroup, 'atoms', source.atoms);
  switch (source.type) {
    case 'GEN':
      break;
    case 'MUL': {
      ifDef(sgroup.data, 'mul', source.mul);
      break;
    }
    case 'SRU': {
      ifDef(sgroup.data, 'subscript', source.subscript);
      ifDef(sgroup.data, 'connectivity', source.connectivity.toLowerCase());
      break;
    }
    case 'SUP': {
      ifDef(sgroup.data, 'name', source.name);
      ifDef(sgroup.data, 'expanded', source.expanded);
      ifDef(sgroup, 'id', source.id);
      source.attachmentPoints?.forEach(
        (sourceAttachmentPoint: KetAttachmentPoint) => {
          sgroup.addAttachmentPoint(
            sgroupAttachmentPointToStruct(sourceAttachmentPoint),
          );
        },
      );
      break;
    }
    case 'DAT': {
      ifDef(sgroup.data, 'absolute', source.placement);
      ifDef(sgroup.data, 'attached', source.display);
      ifDef(sgroup.data, 'context', source.context);
      ifDef(sgroup.data, 'fieldName', source.fieldName);
      ifDef(sgroup.data, 'fieldValue', source.fieldData);
      break;
    }
    default:
      break;
  }
  return sgroup;
}

function sgroupAttachmentPointToStruct(
  source: KetAttachmentPoint,
): SGroupAttachmentPoint {
  const atomId = source.attachmentAtom;
  const leavingAtomId = source.leavingAtom;
  const attachmentId = source.attachmentId;
  return new SGroupAttachmentPoint(atomId, leavingAtomId, attachmentId);
}
