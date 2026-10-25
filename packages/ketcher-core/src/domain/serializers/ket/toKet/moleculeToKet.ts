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

import type { Atom } from 'domain/entities/atom';
import type { BaseMonomer } from 'domain/entities/BaseMonomer';
import type { Bond } from 'domain/entities/bond';
import { SGroup } from 'domain/entities/sgroup';
import type { Struct } from 'domain/entities/struct';
import type { SGroupAttachmentPoint } from 'domain/entities/sGroupAttachmentPoint';
import { Vec2 } from 'domain/entities/vec2';
import { switchIntoChemistryCoordSystem } from 'domain/serializers/ket/helpers';
import { CUSTOM_QUERY_MAX_LENGTH } from 'domain/constants';
import { getAttachmentPointLabelWithBinaryShift } from 'domain/helpers/attachmentPointCalculations';
import { isNumber } from 'lodash';
import type {
  KetAtomNode,
  KetBondNode,
  KetMoleculeNode,
  KetRgLabelNode,
  KetSGroupAttachmentPointNode,
  KetSGroupNode,
} from './types';

import { ifDefined } from 'utilities';

function assertCustomQueryLength(customQuery: string, context: string): void {
  if (customQuery.length > CUSTOM_QUERY_MAX_LENGTH) {
    throw new Error(
      `${context} custom query exceeds the maximum allowed length of ${CUSTOM_QUERY_MAX_LENGTH} characters (got ${customQuery.length})`,
    );
  }
}

function fromRlabel(rg: number): number[] {
  const res: number[] = [];
  let rgi;
  let val;
  for (rgi = 0; rgi < 32; rgi++) {
    if (rg & (1 << rgi)) {
      val = rgi + 1;
      res.push(val); // push the string
    }
  }
  return res;
}

export interface MoleculesSelection {
  atoms: Set<number>;
  bonds: Set<number>;
}

export function moleculeToKet(
  struct: Struct,
  monomer?: BaseMonomer,
): KetMoleculeNode {
  const body: Omit<KetMoleculeNode, 'type'> = {
    atoms: Array.from(struct.atoms.values()).map((atom) => {
      // For the monomers we need to serialize leaving groups as usual atom label like H, O, etc
      if (atom.label === 'R#' && !monomer) return rglabelToKet(atom);
      return atomToKet(atom, monomer);
    }),
  };

  if (struct.bonds.size !== 0) {
    body.bonds = Array.from(struct.bonds.values()).map(bondToKet);
  }

  if (struct.sgroups.size !== 0) {
    body.sgroups = Array.from(struct.sgroups.values()).map((sGroup) =>
      sgroupToKet(struct, sGroup),
    );
  }

  const fragment = struct.frags.get(0);
  if (fragment) {
    ifDefined(body, 'stereoFlagPosition', fragment.stereoFlagPosition, null);
    if (fragment.properties) {
      body.properties = fragment.properties;
    }
  }
  return {
    type: 'molecule',
    ...body,
  };
}

function atomToKet(source: Atom, monomer?: BaseMonomer): KetAtomNode {
  const result: KetAtomNode = {};

  if (source.label !== 'L#') {
    ifDefined(
      result,
      'label',
      source.label === 'R#' && monomer
        ? monomer.monomerItem.props.MonomerCaps?.[
            getAttachmentPointLabelWithBinaryShift(source.rglabel ?? 0)
          ]
        : source.label,
    );
    // reaction
    ifDefined(result, 'mapping', source.aam, 0);
  } else if (source.atomList) {
    result.type = 'atom-list';
    ifDefined(result, 'elements', source.atomList.labelList());
    ifDefined(result, 'notList', source.atomList.notList, false);
  }

  ifDefined(result, 'alias', source.alias);
  const position: Vec2 = switchIntoChemistryCoordSystem(
    new Vec2(source.pp.x, source.pp.y, source.pp.z),
  );
  ifDefined(result, 'location', [position.x, position.y, position.z]);
  ifDefined(result, 'charge', source.charge);
  ifDefined(result, 'explicitValence', source.explicitValence, -1);
  ifDefined(result, 'isotope', source.isotope);
  ifDefined(result, 'radical', source.radical, 0);
  ifDefined(result, 'attachmentPoints', source.attachmentPoints, 0);
  ifDefined(result, 'cip', source.cip, '');
  ifDefined(result, 'selected', source.getInitiallySelected());
  // stereo
  ifDefined(result, 'stereoLabel', source.stereoLabel, null);
  ifDefined(result, 'stereoParity', source.stereoParity, 0);
  // query
  ifDefined(result, 'ringBondCount', source.ringBondCount, 0);
  ifDefined(result, 'substitutionCount', source.substitutionCount, 0);
  ifDefined(result, 'unsaturatedAtom', !!source.unsaturatedAtom, false);
  ifDefined(result, 'hCount', source.hCount, 0);
  // query properties
  if (
    Object.values(source.queryProperties).some((property) => property !== null)
  ) {
    if (typeof source.queryProperties.customQuery === 'string') {
      assertCustomQueryLength(source.queryProperties.customQuery, 'Atom');
    }
    result.queryProperties = {};
    const queryProperties = result.queryProperties;
    Object.keys(source.queryProperties).forEach((name) => {
      ifDefined(queryProperties, name, source.queryProperties[name]);
    });
  }
  ifDefined(result, 'invRet', source.invRet, 0);
  ifDefined(result, 'exactChangeFlag', !!source.exactChangeFlag, false);
  ifDefined(result, 'implicitHCount', source.implicitHCount);
  return result;
}

