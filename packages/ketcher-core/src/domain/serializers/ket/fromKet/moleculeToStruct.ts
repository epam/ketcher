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
  AttachmentPoints,
  type AtomAttributes,
} from 'domain/entities/atom';
import { SGroup } from 'domain/entities/sgroup';
import { Struct } from 'domain/entities/struct';
import { SGroupAttachmentPoint } from 'domain/entities/sGroupAttachmentPoint';
import { RGroupAttachmentPoint } from 'domain/entities/rgroupAttachmentPoint';
import { ifDefined } from 'utilities';
import { mergeFragmentsToStruct } from './mergeFragmentsToStruct';
import type { initiallySelectedType } from 'domain/entities/BaseMicromoleculeEntity';
import { atomToStruct, bondToStruct } from './atomBondToStruct';
import type {
  KetItem,
  KetMoleculeNode,
  KetRgLabelNode,
  KetSGroupAttachmentPointNode,
  KetSGroupNode,
} from '../types';

export function toRlabel(values: number[]): number {
  let res = 0;
  values.forEach((val) => {
    const rgi = val - 1;
    res |= 1 << rgi;
  });
  return res;
}

type KetMoleculeItem = KetItem & {
  atoms?: KetMoleculeNode['atoms'];
  bonds?: KetMoleculeNode['bonds'];
  sgroups?: KetMoleculeNode['sgroups'];
  properties?: KetMoleculeNode['properties'];
};

export function moleculeToStruct(ketItem: KetMoleculeItem): Struct {
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
      // Drop dangling atom references (atom ids absent from the struct). A malformed
      // file can reference a non-existent atom; without this the whole S-group is later
      // silently discarded when the struct is reconstructed/cloned (Struct.clone).
      // Mirrors the MOL parser (SGroup.filter + empty-group removal in mol/v2000.ts).
      const hasOriginalAtoms = sgroup.atoms.length > 0;
      sgroup.atoms = sgroup.atoms.filter((atomId) => struct.atoms.has(atomId));
      if (hasOriginalAtoms && sgroup.atoms.length === 0) {
        return; // all references were invalid — skip this malformed S-group
      }
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

export function rglabelToStruct(source: KetRgLabelNode): Atom {
  const params: AtomAttributes = { label: 'R#' };
  const [x = 0, y = 0, z = 0] = source.location ?? [0, 0, 0];
  ifDefined(params, 'pp', {
    x,
    y: -y,
    z,
  });
  ifDefined(params, 'attachmentPoints', source.attachmentPoints);
  const rglabel = toRlabel(
    (source.$refs ?? []).map((el) => parseInt(el.slice(3), 10)),
  );
  ifDefined(params, 'rglabel', rglabel);
  const newAtom = new Atom(params);
  newAtom.setInitiallySelected(source.selected);
  return newAtom;
}

function addRGroupAttachmentPointsToStruct(
  struct: Struct,
  attachedAtomId: number,
  attachmentPoints: AttachmentPoints | null | undefined,
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
      new RGroupAttachmentPoint(attachedAtomId, 'secondary', initiallySelected),
    );
  }
  rgroupAttachmentPoints.forEach((rgroupAttachmentPoint) => {
    struct.rgroupAttachmentPoints.add(rgroupAttachmentPoint);
  });
}

type KetAttachmentPoint = KetSGroupAttachmentPointNode & {
  attachmentAtom: number;
};

export function sgroupToStruct(source: KetSGroupNode): SGroup {
  const sgroupType = source.type ?? 'GEN';
  const sgroup = new SGroup(sgroupType);
  ifDefined(sgroup, 'atoms', source.atoms);
  switch (sgroupType) {
    case 'MUL': {
      ifDefined(sgroup.data, 'mul', source.mul);
      break;
    }
    case 'SRU': {
      ifDefined(sgroup.data, 'subscript', source.subscript);
      ifDefined(
        sgroup.data,
        'connectivity',
        source.connectivity?.toLowerCase(),
      );
      break;
    }
    case 'COP': {
      ifDefined(sgroup.data, 'subtype', source.subtype);
      ifDefined(
        sgroup.data,
        'connectivity',
        source.connectivity?.toLowerCase(),
      );
      break;
    }
    case 'SUP': {
      ifDefined(sgroup.data, 'name', source.name);
      ifDefined(sgroup.data, 'expanded', source.expanded);
      ifDefined(sgroup.data, 'class', source.class);
      ifDefined(sgroup, 'id', source.id);
      source.attachmentPoints?.forEach(
        (sourceAttachmentPoint, sourceAttachmentPointIndex: number) => {
          const { attachmentAtom } = sourceAttachmentPoint;
          if (typeof attachmentAtom !== 'number') {
            return;
          }
          sgroup.addAttachmentPoint(
            sgroupAttachmentPointToStruct(
              {
                ...sourceAttachmentPoint,
                attachmentAtom,
              },
              sourceAttachmentPointIndex + 1,
            ),
          );
        },
      );
      break;
    }
    case 'DAT': {
      ifDefined(sgroup.data, 'absolute', source.placement);
      ifDefined(sgroup.data, 'attached', source.display);
      ifDefined(sgroup.data, 'context', source.context);
      ifDefined(sgroup.data, 'fieldName', source.fieldName);
      ifDefined(sgroup.data, 'fieldValue', source.fieldData);
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
    attachmentId && !Number.isNaN(Number(attachmentId))
      ? Number(attachmentId)
      : attachmentPointNumber,
  );
}
