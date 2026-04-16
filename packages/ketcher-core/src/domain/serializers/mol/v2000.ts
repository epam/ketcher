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

/* eslint-disable guard-for-in */ // todo

import { Atom, AttachmentPoints, StereoLabel } from 'domain/entities/atom';
import { AtomList } from 'domain/entities/atomList';
import { Bond } from 'domain/entities/bond';
import { Pool } from 'domain/entities/pool';
import { RGroup } from 'domain/entities/rgroup';
import { RGroupAttachmentPoint } from 'domain/entities/rgroupAttachmentPoint';
import { SGroup } from 'domain/entities/sgroup';
import { Struct } from 'domain/entities/struct';
import { Vec2 } from 'domain/entities/vec2';
import { RGroupAttributes } from 'domain/entities/rgroup';

import { Elements } from 'domain/constants';
import sGroup from './parseSGroup';
import utils from './utils';
import { AtomMap, SGroupMap } from './mol.types';

const loadRGroupFragments = true; // TODO: set to load the fragments

/** M-property block: string keys (CHG, alias, …) map to per-atom pools */
type MPropertyProps = Map<string, Pool>;

function parseAtomLine(atomLine: string): Atom {
  /* reader */
  const atomSplit = utils.partitionLine(
    atomLine,
    utils.fmtInfo.atomLinePartition,
  );
  const params = {
    // generic
    pp: new Vec2(
      parseFloat(atomSplit[0]),
      -parseFloat(atomSplit[1]),
      parseFloat(atomSplit[2]),
    ),
    label: atomSplit[4].trim(),
    explicitValence:
      utils.fmtInfo.valenceMap[utils.parseDecimalInt(atomSplit[10])],

    // obsolete
    massDifference: utils.parseDecimalInt(atomSplit[5]),
    charge: utils.fmtInfo.chargeMap[utils.parseDecimalInt(atomSplit[6])],

    // query
    hCount: utils.parseDecimalInt(atomSplit[8]),
    stereoCare: utils.parseDecimalInt(atomSplit[9]) !== 0,

    // reaction
    aam: utils.parseDecimalInt(atomSplit[14]),
    invRet: utils.parseDecimalInt(atomSplit[15]),

    // reaction query
    exactChangeFlag: utils.parseDecimalInt(atomSplit[16]),
  };
  return new Atom(params);
}

function parseBondLine(bondLine: string): Bond {
  /* reader */
  const bondSplit = utils.partitionLine(
    bondLine,
    utils.fmtInfo.bondLinePartition,
  );

  const params = {
    begin: utils.parseDecimalInt(bondSplit[0]) - 1,
    end: utils.parseDecimalInt(bondSplit[1]) - 1,
    type: utils.fmtInfo.bondTypeMap[utils.parseDecimalInt(bondSplit[2])],
    stereo: utils.fmtInfo.bondStereoMap[utils.parseDecimalInt(bondSplit[3])],
    xxx: bondSplit[4],
    topology:
      utils.fmtInfo.bondTopologyMap[utils.parseDecimalInt(bondSplit[5])],
    reactingCenterStatus: utils.parseDecimalInt(bondSplit[6]),
  };

  return new Bond(params);
}

