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

import {
  Atom,
  AtomList,
  Bond,
  Pool,
  RGroup,
  SGroup,
  StereoLabel,
  Struct,
  Vec2,
} from 'domain/entities';

import { Elements } from 'domain/constants';
import sGroup from './parseSGroup';
import utils from './utils';

const loadRGroupFragments = true; // TODO: set to load the fragments
const molPropertyHandlers = createMolPropertyHandlers();

function parseAtomLine(atomLine) {
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
    hCount: utils.parseDecimalInt(utils.parseDecimalInt(atomSplit[8])),
    stereoCare: utils.parseDecimalInt(atomSplit[9]) !== 0,

    // reaction
    aam: utils.parseDecimalInt(atomSplit[14]),
    invRet: utils.parseDecimalInt(atomSplit[15]),

    // reaction query
    exactChangeFlag: utils.parseDecimalInt(atomSplit[16]),
  };
  return new Atom(params);
}

function parseBondLine(bondLine) {
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

function parseAtomListLine(/* string */ atomListLine) {
  /* reader */
  const split = utils.partitionLine(
    atomListLine,
    utils.fmtInfo.atomListHeaderPartition,
  );

  const number = utils.parseDecimalInt(split[0]) - 1;
  const notList = split[2].trim() === 'T';
  const count = utils.parseDecimalInt(split[4].trim());

  const ids = atomListLine.slice(utils.fmtInfo.atomListHeaderLength);
  const list = [];
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
 * @param ctab
 * @param ctabLines
 * @param shift
 * @param end
 * @param sGroups
 * @param rLogic
 * @returns { Pool }
 */
function parsePropertyLines(ctab, ctabLines, shift, end, sGroups, rLogic) {
  // eslint-disable-line max-statements, max-params
  /* reader */
  const props = new Pool();
  let index = shift;

  while (index < end) {
    const line = ctabLines[index];

    if (line.charAt(0) === 'A') {
      index = handleAtomAliasLine(line, ctabLines, index, props);
      continue;
    }

    if (line.charAt(0) === 'M') {
      const shouldStop = handleMolPropertyLine(line, props, sGroups, rLogic);
      if (shouldStop) break;
    }

    index += 1;
  }

  return props;
}

function handleMolPropertyLine(line, props, sGroups, rLogic) {
  const type = line.slice(3, 6);
  if (type === 'END') return true;

  if (
    Object.prototype.hasOwnProperty.call(molPropertyHandlers, type) &&
    typeof molPropertyHandlers[type] === 'function'
  ) {
    molPropertyHandlers[type]({
      propertyData: line.slice(6),
      sGroups,
      rLogic,
    });
  }

  return false;
}

function handleAtomAliasLine(line, ctabLines, index, props) {
  const propValue = ctabLines[index + 1];
  const isPseudo = /'.+'/.test(propValue);
  const key = isPseudo ? 'pseudo' : 'alias';
  const pool = ensurePropertyPool(props, key);

  pool.set(utils.parseDecimalInt(line.slice(3)) - 1, propValue);

  return index + 2;
}

function createMolPropertyHandlers() {
  return {
    CHG: ({ props, propertyData }) =>
      handleKeyValueProperty(props, 'charge', propertyData),
    RAD: ({ props, propertyData }) =>
      handleKeyValueProperty(props, 'radical', propertyData),
    ISO: ({ props, propertyData }) =>
      handleKeyValueProperty(props, 'isotope', propertyData),
    RBC: ({ props, propertyData }) =>
      handleKeyValueProperty(props, 'ringBondCount', propertyData),
    SUB: ({ props, propertyData }) =>
      handleSubstitutionCount(props, propertyData),
    UNS: ({ props, propertyData }) =>
      handleKeyValueProperty(props, 'unsaturatedAtom', propertyData),
    RGP: ({ props, propertyData }) => handleRGroupLabels(props, propertyData),
    LOG: ({ propertyData, rLogic }) => handleRGroupLogic(propertyData, rLogic),
    APO: ({ props, propertyData }) =>
      handleKeyValueProperty(props, 'attachmentPoints', propertyData),
    ALS: ({ props, propertyData }) =>
      handleAtomListProperty(props, propertyData),
    STY: ({ sGroups, propertyData }) =>
      sGroup.initSGroup(sGroups, propertyData),
    SST: ({ sGroups, propertyData }) =>
      sGroup.applySGroupProp(sGroups, 'subtype', propertyData),
    SLB: ({ sGroups, propertyData }) =>
      sGroup.applySGroupProp(sGroups, 'label', propertyData, true),
    SPL: ({ sGroups, propertyData }) =>
      sGroup.applySGroupProp(sGroups, 'parent', propertyData, true, true),
    SCN: ({ sGroups, propertyData }) =>
      sGroup.applySGroupProp(sGroups, 'connectivity', propertyData),
    SAL: ({ sGroups, propertyData }) =>
      sGroup.applySGroupArrayProp(sGroups, 'atoms', propertyData, -1),
    SBL: ({ sGroups, propertyData }) =>
      sGroup.applySGroupArrayProp(sGroups, 'bonds', propertyData, -1),
    SPA: ({ sGroups, propertyData }) =>
      sGroup.applySGroupArrayProp(sGroups, 'patoms', propertyData, -1),
    SMT: ({ sGroups, propertyData }) =>
      handleSGroupDataField(sGroups, propertyData, 'subscript'),
    SCL: ({ sGroups, propertyData }) =>
      handleSGroupDataField(sGroups, propertyData, 'class'),
    SDT: ({ sGroups, propertyData }) =>
      sGroup.applyDataSGroupDesc(sGroups, propertyData),
    SDD: ({ sGroups, propertyData }) =>
      sGroup.applyDataSGroupInfoLine(sGroups, propertyData),
    SCD: ({ sGroups, propertyData }) =>
      sGroup.applyDataSGroupDataLine(sGroups, propertyData, false),
    SED: ({ sGroups, propertyData }) =>
      sGroup.applyDataSGroupDataLine(sGroups, propertyData, true),
    SDS: ({ sGroups, propertyData }) =>
      handleExpandedSGroups(sGroups, propertyData),
    SAP: ({ sGroups, propertyData }) =>
      handleSGroupAttachmentPoints(sGroups, propertyData),
  };
}

function ensurePropertyPool(props, key) {
  if (!props.get(key)) {
    props.set(key, new Pool());
  }
  return props.get(key);
}

function handleKeyValueProperty(props, key, propertyData) {
  if (!props.get(key)) {
    props.set(key, sGroup.readKeyValuePairs(propertyData));
  }
}

function handleSubstitutionCount(props, propertyData) {
  const pool = ensurePropertyPool(props, 'substitutionCount');
  const entries = sGroup.readKeyMultiValuePairs(propertyData);

  entries.forEach(([atomId, labels]) => {
    pool.set(atomId, labels);
  });
}

function handleRGroupLabels(props, propertyData) {
  const pool = ensurePropertyPool(props, 'rglabel');
  const entries = sGroup.readKeyMultiValuePairs(propertyData);

  entries.forEach(([atomId, label]) => {
    pool.set(atomId, (pool.get(atomId) || 0) | (1 << (label - 1)));
  });
}

function handleRGroupLogic(propertyData, rLogic) {
  const data = propertyData.slice(4);
  const rgid = utils.parseDecimalInt(data.slice(0, 3).trim());
  const iii = utils.parseDecimalInt(data.slice(4, 7).trim());
  const hhh = utils.parseDecimalInt(data.slice(8, 11).trim());
  const ooo = data.slice(12).trim();
  const logic = {};

  if (iii > 0) logic.ifthen = iii;
  logic.resth = hhh === 1;
  logic.range = ooo;
  rLogic[rgid] = logic;
}

function handleAtomListProperty(props, propertyData) {
  const pool = parsePropertyLineAtomList(
    utils.partitionLine(propertyData, [1, 3, 3, 1, 1, 1]),
    utils.partitionLineFixed(propertyData.slice(10), 4, false),
  );
  const labelPool = ensurePropertyPool(props, 'label');
  const atomListPool = ensurePropertyPool(props, 'atomList');

  pool.forEach((atomList, aid) => {
    labelPool.set(aid, 'L#');
    atomListPool.set(aid, atomList);
  });
}

function handleSGroupDataField(sGroups, propertyData, field) {
  const sid = utils.parseDecimalInt(propertyData.slice(0, 4)) - 1;
  if (sGroups[sid]) {
    sGroups[sid].data[field] = propertyData.slice(4).trim();
  }
}

function handleExpandedSGroups(sGroups, propertyData) {
  const expanded = propertyData.slice(7).trim();
  if (!expanded) return;

  expanded.split('   ').forEach((rawId) => {
    const sGroupId = Number(rawId) - 1;
    if (sGroups[sGroupId]) {
      sGroups[sGroupId].data.expanded = true;
    }
  });
}

function handleSGroupAttachmentPoints(sGroups, propertyData) {
  const { sGroupId, attachmentPoints } =
    sGroup.parseSGroupSAPLineV2000(propertyData);

  attachmentPoints.forEach((attachmentPoint) => {
    sGroups[sGroupId].addAttachmentPoint(attachmentPoint);
  });
}

/**
 * @param atoms { Pool }
 * @param values { Pool }
 * @param propId { string }
 */
function applyAtomProp(atoms, values, propId) {
  /* reader */
  values.forEach((propVal, aid) => {
    atoms.get(aid)[propId] = propVal;
  });
}

function parseCTabV2000(
  ctabLines,
  countsSplit,
  /* boolean */ ignoreChiralFlag,
) {
  // eslint-disable-line max-statements
  /* reader */
  const ctab = new Struct();
  let i;
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
    if (bond.stereo && isAbs) {
      ctab.atoms.get(bond.begin).stereoLabel = StereoLabel.Abs;
    }
    if (bond.stereo && isAnd) {
      ctab.atoms.get(bond.begin).stereoLabel = `${StereoLabel.And}1`;
    }
    ctab.bonds.add(bond);
  });

  const atomLists = atomListLines.map(parseAtomListLine);
  atomLists.forEach((pair) => {
    ctab.atoms.get(pair.aid).atomList = pair.atomList;
    ctab.atoms.get(pair.aid).label = 'L#';
  });

  const sGroups = {};
  const rLogic = {};
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

  const atomMap = {};
  let sid;
  for (sid in sGroups) {
    const sg = sGroups[sid];
    if (sg.type === 'DAT' && sg.atoms.length === 0) {
      const parent = sGroups[sid].parent;
      if (parent >= 0) {
        const psg = sGroups[parent - 1];
        if (psg.type === 'GEN') sg.atoms = [].slice.call(psg.atoms);
      }
    }
  }
  for (sid in sGroups) sGroup.loadSGroup(ctab, sGroups[sid], atomMap);
  const emptyGroups = [];
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
  return ctab;
}

