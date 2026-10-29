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

import { Pool } from 'domain/entities/pool';
import { SGroup } from 'domain/entities/sgroup';
import { Vec2 } from 'domain/entities/vec2';
import { SGroupAttachmentPoint } from 'domain/entities/sGroupAttachmentPoint';
import type { Struct } from 'domain/entities/struct';

import type { SGroupMap, AtomMap, PostLoadHandler } from './mol.types';
import utilities from './utils';
import { assert } from 'utilities';

function readKeyValuePairs(
  string_: string,
  valueString: boolean,
): Pool<string | number> {
  const returnValue = new Pool<string | number>();
  const partition = utilities.partitionLineFixed(string_, 3, true);
  const count = utilities.parseDecimalInt(partition[0]);

  for (let index = 0; index < count; ++index) {
    const key = utilities.parseDecimalInt(partition[2 * index + 1]) - 1;
    const value = valueString
      ? partition[2 * index + 2].trim()
      : utilities.parseDecimalInt(partition[2 * index + 2]);

    returnValue.set(key, value);
  }

  return returnValue;
}

function readKeyMultiValuePairs(
  string_: string,
  valueString: boolean,
): Array<[number, string | number]> {
  const returnValue: Array<[number, string | number]> = [];
  const partition = utilities.partitionLineFixed(string_, 3, true);
  const count = utilities.parseDecimalInt(partition[0]);
  for (let index = 0; index < count; ++index) {
    returnValue.push([
      utilities.parseDecimalInt(partition[2 * index + 1]) - 1,
      valueString
        ? partition[2 * index + 2].trim()
        : utilities.parseDecimalInt(partition[2 * index + 2]),
    ]);
  }
  return returnValue;
}

