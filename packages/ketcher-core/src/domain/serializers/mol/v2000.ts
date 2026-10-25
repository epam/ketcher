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

// todo

import { Atom, AttachmentPoints, StereoLabel } from 'domain/entities/atom';
import { AtomList } from 'domain/entities/atomList';
import { Bond } from 'domain/entities/bond';
import { Pool } from 'domain/entities/pool';
import { type RGroupAttributes, RGroup } from 'domain/entities/rgroup';
import { RGroupAttachmentPoint } from 'domain/entities/rgroupAttachmentPoint';
import { SGroup } from 'domain/entities/sgroup';
import { Struct } from 'domain/entities/struct';
import { Vec2 } from 'domain/entities/vec2';

import { Elements } from 'domain/constants';
import sGroup from './parseSGroup';
import utilities from './utilities';
import type { AtomMap, SGroupMap } from './mol.types';

const loadRGroupFragments = true; // TODO: set to load the fragments

/** M-property block: string keys (CHG, alias, …) map to per-atom pools */
type MPropertyProperties = Map<string, Pool<string | number | AtomList>>;

function parseAtomLine(atomLine: string): Atom {
  /* reader */
  const atomSplit = utilities.partitionLine(
    atomLine,
    utilities.fmtInfo.atomLinePartition,
  );
  const parameters = {
    // generic
    pp: new Vec2(
      Number.parseFloat(atomSplit[0]),
      -Number.parseFloat(atomSplit[1]),
      Number.parseFloat(atomSplit[2]),
    ),
    label: atomSplit[4].trim(),
    explicitValence:
      utilities.fmtInfo.valenceMap[utilities.parseDecimalInt(atomSplit[10])],

    // obsolete
    massDifference: utilities.parseDecimalInt(atomSplit[5]),
    charge:
      utilities.fmtInfo.chargeMap[utilities.parseDecimalInt(atomSplit[6])],

    // query
    hCount: utilities.parseDecimalInt(atomSplit[8]),
    stereoCare: utilities.parseDecimalInt(atomSplit[9]) !== 0,

    // reaction
    aam: utilities.parseDecimalInt(atomSplit[14]),
    invRet: utilities.parseDecimalInt(atomSplit[15]),

    // reaction query
    exactChangeFlag: utilities.parseDecimalInt(atomSplit[16]),
  };
  return new Atom(parameters);
}

function parseBondLine(bondLine: string): Bond {
  /* reader */
  const bondSplit = utilities.partitionLine(
    bondLine,
    utilities.fmtInfo.bondLinePartition,
  );

  const parameters = {
    begin: utilities.parseDecimalInt(bondSplit[0]) - 1,
    end: utilities.parseDecimalInt(bondSplit[1]) - 1,
    type: utilities.fmtInfo.bondTypeMap[
      utilities.parseDecimalInt(bondSplit[2])
    ],
    stereo:
      utilities.fmtInfo.bondStereoMap[utilities.parseDecimalInt(bondSplit[3])],
    xxx: bondSplit[4],
    topology:
      utilities.fmtInfo.bondTopologyMap[
        utilities.parseDecimalInt(bondSplit[5])
      ],
    reactingCenterStatus: utilities.parseDecimalInt(bondSplit[6]),
  };

  return new Bond(parameters);
}

function parseAtomListLine(atomListLine: string): {
  aid: number;
  atomList: AtomList;
} {
  /* reader */
  const split = utilities.partitionLine(
    atomListLine,
    utilities.fmtInfo.atomListHeaderPartition,
  );

  const number = utilities.parseDecimalInt(split[0]) - 1;
  const notList = split[2].trim() === 'T';
  const count = utilities.parseDecimalInt(split[4].trim());

  const ids = atomListLine.slice(utilities.fmtInfo.atomListHeaderLength);
  const list: number[] = [];
  const itemLength = utilities.fmtInfo.atomListHeaderItemLength;
  for (let index = 0; index < count; ++index) {
    list[index] = utilities.parseDecimalInt(
      ids.slice(index * itemLength, (index + 1) * itemLength - 1),
    );
  }

  return {
    aid: number,
    atomList: new AtomList({
      notList,
      ids: list,
    }),
  };
}

