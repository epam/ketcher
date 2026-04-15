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
  Pool,
  SGroup,
  Struct,
  Vec2,
  SGroupAttachmentPoint,
} from 'domain/entities';

import { SGroupMap, AtomMap, PostLoadHandler } from './mol.types';
import utils from './utils';
import assert from 'assert';

function readKeyValuePairs(
  str: string,
  valueString: boolean,
): Pool<string | number> {
  const ret = new Pool<string | number>();
  const partition = utils.partitionLineFixed(str, 3, true);
  const count = utils.parseDecimalInt(partition[0]);

  for (let i = 0; i < count; ++i) {
    const key = utils.parseDecimalInt(partition[2 * i + 1]) - 1;
    const value = valueString
      ? partition[2 * i + 2].trim()
      : utils.parseDecimalInt(partition[2 * i + 2]);

    ret.set(key, value);
  }

  return ret;
}

function readKeyMultiValuePairs(
  str: string,
  valueString: boolean,
): Array<[number, string | number]> {
  const ret: Array<[number, string | number]> = [];
  const partition = utils.partitionLineFixed(str, 3, true);
  const count = utils.parseDecimalInt(partition[0]);
  for (let i = 0; i < count; ++i) {
    ret.push([
      /* eslint-disable no-mixed-operators */
      utils.parseDecimalInt(partition[2 * i + 1]) - 1,
      valueString
        ? partition[2 * i + 2].trim()
        : utils.parseDecimalInt(partition[2 * i + 2]),
      /* eslint-enable no-mixed-operators */
    ]);
  }
  return ret;
}

function postLoadMul(sgroup: SGroup, mol?: Struct, atomMap?: AtomMap): void {
  if (!mol || !atomMap) return;

  sgroup.data.mul = sgroup.data.subscript - 0;
  const atomReductionMap: Record<number, number> = {};

  sgroup.atoms = SGroup.filterAtoms(sgroup.atoms, atomMap);
  sgroup.patoms = SGroup.filterAtoms(sgroup.patoms, atomMap);

  // mark repetitions for removal
  for (let k = 1; k < sgroup.data.mul; ++k) {
    for (let m = 0; m < sgroup.patoms.length; ++m) {
      const raid = sgroup.atoms[k * sgroup.patoms.length + m]; // eslint-disable-line no-mixed-operators
      if (raid < 0) continue; // eslint-disable-line no-continue
      if (sgroup.patoms[m] < 0) throw new Error('parent atom missing');
      atomReductionMap[raid] = sgroup.patoms[m]; // "merge" atom in parent
    }
  }
  sgroup.patoms = SGroup.removeNegative(sgroup.patoms);

  const patomsMap = identityMap(sgroup.patoms);

  const bondsToRemove: number[] = [];
  mol.bonds.forEach((bond, bid) => {
    const beginIn = bond.begin in atomReductionMap;
    const endIn = bond.end in atomReductionMap;
    const endInPatoms = bond.end in patomsMap;
    const beginInPatoms = bond.begin in patomsMap;
    if (
      (beginIn && endIn) ||
      (beginIn && endInPatoms) ||
      (endIn && beginInPatoms)
    ) {
      bondsToRemove.push(bid);
    } else if (beginIn) bond.begin = atomReductionMap[bond.begin];
    else if (endIn) bond.end = atomReductionMap[bond.end];
  });

  for (const bondId of bondsToRemove) {
    mol.bonds.delete(bondId);
  }
  for (const a in atomReductionMap) {
    mol.atoms.delete(+a);
    atomMap[a] = -1;
  }
  sgroup.atoms = sgroup.patoms;
  sgroup.patoms = null;
}

function postLoadSru(sgroup: SGroup): void {
  sgroup.data.connectivity = (sgroup.data.connectivity || 'EU')
    .trim()
    .toLowerCase();
  sgroup.data.subtype = (sgroup.data.subtype || '').trim().toLowerCase();
}

function postLoadSup(sgroup: SGroup): void {
  sgroup.data.name = (sgroup.data.subscript || '').trim();
  sgroup.data.subscript = '';
}

function postLoadGen(sgroup: SGroup, _mol?: Struct, _atomMap?: AtomMap): void {
  sgroup.data.connectivity = (sgroup.data.connectivity || 'eu')
    .trim()
    .toLowerCase();
  sgroup.data.subtype = (sgroup.data.subtype || '').trim().toLowerCase();
}

function postLoadDat(sgroup: SGroup, mol?: Struct): void {
  if (!sgroup.data.absolute && mol) {
    if (!sgroup.pp) {
      throw new Error('SGroup pp is not set');
    }
    sgroup.pp = sgroup.pp.add(SGroup.getMassCentre(mol, sgroup.atoms));
  }
}

function postLoadMon(_sgroup: SGroup): void {
  // TODO: Implement after adding MON type support
}

function postLoadMer(_sgroup: SGroup): void {
  // TODO: Implement after adding MER type support
}