function rglabelToKet(source: Atom): KetRgLabelNode {
  const result: KetRgLabelNode = {
    type: 'rg-label',
  };
  const position: Vec2 = switchIntoChemistryCoordSystem(
    new Vec2(source.pp.x, source.pp.y, source.pp.z),
  );
  ifDefined(result, 'location', [position.x, position.y, position.z]);
  ifDefined(result, 'attachmentPoints', source.attachmentPoints, 0);

  const refsToRGroups = fromRlabel(source.rglabel ?? 0).map(
    (rgnumber) => `rg-${rgnumber}`,
  );
  ifDefined(result, '$refs', refsToRGroups);
  ifDefined(result, 'selected', source.getInitiallySelected());

  return result;
}

function bondToKet(source: Bond): KetBondNode {
  const result: KetBondNode = {};
  if (source.customQuery) {
    assertCustomQueryLength(source.customQuery, 'Bond');
    ifDefined(result, 'atoms', [source.begin, source.end]);
    ifDefined(result, 'customQuery', source.customQuery);
  } else {
    ifDefined(result, 'type', source.type);
    ifDefined(result, 'atoms', [source.begin, source.end]);
    ifDefined(result, 'stereo', source.stereo, 0);
    ifDefined(result, 'topology', source.topology, 0);
    ifDefined(result, 'center', source.reactingCenterStatus, 0);
    ifDefined(result, 'cip', source.cip, '');
  }
  ifDefined(result, 'selected', source.getInitiallySelected());
  return result;
}

function sgroupToKet(struct: Struct, source: SGroup): KetSGroupNode {
  const result: KetSGroupNode = {};

  ifDefined(result, 'type', source.type);
  ifDefined(result, 'atoms', source.atoms);

  switch (source.type) {
    case 'MUL': {
      ifDefined(result, 'mul', source.data.mul || 1);
      break;
    }
    case 'SRU': {
      ifDefined(result, 'subscript', source.data.subscript || 'n');
      ifDefined(
        result,
        'connectivity',
        source.data.connectivity.toUpperCase() || 'HT',
      );
      break;
    }
    case 'COP': {
      ifDefined(
        result,
        'subtype',
        source.data.subtype ? source.data.subtype.toUpperCase() : null,
      );
      ifDefined(
        result,
        'connectivity',
        source.data.connectivity.toUpperCase() || 'HT',
      );
      break;
    }
    case 'SUP': {
      ifDefined(result, 'name', source.data.name || '');
      ifDefined(result, 'expanded', source.data.expanded);
      ifDefined(result, 'id', source.id);
      ifDefined(result, 'class', source.data.class);
      ifDefined(
        result,
        'attachmentPoints',
        source.getAttachmentPoints().map(sgroupAttachmentPointToKet),
        [],
      );
      break;
    }
    case 'DAT': {
      const data = source.data;
      ifDefined(result, 'placement', data.absolute, true);
      ifDefined(result, 'display', data.attached, false);
      ifDefined(result, 'context', data.context);
      ifDefined(result, 'fieldName', data.fieldName);
      ifDefined(result, 'fieldData', data.fieldValue);
      ifDefined(result, 'bonds', SGroup.getBonds(struct, source));
      break;
    }
    case 'GEN':
    case 'queryComponent':
    default:
      break;
  }

  return result;
}

function sgroupAttachmentPointToKet(
  source: SGroupAttachmentPoint,
): KetSGroupAttachmentPointNode {
  const result: KetSGroupAttachmentPointNode = {};

  ifDefined(result, 'attachmentAtom', source.atomId);
  ifDefined(result, 'leavingAtom', source.leaveAtomId);
  ifDefined(
    result,
    'attachmentId',
    isNumber(source.attachmentPointNumber)
      ? source.attachmentPointNumber.toString()
      : source.attachmentId,
  );

  return result;
}