/**
 * Handles 'A' property lines (atom alias/pseudo)
 */
function handleAliasProperty(
  line: string,
  ctabLines: string[],
  shift: number,
  properties: MPropertyProperties,
): void {
  const propertyValue = ctabLines[shift];
  // TODO: Atom entity only have pseudo getter. Check during refactoring
  // this type of pseudo labeling is not used in current BIOVIA products. See ctab documentation 2020
  // https://discover.3ds.com/sites/default/files/2020-08/biovia_ctfileformats_2020.pdf (page 47)
  const isPseudo = /'.+'/.test(propertyValue);
  const propertyType = isPseudo ? 'pseudo' : 'alias';

  if (!properties.get(propertyType)) {
    properties.set(propertyType, new Pool());
  }

  const aliasPool = properties.get(propertyType);
  if (aliasPool) {
    aliasPool.set(utilities.parseDecimalInt(line.slice(3)) - 1, propertyValue);
  }
}

/**
 * Handles simple atom property types (CHG, RAD, ISO, RBC, UNS, APO)
 */
function handleSimpleAtomProperty(
  propertyName: string,
  propertyData: string,
  properties: MPropertyProperties,
): void {
  if (!properties.get(propertyName)) {
    properties.set(propertyName, sGroup.readKeyValuePairs(propertyData, false));
  }
}

/**
 * Handles SUB (substitution count) property
 */
function handleSubstitutionProperty(
  propertyData: string,
  properties: MPropertyProperties,
): void {
  if (!properties.get('substitutionCount')) {
    properties.set('substitutionCount', new Pool());
  }
  const subLabels = properties.get('substitutionCount');
  if (!subLabels) {
    return;
  }
  const arrs = sGroup.readKeyMultiValuePairs(propertyData, false);

  for (const a2r of arrs) {
    subLabels.set(a2r[0], a2r[1]);
  }
}

/**
 * Handles RGP (rgroup label) property
 */
function handleRGroupProperty(
  propertyData: string,
  properties: MPropertyProperties,
): void {
  if (!properties.get('rglabel')) {
    properties.set('rglabel', new Pool());
  }
  const rglabels = properties.get('rglabel');
  if (!rglabels) {
    return;
  }
  const a2rs = sGroup.readKeyMultiValuePairs(propertyData, false);

  for (const a2r of a2rs) {
    const rg = Number(a2r[1]);
    rglabels.set(
      a2r[0],
      ((rglabels.get(a2r[0]) as number) || 0) | (1 << (rg - 1)),
    );
  }
}

/**
 * Handles LOG (rgroup logic) property
 */
function handleRGroupLogic(
  propertyData: string,
  rLogic: Record<number, RGroupAttributes>,
): void {
  const data = propertyData.slice(4);
  const rgid = utilities.parseDecimalInt(data.slice(0, 3).trim());
  const iii = utilities.parseDecimalInt(data.slice(4, 7).trim());
  const hhh = utilities.parseDecimalInt(data.slice(8, 11).trim());
  const ooo = data.slice(12).trim();

  const logic: RGroupAttributes = {
    resth: hhh === 1,
    range: ooo,
  };
  if (iii > 0) {
    logic.ifthen = iii;
  }
  rLogic[rgid] = logic;
}

/**
 * Handles ALS (atom list) property
 */
function handleAtomListProperty(
  propertyData: string,
  properties: MPropertyProperties,
): void {
  const pool = parsePropertyLineAtomList(
    utilities.partitionLine(propertyData, [1, 3, 3, 1, 1, 1]),
    utilities.partitionLineFixed(propertyData.slice(10), 4, false),
  );

  if (!properties.get('atomList')) {
    properties.set('atomList', new Pool());
  }
  if (!properties.get('label')) {
    properties.set('label', new Pool());
  }

  const labelPool = properties.get('label');
  const atomListPool = properties.get('atomList');
  if (!labelPool || !atomListPool) {
    return;
  }

  pool.forEach((atomList, aid) => {
    labelPool.set(aid, 'L#');
    atomListPool.set(aid, atomList);
  });
}