function postLoadCop(sgroup: SGroup): void {
  sgroup.data.connectivity = (sgroup.data.connectivity || 'eu')
    .trim()
    .toLowerCase();
  sgroup.data.subtype = (sgroup.data.subtype || '').trim().toLowerCase();
}

function postLoadCro(_sgroup: SGroup): void {
  // TODO: Implement after adding CRO type support
}

function postLoadMod(_sgroup: SGroup): void {
  // TODO: Implement after adding MOD type support
}

function postLoadGra(_sgroup: SGroup): void {
  // TODO: Implement after adding GRA type support
}

function postLoadCom(_sgroup: SGroup): void {
  // TODO: Implement after adding COM type support
}

function postLoadMix(_sgroup: SGroup): void {
  // TODO: Implement after adding MIX type support
}

function postLoadFor(_sgroup: SGroup): void {
  // TODO: Implement after adding FOR type support
}

function postLoadAny(_sgroup: SGroup): void {
  // TODO: Implement after adding ANY type support
}

const postLoadMap: Record<string, PostLoadHandler> = {
  SUP: postLoadSup,
  MUL: postLoadMul,
  SRU: postLoadSru,
  MON: postLoadMon,
  MER: postLoadMer,
  COP: postLoadCop,
  CRO: postLoadCro,
  MOD: postLoadMod,
  GRA: postLoadGra,
  COM: postLoadCom,
  MIX: postLoadMix,
  FOR: postLoadFor,
  DAT: postLoadDat,
  ANY: postLoadAny,
  GEN: postLoadGen,
};

const allowedSGroupTypes = new Set(Object.keys(postLoadMap));

function loadSGroup(mol: Struct, sg: SGroup, atomMap: AtomMap): number {
  sg.id = mol.sgroups.add(sg);

  if (allowedSGroupTypes.has(sg.type)) {
    const handler = postLoadMap[sg.type];
    if (typeof handler === 'function') {
      handler(sg, mol, atomMap);
    }
  }

  for (const atomId of sg.atoms) {
    const atom = mol.atoms.get(atomId);
    if (atom) atom.sgs.add(sg.id);
  }

  if (sg.type === 'DAT') mol.sGroupForest.insert(sg, -1, []);
  else mol.sGroupForest.insert(sg);

  return sg.id;
}

function initSGroup(sGroups: SGroupMap, propData: string): void {
  const kv = readKeyValuePairs(propData, true);
  for (const [key, type] of kv) {
    const sg = new SGroup(type as string);
    (sg as SGroup & { number: number }).number = key;
    sGroups[key] = sg;
  }
}

function applySGroupProp(
  sGroups: SGroupMap,
  propName: string,
  propData: string,
  numeric?: boolean,
  core?: boolean,
): void {
  const kv = readKeyValuePairs(propData, !numeric);
  for (const key of kv.keys()) {
    (core ? sGroups[key] : sGroups[key].data)[propName] = kv.get(key);
  }
}

function applySGroupArrayProp(
  sGroups: SGroupMap,
  propName: string,
  propData: string,
  shift: number,
): void {
  const sid = utils.parseDecimalInt(propData.slice(1, 4)) - 1;
  const num = utils.parseDecimalInt(propData.slice(4, 8));
  let part = toIntArray(utils.partitionLineFixed(propData.slice(8), 3, true));

  if (part.length !== num) throw new Error('File format invalid');
  if (shift) part = part.map((v) => v + shift);

  sGroups[sid][propName] = sGroups[sid][propName].concat(part);
}

function applyDataSGroupName(sg: SGroup, name: string): void {
  sg.data.fieldName = name;
}

function applyDataSGroupExpand(sg: SGroup, expanded: boolean): void {
  sg.data.expanded = expanded;
}

function applyDataSGroupQuery(sg: SGroup, query: string): void {
  sg.data.query = query;
}

function applyDataSGroupQueryOp(sg: SGroup, queryOp: string): void {
  sg.data.queryOp = queryOp;
}

function applyDataSGroupDesc(sGroups: SGroupMap, propData: string): void {
  const split = utils.partitionLine(propData, [4, 31, 2, 20, 2, 3], false);
  const id = utils.parseDecimalInt(split[0]) - 1;
  const fieldName = split[1].trim();
  const fieldType = split[2].trim();
  const units = split[3].trim();
  const query = split[4].trim();
  const queryOp = split[5].trim();
  const sGroup = sGroups[id];
  sGroup.data.fieldType = fieldType;
  sGroup.data.fieldName = fieldName;
  sGroup.data.units = units;
  sGroup.data.query = query;
  sGroup.data.queryOp = queryOp;
}