function postLoadMul(sgroup: SGroup, mol?: Struct, atomMap?: AtomMap): void {
  if (!mol || !atomMap) return;

  sgroup.data.mul = Number(sgroup.data.subscript);
  const atomReductionMap: Record<number, number> = {};

  sgroup.atoms = SGroup.filterAtoms(sgroup.atoms, atomMap);
  sgroup.patoms = SGroup.filterAtoms(sgroup.patoms, atomMap);

  // mark repetitions for removal
  for (let k = 1; k < sgroup.data.mul; ++k) {
    for (let m = 0; m < sgroup.patoms.length; ++m) {
      const raid = sgroup.atoms[k * sgroup.patoms.length + m];
      if (raid < 0) continue;
      if (sgroup.patoms[m] < 0) throw new Error('parent atom missing');
      atomReductionMap[raid] = sgroup.patoms[m]; // "merge" atom in parent
    }
  }
  sgroup.patoms = SGroup.removeNegative(sgroup.patoms);

  const patomsMap = identityMap(sgroup.patoms);

  const bondsToRemove: number[] = [];
  mol.bonds.forEach((bond, bid) => {
    const isBeginInReductionMap = bond.begin in atomReductionMap;
    const isEndInReductionMap = bond.end in atomReductionMap;
    const isEndInParentAtoms = bond.end in patomsMap;
    const isBeginInParentAtoms = bond.begin in patomsMap;
    if (
      (isBeginInReductionMap && isEndInReductionMap) ||
      (isBeginInReductionMap && isEndInParentAtoms) ||
      (isEndInReductionMap && isBeginInParentAtoms)
    ) {
      bondsToRemove.push(bid);
    } else if (isBeginInReductionMap) bond.begin = atomReductionMap[bond.begin];
    else if (isEndInReductionMap) bond.end = atomReductionMap[bond.end];
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
  if (mol && !sgroup.data.absolute) {
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
  // COP post-load is identical to GEN.
  postLoadGen(sgroup);
}

function postLoadCro(_sgroup: SGroup): void {
  // TODO: Implement after adding CRO type support
}

function postLoadModule(_sgroup: SGroup): void {
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
  MOD: postLoadModule,
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

function initSGroup(sGroups: SGroupMap, propertyData: string): void {
  const kv = readKeyValuePairs(propertyData, true);
  for (const [key, type] of kv) {
    const sg = new SGroup(type as string);
    (sg as SGroup & { number: number }).number = key;
    sGroups[key] = sg;
  }
}

function applySGroupProperty(
  sGroups: SGroupMap,
  propertyName: string,
  propertyData: string,
  numeric?: boolean,
  core?: boolean,
): void {
  const kv = readKeyValuePairs(propertyData, !numeric);
  for (const key of kv.keys()) {
    (core ? sGroups[key] : sGroups[key].data)[propertyName] = kv.get(key);
  }
}

function applySGroupArrayProperty(
  sGroups: SGroupMap,
  propertyName: string,
  propertyData: string,
  shift: number,
): void {
  const sid = utilities.parseDecimalInt(propertyData.slice(1, 4)) - 1;
  const number_ = utilities.parseDecimalInt(propertyData.slice(4, 8));
  let part = toIntArray(
    utilities.partitionLineFixed(propertyData.slice(8), 3, true),
  );

  if (part.length !== number_) throw new Error('File format invalid');
  if (shift) part = part.map((v) => v + shift);

  sGroups[sid][propertyName] = sGroups[sid][propertyName].concat(part);
}

function applyDataSGroupName(sg: SGroup, name: string): void {
  sg.data.fieldName = name;
}

function applyDataSGroupExpand(sg: SGroup, isExpanded: boolean): void {
  sg.data.expanded = isExpanded;
}

function applyDataSGroupQuery(sg: SGroup, query: string): void {
  sg.data.query = query;
}

function applyDataSGroupQueryOp(sg: SGroup, queryOp: string): void {
  sg.data.queryOp = queryOp;
}

function applyDataSGroupDesc(sGroups: SGroupMap, propertyData: string): void {
  const split = utilities.partitionLine(
    propertyData,
    [4, 31, 2, 20, 2, 3],
    false,
  );
  const id = utilities.parseDecimalInt(split[0]) - 1;
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

function applyDataSGroupInfo(sg: SGroup, propertyData: string): void {
  const split = utilities.partitionLine(
    propertyData,
    [
      10 /* x.x */, 10 /* y.y */, 4 /* eee */, 1 /* f */, 1 /* g */, 1 /* h */,
      3 /* i */, 3 /* jjj */, 3 /* kkk */, 3 /* ll */, 2 /* m */, 3 /* n */,
      2 /* oo */,
    ],
    false,
  );

  const x = Number.parseFloat(split[0]);
  const y = Number.parseFloat(split[1]);
  const isAttached = split[3].trim() === 'A';
  const isAbsolute = split[4].trim() === 'A';
  const shouldShowUnits = split[5].trim() === 'U';
  const nCharsRaw = split[7].trim();
  const nCharsToDisplay =
    nCharsRaw === 'ALL' ? -1 : utilities.parseDecimalInt(nCharsRaw);
  const tagChar = split[10].trim();
  const daspPos = utilities.parseDecimalInt(split[11].trim());

  sg.pp = new Vec2(x, -y);
  sg.data.attached = isAttached;
  sg.data.absolute = isAbsolute;
  sg.data.showUnits = shouldShowUnits;
  sg.data.nCharsToDisplay = nCharsToDisplay;
  sg.data.tagChar = tagChar;
  sg.data.daspPos = daspPos;
}

function applyDataSGroupInfoLine(
  sGroups: SGroupMap,
  propertyData: string,
): void {
  const id = utilities.parseDecimalInt(propertyData.substring(0, 4)) - 1;
  const sg = sGroups[id];
  applyDataSGroupInfo(sg, propertyData.substring(5));
}

function applyDataSGroupData(
  sg: SGroup,
  data: string,
  shouldFinalize: boolean,
): void {
  sg.data.fieldValue = (sg.data.fieldValue || '') + data;
  if (shouldFinalize) {
    sg.data.fieldValue = trimRight(sg.data.fieldValue);
    if (
      sg.data.fieldValue.startsWith('"') &&
      sg.data.fieldValue.endsWith('"')
    ) {
      sg.data.fieldValue = sg.data.fieldValue.substring(
        1,
        sg.data.fieldValue.length - 1,
      );
    }
  }
}

function applyDataSGroupDataLine(
  sGroups: SGroupMap,
  propertyData: string,
  finalize: boolean,
): void {
  const id = utilities.parseDecimalInt(propertyData.substring(0, 5)) - 1;
  const data = propertyData.substring(5);
  const sg = sGroups[id];
  applyDataSGroupData(sg, data, finalize);
}

// Utility functions

function toIntArray(stringArray: string[]): number[] {
  const returnValue: number[] = [];
  for (let index = 0; index < stringArray.length; ++index) {
    returnValue[index] = utilities.parseDecimalInt(stringArray[index]);
  }
  return returnValue;
}

function trimRight(string_: string): string {
  return string_.trimEnd();
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
  const [, sss, nn6] = utilities.partitionLine(
    ctabString.slice(0, 7),
    [1, 3, 3],
    false,
  );
  const chunksNumberInLine = utilities.parseDecimalInt(nn6);
  assert(chunksNumberInLine <= 6);
  const sGroupId = utilities.parseDecimalInt(sss) - 1;
  const attachmentPointsString = ctabString.slice(7);
  const attachmentPoints: SGroupAttachmentPoint[] = [];
  for (let index = 0; index < chunksNumberInLine; index++) {
    const CHUNK_SIZE = 11;
    const stringForParse = attachmentPointsString.slice(index * CHUNK_SIZE);
    const CHUNK_PARTS_LENGTHS = [1, 3, 1, 3, 1, 2];
    const [, iii, , ooo, , cc] = utilities.partitionLine(
      stringForParse,
      CHUNK_PARTS_LENGTHS,
      false,
    );
    const atomId = utilities.parseDecimalInt(iii) - 1;
    assert(atomId >= 0);
    const leaveAtomParsedId = utilities.parseDecimalInt(ooo);
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
  applySGroupProp: applySGroupProperty,
  applySGroupArrayProp: applySGroupArrayProperty,
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