/**
 * Handles SMT/SCL (sGroup subscript/class) properties
 */
function handleSGroupDataProperty(
  type: string,
  propertyData: string,
  sGroups: SGroupMap,
): void {
  const sid = utilities.parseDecimalInt(propertyData.slice(0, 4)) - 1;
  const value = propertyData.slice(4).trim();

  if (type === 'SMT') {
    sGroups[sid].data.subscript = value;
  } else {
    sGroups[sid].data.class = value;
  }
}

/**
 * Handles SDS (sGroup expanded state) property
 */
function handleSGroupExpandedProperty(
  propertyData: string,
  sGroups: SGroupMap,
): void {
  const expandedSGroups = propertyData.slice(7).trim().split('   ');
  expandedSGroups.forEach((eg) => {
    const sGroupId = Number(eg) - 1;
    sGroups[sGroupId].data.expanded = true;
  });
}

/**
 * Handles SAP (sGroup attachment point) property
 */
function handleSGroupAttachmentProperty(
  propertyData: string,
  sGroups: SGroupMap,
): void {
  const { sGroupId, attachmentPoints } =
    sGroup.parseSGroupSAPLineV2000(propertyData);
  attachmentPoints.forEach((attachmentPoint) => {
    sGroups[sGroupId].addAttachmentPoint(attachmentPoint);
  });
}

/**
 * Processes M-type property line
 */
function processMPropertyLine(
  type: string,
  propertyData: string,
  properties: MPropertyProperties,
  sGroups: SGroupMap,
  rLogic: Record<number, RGroupAttributes>,
): boolean {
  switch (type) {
    case 'END':
      return true; // Signal to break loop
    case 'CHG':
      handleSimpleAtomProperty('charge', propertyData, properties);
      break;
    case 'RAD':
      handleSimpleAtomProperty('radical', propertyData, properties);
      break;
    case 'ISO':
      handleSimpleAtomProperty('isotope', propertyData, properties);
      break;
    case 'RBC':
      handleSimpleAtomProperty('ringBondCount', propertyData, properties);
      break;
    case 'SUB':
      handleSubstitutionProperty(propertyData, properties);
      break;
    case 'UNS':
      handleSimpleAtomProperty('unsaturatedAtom', propertyData, properties);
      break;
    case 'RGP':
      handleRGroupProperty(propertyData, properties);
      break;
    case 'LOG':
      handleRGroupLogic(propertyData, rLogic);
      break;
    case 'APO':
      handleSimpleAtomProperty('attachmentPoints', propertyData, properties);
      break;
    case 'ALS':
      handleAtomListProperty(propertyData, properties);
      break;
    case 'STY':
      sGroup.initSGroup(sGroups, propertyData);
      break;
    case 'SST':
      sGroup.applySGroupProp(sGroups, 'subtype', propertyData);
      break;
    case 'SLB':
      sGroup.applySGroupProp(sGroups, 'label', propertyData, true);
      break;
    case 'SPL':
      sGroup.applySGroupProp(sGroups, 'parent', propertyData, true, true);
      break;
    case 'SCN':
      sGroup.applySGroupProp(sGroups, 'connectivity', propertyData);
      break;
    case 'SAL':
      sGroup.applySGroupArrayProp(sGroups, 'atoms', propertyData, -1);
      break;
    case 'SBL':
      sGroup.applySGroupArrayProp(sGroups, 'bonds', propertyData, -1);
      break;
    case 'SPA':
      sGroup.applySGroupArrayProp(sGroups, 'patoms', propertyData, -1);
      break;
    case 'SMT':
    case 'SCL':
      handleSGroupDataProperty(type, propertyData, sGroups);
      break;
    case 'SDT':
      sGroup.applyDataSGroupDesc(sGroups, propertyData);
      break;
    case 'SDD':
      sGroup.applyDataSGroupInfoLine(sGroups, propertyData);
      break;
    case 'SCD':
      sGroup.applyDataSGroupDataLine(sGroups, propertyData, false);
      break;
    case 'SED':
      sGroup.applyDataSGroupDataLine(sGroups, propertyData, true);
      break;
    case 'SDS':
      handleSGroupExpandedProperty(propertyData, sGroups);
      break;
    case 'SAP':
      handleSGroupAttachmentProperty(propertyData, sGroups);
      break;
  }

  return false; // Continue loop
}

