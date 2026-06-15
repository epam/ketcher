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

import { Atom, AttachmentPoints } from 'domain/entities/atom';
import { SGroup } from 'domain/entities/sgroup';
import { Struct } from 'domain/entities/struct';
import { SGroupAttachmentPoint } from 'domain/entities/sGroupAttachmentPoint';
import { RGroupAttachmentPoint } from 'domain/entities/rgroupAttachmentPoint';
import { ifDef } from 'utilities';
import { mergeFragmentsToStruct } from './mergeFragmentsToStruct';
import type { initiallySelectedType } from 'domain/entities/BaseMicromoleculeEntity';
import { atomToStruct, bondToStruct } from './atomBondToStruct';

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
      if (!atom.type || atom.type === 'atom-list') {
        atomId = struct.atoms.add(atomToStruct(atom));
      }
      if (atomId !== null) {
        addRGroupAttachmentPointsToStruct(
          struct,
          atomId,
          atom.attachmentPoints,
          atom.selected,
        );
      }
    });
  }

  if (ketItem.bonds) {
    ketItem.bonds.forEach((bond) => struct.bonds.add(bondToStruct(bond)));
  }

  if (ketItem.sgroups) {
    ketItem.sgroups.forEach((sgroupData) => {
      const sgroup = sgroupToStruct(sgroupData);
      const id = struct.sgroups.add(sgroup);
      sgroup.id = id;
    });
  }

  struct.initHalfBonds();
  struct.initNeighbors();
  struct.markFragments(ketItem.properties);
  struct.bindSGroupsToFunctionalGroups();

  return struct;
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
  const newAtom = new Atom(params);
  newAtom.setInitiallySelected(source.selected);
  return newAtom;
}

function addRGroupAttachmentPointsToStruct(
  struct: Struct,
  attachedAtomId: number,
  attachmentPoints: AttachmentPoints | null,
  initiallySelected?: initiallySelectedType,
) {
  const rgroupAttachmentPoints: RGroupAttachmentPoint[] = [];
  if (attachmentPoints === AttachmentPoints.FirstSideOnly) {
    rgroupAttachmentPoints.push(
      new RGroupAttachmentPoint(attachedAtomId, 'primary', initiallySelected),
    );
  } else if (attachmentPoints === AttachmentPoints.SecondSideOnly) {
    rgroupAttachmentPoints.push(
      new RGroupAttachmentPoint(attachedAtomId, 'secondary', initiallySelected),
    );
  } else if (attachmentPoints === AttachmentPoints.BothSides) {
    rgroupAttachmentPoints.push(
      new RGroupAttachmentPoint(attachedAtomId, 'primary', initiallySelected),
    );
    rgroupAttachmentPoints.push(
      new RGroupAttachmentPoint(attachedAtomId, 'secondary', initiallySelected),
    );
  }
  rgroupAttachmentPoints.forEach((rgroupAttachmentPoint) => {
    struct.rgroupAttachmentPoints.add(rgroupAttachmentPoint);
  });
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
    case 'MUL': {
      ifDef(sgroup.data, 'mul', source.mul);
      break;
    }
    case 'SRU': {
      ifDef(sgroup.data, 'subscript', source.subscript);
      ifDef(sgroup.data, 'connectivity', source.connectivity.toLowerCase());
      break;
    }
    case 'COP': {
      ifDef(sgroup.data, 'subtype', source.subtype);
      ifDef(sgroup.data, 'connectivity', source.connectivity.toLowerCase());
      break;
    }
    case 'SUP': {
      ifDef(sgroup.data, 'name', source.name);
      ifDef(sgroup.data, 'expanded', source.expanded);
      ifDef(sgroup.data, 'class', source.class);
      ifDef(sgroup, 'id', source.id);
      source.attachmentPoints?.forEach(
        (
          sourceAttachmentPoint: KetAttachmentPoint,
          sourceAttachmentPointIndex: number,
        ) => {
          sgroup.addAttachmentPoint(
            sgroupAttachmentPointToStruct(
              sourceAttachmentPoint,
              sourceAttachmentPointIndex + 1,
            ),
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
    case 'GEN':
    default:
      break;
  }
  return sgroup;
}

function sgroupAttachmentPointToStruct(
  source: KetAttachmentPoint,
  attachmentPointNumber?: number,
): SGroupAttachmentPoint {
  const atomId = source.attachmentAtom;
  const leavingAtomId = source.leavingAtom;
  const attachmentId = source.attachmentId;

  return new SGroupAttachmentPoint(
    atomId,
    leavingAtomId,
    attachmentId,
    attachmentId && !isNaN(Number(attachmentId))
      ? Number(attachmentId)
      : attachmentPointNumber,
  );
}