function parseAtomListLine(atomListLine: string): {
  aid: number;
  atomList: AtomList;
} {
  /* reader */
  const split = utils.partitionLine(
    atomListLine,
    utils.fmtInfo.atomListHeaderPartition,
  );

  const number = utils.parseDecimalInt(split[0]) - 1;
  const notList = split[2].trim() === 'T';
  const count = utils.parseDecimalInt(split[4].trim());

  const ids = atomListLine.slice(utils.fmtInfo.atomListHeaderLength);
  const list: number[] = [];
  const itemLength = utils.fmtInfo.atomListHeaderItemLength;
  for (let i = 0; i < count; ++i) {
    list[i] = utils.parseDecimalInt(
      ids.slice(i * itemLength, (i + 1) * itemLength - 1),
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
  props: MPropertyProps,
): void {
  const propValue = ctabLines[shift];
  // TODO: Atom entity only have pseudo getter. Check during refactoring
  // this type of pseudo labeling is not used in current BIOVIA products. See ctab documentation 2020
  // https://discover.3ds.com/sites/default/files/2020-08/biovia_ctfileformats_2020.pdf (page 47)
  const isPseudo = /'.+'/.test(propValue);
  const propType = isPseudo ? 'pseudo' : 'alias';

  if (!props.get(propType)) {
    props.set(propType, new Pool());
  }

  const aliasPool = props.get(propType);
  if (aliasPool) {
    aliasPool.set(utils.parseDecimalInt(line.slice(3)) - 1, propValue);
  }
}

/**
 * Handles simple atom property types (CHG, RAD, ISO, RBC, UNS, APO)
 */
function handleSimpleAtomProperty(
  propName: string,
  propertyData: string,
  props: MPropertyProps,
): void {
  if (!props.get(propName)) {
    props.set(propName, sGroup.readKeyValuePairs(propertyData, false));
  }
}

/**
 * Handles SUB (substitution count) property
 */
function handleSubstitutionProperty(
  propertyData: string,
  props: MPropertyProps,
): void {
  if (!props.get('substitutionCount')) {
    props.set('substitutionCount', new Pool());
  }
  const subLabels = props.get('substitutionCount');
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
  props: MPropertyProps,
): void {
  if (!props.get('rglabel')) {
    props.set('rglabel', new Pool());
  }
  const rglabels = props.get('rglabel');
  if (!rglabels) {
    return;
  }
  const a2rs = sGroup.readKeyMultiValuePairs(propertyData, false);

  for (const a2r of a2rs) {
    const rg = Number(a2r[1]);
    rglabels.set(a2r[0], (rglabels.get(a2r[0]) || 0) | (1 << (rg - 1)));
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
  const rgid = utils.parseDecimalInt(data.slice(0, 3).trim());
  const iii = utils.parseDecimalInt(data.slice(4, 7).trim());
  const hhh = utils.parseDecimalInt(data.slice(8, 11).trim());
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
  props: MPropertyProps,
): void {
  const pool = parsePropertyLineAtomList(
    utils.partitionLine(propertyData, [1, 3, 3, 1, 1, 1]),
    utils.partitionLineFixed(propertyData.slice(10), 4, false),
  );

  if (!props.get('atomList')) {
    props.set('atomList', new Pool());
  }
  if (!props.get('label')) {
    props.set('label', new Pool());
  }

  const labelPool = props.get('label');
  const atomListPool = props.get('atomList');
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
  const sid = utils.parseDecimalInt(propertyData.slice(0, 4)) - 1;
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
  props: MPropertyProps,
  sGroups: SGroupMap,
  rLogic: Record<number, RGroupAttributes>,
): boolean {
  if (type === 'END') {
    return true; // Signal to break loop
  }

  if (type === 'CHG') {
    handleSimpleAtomProperty('charge', propertyData, props);
  } else if (type === 'RAD') {
    handleSimpleAtomProperty('radical', propertyData, props);
  } else if (type === 'ISO') {
    handleSimpleAtomProperty('isotope', propertyData, props);
  } else if (type === 'RBC') {
    handleSimpleAtomProperty('ringBondCount', propertyData, props);
  } else if (type === 'SUB') {
    handleSubstitutionProperty(propertyData, props);
  } else if (type === 'UNS') {
    handleSimpleAtomProperty('unsaturatedAtom', propertyData, props);
  } else if (type === 'RGP') {
    handleRGroupProperty(propertyData, props);
  } else if (type === 'LOG') {
    handleRGroupLogic(propertyData, rLogic);
  } else if (type === 'APO') {
    handleSimpleAtomProperty('attachmentPoints', propertyData, props);
  } else if (type === 'ALS') {
    handleAtomListProperty(propertyData, props);
  } else if (type === 'STY') {
    sGroup.initSGroup(sGroups, propertyData);
  } else if (type === 'SST') {
    sGroup.applySGroupProp(sGroups, 'subtype', propertyData);
  } else if (type === 'SLB') {
    sGroup.applySGroupProp(sGroups, 'label', propertyData, true);
  } else if (type === 'SPL') {
    sGroup.applySGroupProp(sGroups, 'parent', propertyData, true, true);
  } else if (type === 'SCN') {
    sGroup.applySGroupProp(sGroups, 'connectivity', propertyData);
  } else if (type === 'SAL') {
    sGroup.applySGroupArrayProp(sGroups, 'atoms', propertyData, -1);
  } else if (type === 'SBL') {
    sGroup.applySGroupArrayProp(sGroups, 'bonds', propertyData, -1);
  } else if (type === 'SPA') {
    sGroup.applySGroupArrayProp(sGroups, 'patoms', propertyData, -1);
  } else if (type === 'SMT' || type === 'SCL') {
    handleSGroupDataProperty(type, propertyData, sGroups);
  } else if (type === 'SDT') {
    sGroup.applyDataSGroupDesc(sGroups, propertyData);
  } else if (type === 'SDD') {
    sGroup.applyDataSGroupInfoLine(sGroups, propertyData);
  } else if (type === 'SCD') {
    sGroup.applyDataSGroupDataLine(sGroups, propertyData, false);
  } else if (type === 'SED') {
    sGroup.applyDataSGroupDataLine(sGroups, propertyData, true);
  } else if (type === 'SDS') {
    handleSGroupExpandedProperty(propertyData, sGroups);
  } else if (type === 'SAP') {
    handleSGroupAttachmentProperty(propertyData, sGroups);
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
): MPropertyProps {
  /* reader */
  const props = new Map<string, Pool>();

  while (shift < end) {
    const line = ctabLines[shift];

    if (line.charAt(0) === 'A') {
      handleAliasProperty(line, ctabLines, ++shift, props);
    } else if (line.charAt(0) === 'M') {
      const type = line.slice(3, 6);
      const propertyData = line.slice(6);
      const shouldBreak = processMPropertyLine(
        type,
        propertyData,
        props,
        sGroups,
        rLogic,
      );

      if (shouldBreak) {
        break;
      }
    }

    ++shift;
  }

  return props;
}

/**
 * @param atoms { Pool }
 * @param values { Pool }
 * @param propId { string }
 */
function applyAtomProp(atoms: Pool<Atom>, values: Pool, propId: string): void {
  /* reader */
  values.forEach((propVal, aid) => {
    const atom = atoms.get(aid);
    if (atom) {
      (atom as Atom & Record<string, unknown>)[propId] = propVal;
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
  // eslint-disable-line max-statements
  /* reader */
  const ctab = new Struct();
  let i: number;
  const atomCount = utils.parseDecimalInt(countsSplit[0]);
  const bondCount = utils.parseDecimalInt(countsSplit[1]);
  const atomListCount = utils.parseDecimalInt(countsSplit[2]);
  const isAbs = utils.parseDecimalInt(countsSplit[4]) === 1 || ignoreChiralFlag;
  const isAnd =
    utils.parseDecimalInt(countsSplit[4]) === 0 && !ignoreChiralFlag;
  const stextLinesCount = utils.parseDecimalInt(countsSplit[5]);
  const propertyLinesCount = utils.parseDecimalInt(countsSplit[10]);
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
  const props = parsePropertyLines(
    ctab,
    ctabLines,
    shift,
    Math.min(ctabLines.length, shift + propertyLinesCount),
    sGroups,
    rLogic,
  );
  props.forEach((values, propId) => {
    applyAtomProp(ctab.atoms, values, propId);
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
  for (i = 0; i < emptyGroups.length; ++i) {
    ctab.sGroupForest.remove(emptyGroups[i]);
    ctab.sgroups.delete(emptyGroups[i]);
  }
  for (const id in rLogic) {
    const rgid = parseInt(id, 10);
    ctab.rgroups.set(rgid, new RGroup(rLogic[rgid]));
  }

  // Create RGroupAttachmentPoint instances from atoms with attachmentPoints property
  createRGroupAttachmentPointsFromAtoms(ctab);

  return ctab;
}

function parseRg2000(ctabLines: string[], ignoreChiralFlag?: boolean): Struct {
  // eslint-disable-line max-statements
  ctabLines = ctabLines.slice(7);
  if (ctabLines[0].trim() !== '$CTAB') throw new Error('RGFile format invalid');
  let i = 1;
  while (ctabLines[i].charAt(0) !== '$') i++;
  if (ctabLines[i].trim() !== '$END CTAB') {
    throw new Error('RGFile format invalid');
  }
  const coreLines = ctabLines.slice(1, i);
  ctabLines = ctabLines.slice(i + 1);
  const fragmentLines: Record<number, string[][]> = {};
  while (true) {
    // eslint-disable-line no-constant-condition
    if (ctabLines.length === 0) throw new Error('Unexpected end of file');
    let line = ctabLines[0].trim();
    if (line === '$END MOL') {
      ctabLines = ctabLines.slice(1);
      break;
    }
    if (line !== '$RGP') throw new Error('RGFile format invalid');

    const rgid = parseInt(ctabLines[1].trim(), 10);
    fragmentLines[rgid] = [];
    ctabLines = ctabLines.slice(2);
    while (true) {
      // eslint-disable-line no-constant-condition
      if (ctabLines.length === 0) throw new Error('Unexpected end of file');
      line = ctabLines[0].trim();
      if (line === '$END RGP') {
        ctabLines = ctabLines.slice(1);
        break;
      }
      if (line !== '$CTAB') throw new Error('RGFile format invalid');
      i = 1;
      while (ctabLines[i].charAt(0) !== '$') i++;
      if (ctabLines[i].trim() !== '$END CTAB') {
        throw new Error('RGFile format invalid');
      }
      fragmentLines[rgid].push(ctabLines.slice(1, i));
      ctabLines = ctabLines.slice(i + 1);
    }
  }

  const core = parseCTab(coreLines, ignoreChiralFlag);
  const frag: Record<number, Struct[]> = {};
  if (loadRGroupFragments) {
    for (const strId in fragmentLines) {
      const id = parseInt(strId, 10);
      frag[id] = [];
      for (const fragmentLine of fragmentLines[id]) {
        frag[id].push(parseCTab(fragmentLine, ignoreChiralFlag));
      }
    }
  }
  return utils.rgMerge(core, frag);
}

function parseRxn2000(
  ctabLines: string[],
  shouldReactionRelayout?: boolean,
  ignoreChiralFlag?: boolean,
): Struct {
  // eslint-disable-line max-statements
  /* reader */
  ctabLines = ctabLines.slice(4);
  const countsSplit = utils.partitionLine(
    ctabLines[0],
    utils.fmtInfo.rxnItemsPartition,
  );
  const nReactants = countsSplit[0] - 0;
  const nProducts = countsSplit[1] - 0;
  const nAgents = countsSplit[2] - 0;
  ctabLines = ctabLines.slice(1); // consume counts line
  const mols: Struct[] = [];
  while (ctabLines.length > 0 && ctabLines[0].substr(0, 4) === '$MOL') {
    ctabLines = ctabLines.slice(1);
    let n = 0;
    while (n < ctabLines.length && ctabLines[n].substr(0, 4) !== '$MOL') n++;

    const lines = ctabLines.slice(0, n);
    let struct: Struct;
    if (lines[0].search('\\$MDL') === 0) {
      struct = parseRg2000(lines, ignoreChiralFlag);
    } else {
      struct = parseCTab(lines.slice(3), ignoreChiralFlag);
      struct.name = lines[0].trim();
    }
    mols.push(struct);
    ctabLines = ctabLines.slice(n);
  }
  return utils.rxnMerge(
    mols,
    nReactants,
    nProducts,
    nAgents,
    shouldReactionRelayout,
  );
}

function parseCTab(ctabLines: string[], ignoreChiralFlag?: boolean): Struct {
  /* reader */
  const countsSplit = utils.partitionLine(
    ctabLines[0],
    utils.fmtInfo.countsLinePartition,
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
function parsePropertyLineAtomList(hdr: string[], lst: string[]): Pool {
  /* reader */
  const aid = utils.parseDecimalInt(hdr[1]) - 1;
  const count = utils.parseDecimalInt(hdr[2]);
  const notList = hdr[4].trim() === 'T';
  const ids = labelsListToIds(lst.slice(0, count));
  const ret = new Pool();
  ret.set(
    aid,
    new AtomList({
      notList,
      ids,
    }),
  );
  return ret;
}

export default {
  parseCTabV2000,
  parseRg2000,
  parseRxn2000,
};