/**
 * @param ctab
 * @param ctabLines
 * @param shift
 * @param end
 * @param sGroups
 * @param rLogic
 * @returns { Pool }
 */
function parsePropertyLines(
  _ctab: Struct,
  ctabLines: string[],
  shift: number,
  end: number,
  sGroups: SGroupMap,
  rLogic: Record<number, RGroupAttributes>,
): MPropertyProperties {
  /* reader */
  const properties = new Map<string, Pool<string | number | AtomList>>();

  while (shift < end) {
    const line = ctabLines[shift];

    if (line.startsWith('A')) {
      handleAliasProperty(line, ctabLines, ++shift, properties);
    } else if (line.startsWith('M')) {
      const type = line.slice(3, 6);
      const propertyData = line.slice(6);
      const shouldBreak = processMPropertyLine(
        type,
        propertyData,
        properties,
        sGroups,
        rLogic,
      );

      if (shouldBreak) {
        break;
      }
    }

    ++shift;
  }

  return properties;
}

/**
 * @param atoms { Pool }
 * @param values { Pool }
 * @param propertyId { string }
 */
function applyAtomProperty(
  atoms: Pool<Atom>,
  values: Pool<string | number | AtomList>,
  propertyId: string,
): void {
  /* reader */
  values.forEach((propertyValue, aid) => {
    const atom = atoms.get(aid);
    if (atom) {
      (atom as Atom & Record<string, unknown>)[propertyId] = propertyValue;
    }
  });
}

/**
 * Creates RGroupAttachmentPoint instances from atoms with attachmentPoints property
 * This is called after parsing MOL files to convert atom.attachmentPoints to struct.rgroupAttachmentPoints
 * @param struct { Struct }
 */
function createRGroupAttachmentPointsFromAtoms(struct: Struct): void {
  struct.atoms.forEach((atom, atomId) => {
    if (!atom.attachmentPoints) {
      return;
    }

    const attachmentPoints = atom.attachmentPoints;

    if (attachmentPoints === AttachmentPoints.FirstSideOnly) {
      struct.rgroupAttachmentPoints.add(
        new RGroupAttachmentPoint(atomId, 'primary'),
      );
    } else if (attachmentPoints === AttachmentPoints.SecondSideOnly) {
      struct.rgroupAttachmentPoints.add(
        new RGroupAttachmentPoint(atomId, 'secondary'),
      );
    } else if (attachmentPoints === AttachmentPoints.BothSides) {
      struct.rgroupAttachmentPoints.add(
        new RGroupAttachmentPoint(atomId, 'primary'),
      );
      struct.rgroupAttachmentPoints.add(
        new RGroupAttachmentPoint(atomId, 'secondary'),
      );
    }
  });
}

