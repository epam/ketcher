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

import { SGroup, Struct } from 'domain/entities';

import { ifDef } from 'utilities';

function fromRlabel(rg) {
  const res: Array<any> = [];
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

export function moleculeToKet(struct: Struct): any {
  const body: any = {
    atoms: Array.from(struct.atoms.values()).map((atom) => {
      if (atom.label === 'R#') return rglabelToKet(atom);
      if (atom.label === 'L#') return atomListToKet(atom);
      return atomToKet(atom);
    }),
  };

  if (struct.bonds.size !== 0) {
    body.bonds = Array.from(struct.bonds.values()).map(bondToKet);
  }

  if (struct.sgroups.size !== 0) {
    body.sgroups = Array.from(struct.sgroups.values()).map((sGroup) =>
      sgroupToKet(struct, sGroup)
    );
  }

  const fragment = struct.frags.get(0);
  if (fragment) {
    ifDef(body, 'stereoFlagPosition', fragment.stereoFlagPosition, null);
  }
  return {
    type: 'molecule',
    ...body,
  };
}

function atomToKet(source) {
  const result = {};
  ifDef(result, 'label', source.label);
  ifDef(result, 'alias', source.alias);
  ifDef(result, 'location', [source.pp.x, -source.pp.y, source.pp.z]);
  ifDef(result, 'charge', source.charge, 0);
  ifDef(result, 'explicitValence', source.explicitValence, -1);
  ifDef(result, 'isotope', source.isotope, 0);
  ifDef(result, 'radical', source.radical, 0);
  ifDef(result, 'attachmentPoints', source.attpnt, 0);
  ifDef(result, 'cip', source.cip, '');
  // stereo
  ifDef(result, 'stereoLabel', source.stereoLabel, null);
  ifDef(result, 'stereoParity', source.stereoCare, 0);
  ifDef(result, 'weight', source.weight, 0);
  // query
  ifDef(result, 'ringBondCount', source.ringBondCount, 0);
  ifDef(result, 'substitutionCount', source.substitutionCount, 0);
  ifDef(result, 'unsaturatedAtom', !!source.unsaturatedAtom, false);
  ifDef(result, 'hCount', source.hCount, 0);
  // reaction
  ifDef(result, 'mapping', parseInt(source.aam), 0);
  ifDef(result, 'invRet', source.invRet, 0);
  ifDef(result, 'exactChangeFlag', !!source.exactChangeFlag, false);
  ifDef(result, 'implicitHCount', source.implicitHCount);
  return result;
}

function rglabelToKet(source) {
  const result = {
    type: 'rg-label',
  };
  ifDef(result, 'location', [source.pp.x, -source.pp.y, source.pp.z]);
  ifDef(result, 'attachmentPoints', source.attpnt, 0);

  const refsToRGroups = fromRlabel(source.rglabel).map(
    (rgnumber) => `rg-${rgnumber}`
  );
  ifDef(result, '$refs', refsToRGroups);

  return result;
}

function atomListToKet(source) {
  const result = {
    type: 'atom-list',
  };
  ifDef(result, 'location', [source.pp.x, -source.pp.y, source.pp.z]);
  ifDef(result, 'attachmentPoints', source.attpnt, 0);
  ifDef(result, 'elements', source.atomList.labelList());
  ifDef(result, 'notList', source.atomList.notList, false);
  return result;
}

function bondToKet(source) {
  const result = {};

  ifDef(result, 'type', source.type);
  ifDef(result, 'atoms', [source.begin, source.end]);
  ifDef(result, 'stereo', source.stereo, 0);
  ifDef(result, 'topology', source.topology, 0);
  ifDef(result, 'center', source.reactingCenterStatus, 0);
  ifDef(result, 'cip', source.cip, '');

  return result;
}

function sgroupToKet(struct, source) {
  const result = {};

  ifDef(result, 'type', source.type);
  ifDef(result, 'atoms', source.atoms);

  switch (source.type) {
    case 'GEN':
      break;
    case 'MUL': {
      ifDef(result, 'mul', source.data.mul || 1);
      break;
    }
    case 'SRU': {
      ifDef(result, 'subscript', source.data.subscript || 'n');
      ifDef(
        result,
        'connectivity',
        source.data.connectivity.toUpperCase() || 'ht'
      );
      break;
    }
    case 'SUP': {
      ifDef(result, 'name', source.data.name || '');
      ifDef(result, 'expanded', source.data.expanded);
      ifDef(result, 'id', source.id);
      break;
    }
    case 'DAT': {
      const data = source.data;
      ifDef(result, 'placement', data.absolute, true);
      ifDef(result, 'display', data.attached, false);
      ifDef(result, 'context', data.context);
      ifDef(result, 'fieldName', data.fieldName);
      ifDef(result, 'fieldData', data.fieldValue);
      ifDef(result, 'bonds', SGroup.getBonds(struct, source));
      break;
    }
    default:
      break;
  }

  return result;
}