function applyDataSGroupInfo(sg: SGroup, propData: string): void {
  const split = utils.partitionLine(
    propData,
    [
      10 /* x.x */, 10 /* y.y */, 4 /* eee */, 1 /* f */, 1 /* g */, 1 /* h */,
      3 /* i */, 3 /* jjj */, 3 /* kkk */, 3 /* ll */, 2 /* m */, 3 /* n */,
      2 /* oo */,
    ],
    false,
  );

  const x = parseFloat(split[0]);
  const y = parseFloat(split[1]);
  const attached = split[3].trim() === 'A';
  const absolute = split[4].trim() === 'A';
  const showUnits = split[5].trim() === 'U';
  const nCharsRaw = split[7].trim();
  const nCharsToDisplay =
    nCharsRaw === 'ALL' ? -1 : utils.parseDecimalInt(nCharsRaw);
  const tagChar = split[10].trim();
  const daspPos = utils.parseDecimalInt(split[11].trim());

  sg.pp = new Vec2(x, -y);
  sg.data.attached = attached;
  sg.data.absolute = absolute;
  sg.data.showUnits = showUnits;
  sg.data.nCharsToDisplay = nCharsToDisplay;
  sg.data.tagChar = tagChar;
  sg.data.daspPos = daspPos;
}

function applyDataSGroupInfoLine(sGroups: SGroupMap, propData: string): void {
  const id = utils.parseDecimalInt(propData.substr(0, 4)) - 1;
  const sg = sGroups[id];
  applyDataSGroupInfo(sg, propData.substr(5));
}

function applyDataSGroupData(
  sg: SGroup,
  data: string,
  finalize: boolean,
): void {
  sg.data.fieldValue = (sg.data.fieldValue || '') + data;
  if (finalize) {
    sg.data.fieldValue = trimRight(sg.data.fieldValue);
    if (
      sg.data.fieldValue.startsWith('"') &&
      sg.data.fieldValue.endsWith('"')
    ) {
      sg.data.fieldValue = sg.data.fieldValue.substr(
        1,
        sg.data.fieldValue.length - 2,
      );
    }
  }
}

function applyDataSGroupDataLine(
  sGroups: SGroupMap,
  propData: string,
  finalize: boolean,
): void {
  const id = utils.parseDecimalInt(propData.substr(0, 5)) - 1;
  const data = propData.substr(5);
  const sg = sGroups[id];
  applyDataSGroupData(sg, data, finalize);
}

// Utility functions

function toIntArray(strArray: string[]): number[] {
  const ret: number[] = [];
  for (let j = 0; j < strArray.length; ++j) {
    ret[j] = utils.parseDecimalInt(strArray[j]);
  }
  return ret;
}

function trimRight(str: string): string {
  return str.trimEnd();
}

function identityMap(array: number[]): Record<number, number> {
  const map: Record<number, number> = {};
  for (const item of array) map[item] = item;
  return map;
}

/**
 * Superatom attachment point parsing for 'ctab' v2000
 * Implemented based on: https://github.com/epam/ketcher/issues/2467
 * @param ctabString example '   1  1   2   0   '
 *        M SAP sssnn6 iii ooo cc
 *             ^
 *             start position for ctabString content
 */
function parseSGroupSAPLineV2000(ctabString: string): {
  sGroupId: number;
  attachmentPoints: SGroupAttachmentPoint[];
} {
  const [, sss, nn6] = utils.partitionLine(
    ctabString.slice(0, 7),
    [1, 3, 3],
    false,
  );
  const chunksNumberInLine = utils.parseDecimalInt(nn6);
  assert(chunksNumberInLine <= 6);
  const sGroupId = utils.parseDecimalInt(sss) - 1;
  const attachmentPointsStr = ctabString.slice(7);
  const attachmentPoints: SGroupAttachmentPoint[] = [];
  for (let i = 0; i < chunksNumberInLine; i++) {
    const CHUNK_SIZE = 11;
    const stringForParse = attachmentPointsStr.slice(i * CHUNK_SIZE);
    const CHUNK_PARTS_LENGTHS = [1, 3, 1, 3, 1, 2];
    const [, iii, , ooo, , cc] = utils.partitionLine(
      stringForParse,
      CHUNK_PARTS_LENGTHS,
      false,
    );
    const atomId = utils.parseDecimalInt(iii) - 1;
    assert(atomId >= 0);
    const leaveAtomParsedId = utils.parseDecimalInt(ooo);
    const leaveAtomId =
      leaveAtomParsedId > 0 ? leaveAtomParsedId - 1 : undefined;
    attachmentPoints.push(new SGroupAttachmentPoint(atomId, leaveAtomId, cc));
  }
  return { sGroupId, attachmentPoints };
}

export default {
  readKeyValuePairs,
  readKeyMultiValuePairs,
  loadSGroup,
  initSGroup,
  applySGroupProp,
  applySGroupArrayProp,
  applyDataSGroupName,
  applyDataSGroupQuery,
  applyDataSGroupQueryOp,
  applyDataSGroupDesc,
  applyDataSGroupInfo,
  applyDataSGroupData,
  applyDataSGroupInfoLine,
  applyDataSGroupDataLine,
  applyDataSGroupExpand,
  parseSGroupSAPLineV2000,
};