function parseCTabV2000(
  ctabLines: string[],
  countsSplit: string[],
  ignoreChiralFlag?: boolean,
): Struct {
  /* reader */
  const ctab = new Struct();
  let index: number;
  const atomCount = utilities.parseDecimalInt(countsSplit[0]);
  const bondCount = utilities.parseDecimalInt(countsSplit[1]);
  const atomListCount = utilities.parseDecimalInt(countsSplit[2]);
  const isAbs =
    utilities.parseDecimalInt(countsSplit[4]) === 1 || ignoreChiralFlag;
  const isAnd =
    utilities.parseDecimalInt(countsSplit[4]) === 0 && !ignoreChiralFlag;
  const stextLinesCount = utilities.parseDecimalInt(countsSplit[5]);
  const propertyLinesCount = utilities.parseDecimalInt(countsSplit[10]);
  let shift = 0;
  const atomLines = ctabLines.slice(shift, shift + atomCount);
  shift += atomCount;
  const bondLines = ctabLines.slice(shift, shift + bondCount);
  shift += bondCount;
  const atomListLines = ctabLines.slice(shift, shift + atomListCount);
  shift += atomListCount + stextLinesCount;

  const atoms = atomLines.map(parseAtomLine);
  atoms.forEach((atom) => ctab.atoms.add(atom));

  const bonds = bondLines.map(parseBondLine);
  bonds.forEach((bond) => {
    const beginAtom = ctab.atoms.get(bond.begin);
    if (beginAtom) {
      if (bond.stereo && isAbs) {
        beginAtom.stereoLabel = StereoLabel.Abs;
      }
      if (bond.stereo && isAnd) {
        beginAtom.stereoLabel = `${StereoLabel.And}1`;
      }
    }
    ctab.bonds.add(bond);
  });

  const atomLists = atomListLines.map(parseAtomListLine);
  atomLists.forEach((pair) => {
    const atom = ctab.atoms.get(pair.aid);
    if (!atom) {
      throw new Error('Atom index out of range for atom list');
    }
    atom.atomList = pair.atomList;
    atom.label = 'L#';
  });

  const sGroups: SGroupMap = {};
  const rLogic: Record<number, RGroupAttributes> = {};
  const properties = parsePropertyLines(
    ctab,
    ctabLines,
    shift,
    Math.min(ctabLines.length, shift + propertyLinesCount),
    sGroups,
    rLogic,
  );
  properties.forEach((values, propertyId) => {
    applyAtomProperty(ctab.atoms, values, propertyId);
  });

  const atomMap: AtomMap = {};
  let sid: string;
  for (sid in sGroups) {
    const sg = sGroups[sid];
    if (sg.type === 'DAT' && sg.atoms.length === 0) {
      const parent = (sGroups[sid] as SGroup & { parent: number }).parent;
      if (parent >= 0) {
        const psg = sGroups[parent - 1];
        if (psg.type === 'GEN') sg.atoms = [].slice.call(psg.atoms);
      }
    }
  }
  for (sid in sGroups) sGroup.loadSGroup(ctab, sGroups[sid], atomMap);
  const emptyGroups: number[] = [];
  for (sid in sGroups) {
    // TODO: why do we need that?
    SGroup.filter(ctab, sGroups[sid], atomMap);
    if (sGroups[sid].atoms.length === 0 && !sGroups[sid].allAtoms) {
      emptyGroups.push(+sid);
    }
  }
  for (index = 0; index < emptyGroups.length; ++index) {
    ctab.sGroupForest.remove(emptyGroups[index]);
    ctab.sgroups.delete(emptyGroups[index]);
  }
  for (const id in rLogic) {
    const rgid = Number.parseInt(id, 10);
    ctab.rgroups.set(rgid, new RGroup(rLogic[rgid]));
  }

  // Create RGroupAttachmentPoint instances from atoms with attachmentPoints property
  createRGroupAttachmentPointsFromAtoms(ctab);

  return ctab;
}