function parseRg2000(
  /* string[] */ ctabLines,
  /* boolean */ ignoreChiralFlag,
) /* Struct */ {
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
  const fragmentLines = {};
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
  const frag = {};
  if (loadRGroupFragments) {
    for (const strId in fragmentLines) {
      const id = parseInt(strId, 10);
      frag[id] = [];
      for (let j = 0; j < fragmentLines[id].length; ++j) {
        frag[id].push(parseCTab(fragmentLines[id][j], ignoreChiralFlag));
      }
    }
  }
  return utils.rgMerge(core, frag);
}

function parseRxn2000(
  /* string[] */ ctabLines,
  /* boolean */ shouldReactionRelayout,
  /* boolean */ ignoreChiralFlag,
) /* Struct */ {
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
  const mols = [];
  while (ctabLines.length > 0 && ctabLines[0].substr(0, 4) === '$MOL') {
    ctabLines = ctabLines.slice(1);
    let n = 0;
    while (n < ctabLines.length && ctabLines[n].substr(0, 4) !== '$MOL') n++;

    const lines = ctabLines.slice(0, n);
    let struct;
    if (lines[0].search('\\$MDL') === 0) {
      struct = parseRg2000(lines, /* boolean */ ignoreChiralFlag);
    } else {
      struct = parseCTab(lines.slice(3), /* boolean */ ignoreChiralFlag);
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

function parseCTab(
  /* string */ ctabLines,
  /* boolean */ ignoreChiralFlag,
) /* Struct */ {
  /* reader */
  const countsSplit = utils.partitionLine(
    ctabLines[0],
    utils.fmtInfo.countsLinePartition,
  );
  ctabLines = ctabLines.slice(1);
  return parseCTabV2000(ctabLines, countsSplit, ignoreChiralFlag);
}

function labelsListToIds(labels) {
  /* reader */
  const ids = [];
  for (let i = 0; i < labels.length; ++i) {
    const element = Elements.get(labels[i].trim());
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
function parsePropertyLineAtomList(hdr, lst) {
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