function parseRg2000(ctabLines: string[], ignoreChiralFlag?: boolean): Struct {
  ctabLines = ctabLines.slice(7);
  if (ctabLines[0].trim() !== '$CTAB') throw new Error('RGFile format invalid');
  let index = 1;
  while (!ctabLines[index].startsWith('$')) index++;
  if (ctabLines[index].trim() !== '$END CTAB') {
    throw new Error('RGFile format invalid');
  }
  const coreLines = ctabLines.slice(1, index);
  ctabLines = ctabLines.slice(index + 1);
  const fragmentLines: Record<number, string[][]> = {};
  while (true) {
    if (ctabLines.length === 0) throw new Error('Unexpected end of file');
    let line = ctabLines[0].trim();
    if (line === '$END MOL') {
      break;
    }
    if (line !== '$RGP') throw new Error('RGFile format invalid');

    const rgid = Number.parseInt(ctabLines[1].trim(), 10);
    fragmentLines[rgid] = [];
    ctabLines = ctabLines.slice(2);
    while (true) {
      if (ctabLines.length === 0) throw new Error('Unexpected end of file');
      line = ctabLines[0].trim();
      if (line === '$END RGP') {
        ctabLines = ctabLines.slice(1);
        break;
      }
      if (line !== '$CTAB') throw new Error('RGFile format invalid');
      index = 1;
      while (!ctabLines[index].startsWith('$')) index++;
      if (ctabLines[index].trim() !== '$END CTAB') {
        throw new Error('RGFile format invalid');
      }
      fragmentLines[rgid].push(ctabLines.slice(1, index));
      ctabLines = ctabLines.slice(index + 1);
    }
  }

  const core = parseCTab(coreLines, ignoreChiralFlag);
  const frag: Record<number, Struct[]> = {};
  if (loadRGroupFragments) {
    for (const stringId in fragmentLines) {
      const id = Number.parseInt(stringId, 10);
      frag[id] = [];
      for (const fragmentLine of fragmentLines[id]) {
        frag[id].push(parseCTab(fragmentLine, ignoreChiralFlag));
      }
    }
  }
  return utilities.rgMerge(core, frag);
}

function parseRxn2000(
  ctabLines: string[],
  shouldReactionRelayout?: boolean,
  ignoreChiralFlag?: boolean,
): Struct {
  /* reader */
  ctabLines = ctabLines.slice(4);
  const countsSplit = utilities.partitionLine(
    ctabLines[0],
    utilities.fmtInfo.rxnItemsPartition,
  );
  const nReactants = utilities.parseDecimalInt(countsSplit[0]);
  const nProducts = utilities.parseDecimalInt(countsSplit[1]);
  const nAgents = utilities.parseDecimalInt(countsSplit[2]);
  ctabLines = ctabLines.slice(1); // consume counts line
  const mols: Struct[] = [];
  while (ctabLines.length > 0 && ctabLines[0].startsWith('$MOL')) {
    ctabLines = ctabLines.slice(1);
    let n = 0;
    while (n < ctabLines.length && !ctabLines[n].startsWith('$MOL')) n++;

    const lines = ctabLines.slice(0, n);
    let struct: Struct;
    if (lines[0].startsWith('$MDL')) {
      struct = parseRg2000(lines, ignoreChiralFlag);
    } else {
      struct = parseCTab(lines.slice(3), ignoreChiralFlag);
      struct.name = lines[0].trim();
    }
    mols.push(struct);
    ctabLines = ctabLines.slice(n);
  }
  return utilities.rxnMerge(
    mols,
    nReactants,
    nProducts,
    nAgents,
    shouldReactionRelayout,
  );
}

function parseCTab(ctabLines: string[], ignoreChiralFlag?: boolean): Struct {
  /* reader */
  const countsSplit = utilities.partitionLine(
    ctabLines[0],
    utilities.fmtInfo.countsLinePartition,
  );
  ctabLines = ctabLines.slice(1);
  return parseCTabV2000(ctabLines, countsSplit, ignoreChiralFlag);
}

function labelsListToIds(labels: string[]): number[] {
  /* reader */
  const ids: number[] = [];
  for (const label of labels) {
    const element = Elements.get(label.trim());
    if (element) {
      ids.push(element.number);
    }
  }

  return ids;
}

/**
 * @param hdr
 * @param lst
 * @returns { Pool }
 */
function parsePropertyLineAtomList(
  hdr: string[],
  lst: string[],
): Pool<AtomList> {
  /* reader */
  const aid = utilities.parseDecimalInt(hdr[1]) - 1;
  const count = utilities.parseDecimalInt(hdr[2]);
  const notList = hdr[4].trim() === 'T';
  const ids = labelsListToIds(lst.slice(0, count));
  const returnValue = new Pool<AtomList>();
  returnValue.set(
    aid,
    new AtomList({
      notList,
      ids,
    }),
  );
  return returnValue;
}

export default {
  parseCTabV2000,
  parseRg2000,
  parseRxn2000,
};
