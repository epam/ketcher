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
  AtomList,
  AtomAttributes,
  Bond,
  BondAttributes,
  Fragment,
  RGroup,
  SGroup,
  Struct,
  Vec2,
} from 'domain/entities';

import { Elements } from 'domain/constants';
import sGroup from './parseSGroup';
import utils from './utils';

function parseAtomLineV3000(line: string): Atom {
  /* reader */
  const split = spacebarsplit(line);
  const params: Partial<AtomAttributes> & Record<string, unknown> = {
    pp: new Vec2(
      parseFloat(split[2]),
      -parseFloat(split[3]),
      parseFloat(split[4]),
    ),
    aam: parseInt(split[5].trim(), 10),
  };
  let label = split[1].trim();
  if (label.charAt(0) === '"' && label.charAt(label.length - 1) === '"') {
    label = label.slice(1, -1);
  } // strip quotation marks
  if (label.charAt(label.length - 1) === ']') {
    // assume atom list
    label = label.slice(0, -1); // remove ']'
    const atomListParams: { notList: boolean; ids: number[] } = {
      notList: false,
      ids: [],
    };
    const matchNotListInfo = label.match(/NOT ?\[/);
    if (matchNotListInfo) {
      atomListParams.notList = true;
      const [matchedSubstr] = matchNotListInfo;
      label = label.slice(matchedSubstr.length); // remove 'NOT [' or 'NOT['
    } else if (label.charAt(0) !== '[') {
      throw new Error("Error: atom list expected, found '" + label + "'");
    } else {
      label = label.slice(1); // remove '['
    }
    atomListParams.ids = labelsListToIds(label.split(','));
    params.atomList = new AtomList(atomListParams);
    params.label = 'L#';
  } else {
    params.label = label;
  }
  split.splice(0, 6);
  for (let i = 0; i < split.length; ++i) {
    const subsplit = splitonce(split[i], '=');
    const key = subsplit[0];
    let value = subsplit[1];
    if (key in utils.fmtInfo.v30atomPropMap) {
      let ival = utils.parseDecimalInt(value);
      if (key === 'VAL') {
        if (ival === 0) continue; // eslint-disable-line no-continue
        if (ival === -1) ival = 0;
      }
      (params as Record<string, unknown>)[
        (utils.fmtInfo.v30atomPropMap as Record<string, string>)[key]
      ] = ival;
    } else if (key === 'RGROUPS') {
      value = value.trim().slice(1, -1);
      const rgrsplit = value.split(' ').slice(1);
      const extParams = params as Record<string, unknown>;
      extParams.rglabel = 0;
      for (const rgrValue of rgrsplit) {
        extParams.rglabel =
          (extParams.rglabel as number) | (1 << (Number(rgrValue) - 1));
      }
    } else if (key === 'ATTCHPT') {
      params.attpnt = value.trim();
    }
  }

  return new Atom(params as AtomAttributes);
}

function parseBondLineV3000(line: string): Bond {
  /* reader */
  const split = spacebarsplit(line);
  const params: Partial<BondAttributes> & Record<string, unknown> = {
    begin: utils.parseDecimalInt(split[2]) - 1,
    end: utils.parseDecimalInt(split[3]) - 1,
    type: utils.fmtInfo.bondTypeMap[utils.parseDecimalInt(split[1])],
  };
  split.splice(0, 4);
  for (let i = 0; i < split.length; ++i) {
    const subsplit = splitonce(split[i], '=');
    const key = subsplit[0];
    const value = subsplit[1];
    if (key === 'CFG') {
      params.stereo =
        utils.fmtInfo.v30bondStereoMap[utils.parseDecimalInt(value)];
      if (
        params.type === Bond.PATTERN.TYPE.DOUBLE &&
        params.stereo === Bond.PATTERN.STEREO.EITHER
      ) {
        params.stereo = Bond.PATTERN.STEREO.CIS_TRANS;
      }
    } else if (key === 'TOPO') {
      params.topology =
        utils.fmtInfo.bondTopologyMap[utils.parseDecimalInt(value)];
    } else if (key === 'RXCTR') {
      params.reactingCenterStatus = utils.parseDecimalInt(value);
    } else if (key === 'STBOX') {
      params.stereoCare = utils.parseDecimalInt(value);
    }
  }
  return new Bond(params as BondAttributes);
}

function v3000parseCollection(
  _ctab: Struct,
  ctabLines: string[],
  shift: number,
): number {
  /* reader */
  shift++;
  while (ctabLines[shift].trim() !== 'M  V30 END COLLECTION') shift++;
  shift++;
  return shift;
}

function v3000parseSGroup(
  ctab: Struct,
  ctabLines: string[],
  sgroups: Record<number, SGroup>,
  atomMap: Record<number, number>,
  shift: number,
): number {
  // eslint-disable-line max-params, max-statements
  /* reader */
  let line = '';
  shift++;
  while (shift < ctabLines.length) {
    line = stripV30(ctabLines[shift++]).trim();
    if (line.trim() === 'END SGROUP') return shift;
    while (line.charAt(line.length - 1) === '-') {
      line = (line.slice(0, -1) + stripV30(ctabLines[shift++])).trim();
    }
    const split = splitSGroupDef(line);
    const type = split[1];
    const sg = new SGroup(type);
    (sg as SGroup & { number: number }).number = Number(split[0]);
    sg.type = type;
    sg.label = Number(split[2]);
    sgroups[(sg as SGroup & { number: number }).number] = sg;
    const props: Record<string, string[]> = {};
    for (const splitItem of split.slice(3)) {
      const subsplit = splitonce(splitItem, '=');
      if (subsplit.length !== 2) {
        throw new Error(
          "A record of form AAA=BBB or AAA=(...) expected, got '" +
            splitItem +
            "'",
        );
      }
      const name = subsplit[0];
      if (!(name in props)) props[name] = [];
      props[name].push(subsplit[1]);
    }
    sg.atoms = parseBracedNumberList(props.ATOMS[0], -1);
    if (props.PATOMS) {
      sg.patoms = parseBracedNumberList(props.PATOMS[0], -1);
    }
    sg.bonds = props.BONDS ? parseBracedNumberList(props.BONDS[0], -1) : [];
    const brkxyzStrs = props.BRKXYZ;
    const sgExt = sg as SGroup & { brkxyz: number[][] };
    sgExt.brkxyz = [];
    if (brkxyzStrs) {
      for (const brkxyzStr of brkxyzStrs) {
        sgExt.brkxyz.push(parseBracedNumberList(brkxyzStr));
      }
    }
    if (props.MULT) sg.data.subscript = Number(props.MULT[0]);
    if (props.LABEL) sg.data.subscript = props.LABEL[0].trim();
    if (props.CONNECT) {
      sg.data.connectivity = props.CONNECT[0].toLowerCase();
    }
    if (props.FIELDDISP) {
      sGroup.applyDataSGroupInfo(sg, stripQuotes(props.FIELDDISP[0]));
    }
    if (props.FIELDDATA) {
      sGroup.applyDataSGroupData(sg, props.FIELDDATA[0], true);
    }
    if (props.FIELDNAME) {
      sGroup.applyDataSGroupName(sg, props.FIELDNAME[0]);
    }
    if (props.QUERYTYPE) {
      sGroup.applyDataSGroupQuery(sg, props.QUERYTYPE[0]);
    }
    if (props.QUERYOP) sGroup.applyDataSGroupQueryOp(sg, props.QUERYOP[0]);
    sGroup.loadSGroup(ctab, sg, atomMap);
    if (props.ESTATE) sGroup.applyDataSGroupExpand(sg, props.ESTATE[0]);
  }
  throw new Error('S-group declaration incomplete.');
}

function parseCTabV3000(ctabLines: string[], norgroups?: unknown): Struct {
  // eslint-disable-line max-statements
  /* reader */
  const ctab = new Struct();

  let shift = 0;
  if (ctabLines[shift++].trim() !== 'M  V30 BEGIN CTAB') {
    throw Error('CTAB V3000 invalid');
  }
  if (ctabLines[shift].slice(0, 13) !== 'M  V30 COUNTS') {
    throw Error('CTAB V3000 invalid');
  }
  const vals = ctabLines[shift].slice(14).split(' ');
  const isAbs = utils.parseDecimalInt(vals[4]) === 1;
  shift++;

  if (ctabLines[shift].trim() === 'M  V30 BEGIN ATOM') {
    shift++;
    let line: string;
    while (shift < ctabLines.length) {
      line = stripV30(ctabLines[shift++]).trim();
      if (line === 'END ATOM') break;
      while (line.charAt(line.length - 1) === '-') {
        line = (
          line.substring(0, line.length - 1) + stripV30(ctabLines[shift++])
        ).trim();
      }
      ctab.atoms.add(parseAtomLineV3000(line));
    }

    if (ctabLines[shift].trim() === 'M  V30 BEGIN BOND') {
      shift++;
      while (shift < ctabLines.length) {
        line = stripV30(ctabLines[shift++]).trim();
        if (line === 'END BOND') break;
        while (line.charAt(line.length - 1) === '-') {
          line = (
            line.substring(0, line.length - 1) + stripV30(ctabLines[shift++])
          ).trim();
        }
        const bond = parseBondLineV3000(line);
        if (bond.stereo && isAbs) {
          const atom = ctab.atoms.get(bond.begin);
          if (atom) atom.stereoLabel = 'abs';
        }
        ctab.bonds.add(bond);
      }
    }

    // TODO: let sections follow in arbitrary order
    const sgroups: Record<number, SGroup> = {};
    const atomMap: Record<number, number> = {};

    while (ctabLines[shift].trim() !== 'M  V30 END CTAB') {
      if (ctabLines[shift].trim() === 'M  V30 BEGIN COLLECTION') {
        // TODO: read collection information
        shift = v3000parseCollection(ctab, ctabLines, shift);
      } else if (ctabLines[shift].trim() === 'M  V30 BEGIN SGROUP') {
        shift = v3000parseSGroup(ctab, ctabLines, sgroups, atomMap, shift);
      } else throw Error('CTAB V3000 invalid');
    }
  }
  if (ctabLines[shift++].trim() !== 'M  V30 END CTAB') {
    throw Error('CTAB V3000 invalid');
  }

  if (!norgroups) readRGroups3000(ctab, ctabLines.slice(shift));

  return ctab;
}

function readRGroups3000(ctab: Struct, ctabLines: string[]): void {
  // eslint-disable-line max-statements
  /* reader */
  const rfrags: Record<string, Struct[]> = {};
  const rLogic: Record<string, Record<string, unknown>> = {};
  let shift = 0;
  while (
    shift < ctabLines.length &&
    ctabLines[shift].search('M  V30 BEGIN RGROUP') === 0
  ) {
    const id = ctabLines[shift++].split(' ').pop() ?? '';
    rfrags[id] = [];
    rLogic[id] = {};
    while (true) {
      // eslint-disable-line no-constant-condition
      let line = ctabLines[shift].trim();
      if (line.search('M  V30 RLOGIC') === 0) {
        line = line.slice(13);
        const rlsplit = line.trim().split(/\s+/g);
        const iii = utils.parseDecimalInt(rlsplit[0]);
        const hhh = utils.parseDecimalInt(rlsplit[1]);
        const ooo = rlsplit.slice(2).join(' ');
        const logic: Record<string, unknown> = {};
        if (iii > 0) logic.ifthen = iii;
        logic.resth = hhh === 1;
        logic.range = ooo;
        rLogic[id] = logic;
        shift++;
        continue; // eslint-disable-line no-continue
      }
      if (line !== 'M  V30 BEGIN CTAB') throw Error('CTAB V3000 invalid');
      let i: number;
      for (i = 0; i < ctabLines.length; ++i) {
        if (ctabLines[shift + i].trim() === 'M  V30 END CTAB') break;
      }
      const lines = ctabLines.slice(shift, shift + i + 1);
      const rfrag = parseCTabV3000(lines, true);
      rfrags[id].push(rfrag);
      shift = shift + i + 1;
      if (ctabLines[shift].trim() === 'M  V30 END RGROUP') {
        shift++;
        break;
      }
    }
  }

  Object.keys(rfrags).forEach((rgid) => {
    rfrags[rgid].forEach((rg) => {
      rg.rgroups.set(Number(rgid), new RGroup(rLogic[rgid]));
      const frid = rg.frags.add(new Fragment());
      rg.rgroups.get(Number(rgid))?.frags.add(frid);
      rg.atoms.forEach((atom: Atom) => {
        atom.fragment = frid;
      });
      rg.mergeInto(ctab);
    });
  });
}

function parseRxn3000(
  ctabLines: string[],
  shouldReactionRelayout: boolean,
): Struct {
  // eslint-disable-line max-statements
  /* reader */
  ctabLines = ctabLines.slice(4);
  const countsSplit = ctabLines[0].split(/\s+/g).slice(3);
  const nReactants = Number(countsSplit[0]);
  const nProducts = Number(countsSplit[1]);
  const nAgents = countsSplit.length > 2 ? Number(countsSplit[2]) : 0;

  function findCtabEnd(i: number): number {
    for (let j = i; j < ctabLines.length; ++j) {
      if (ctabLines[j].trim() === 'M  V30 END CTAB') return j;
    }

    return console.error('CTab format invalid') as never;
  }

  function findRGroupEnd(i: number): number {
    for (let j = i; j < ctabLines.length; ++j) {
      if (ctabLines[j].trim() === 'M  V30 END RGROUP') return j;
    }
    return console.error('CTab format invalid') as never;
  }

  const molLinesReactants: string[][] = [];
  const molLinesProducts: string[][] = [];
  const molLinesAgents: string[][] = [];
  let current: string[][] | null = null;
  const rGroups: string[][] = [];
  let i = 0;
  while (i < ctabLines.length) {
    const line = ctabLines[i].trim();

    if (line.startsWith('M  V30 COUNTS')) {
      // do nothing
    } else if (line === 'M  END') {
      break; // stop reading
    } else if (line === 'M  V30 BEGIN PRODUCT') {
      current = molLinesProducts;
    } else if (line === 'M  V30 END PRODUCT') {
      current = null;
    } else if (line === 'M  V30 BEGIN REACTANT') {
      current = molLinesReactants;
    } else if (line === 'M  V30 END REACTANT') {
      current = null;
    } else if (line === 'M  V30 BEGIN AGENT') {
      current = molLinesAgents;
    } else if (line === 'M  V30 END AGENT') {
      current = null;
    } else if (line.startsWith('M  V30 BEGIN RGROUP')) {
      const j = findRGroupEnd(i);
      rGroups.push(ctabLines.slice(i, j + 1));
      i = j + 1;
      continue;
    } else if (line === 'M  V30 BEGIN CTAB') {
      const j = findCtabEnd(i);
      if (current) current.push(ctabLines.slice(i, j + 1));
      i = j + 1;
      continue;
    } else {
      throw new Error('line unrecognized: ' + line);
    }
    i++;
  }
  const mols: Struct[] = [];
  const molLines = molLinesReactants
    .concat(molLinesProducts)
    .concat(molLinesAgents);
  for (const molLine of molLines) {
    const mol = parseCTabV3000(molLine, countsSplit);
    mols.push(mol);
  }
  const ctab = utils.rxnMerge(
    mols,
    nReactants,
    nProducts,
    nAgents,
    shouldReactionRelayout,
  );

  readRGroups3000(
    ctab,
    (function (array: string[][]): string[] {
      let res: string[] = [];
      for (const item of array) res = res.concat(item);
      return res;
    })(rGroups),
  );

  return ctab;
}

// split a line by spaces outside parentheses
function spacebarsplit(line: string): string[] {
  // eslint-disable-line max-statements
  /* reader */
  const split: string[] = [];
  let bracketEquality = 0;
  let currentIndex = 0;
  let firstSliceIndex = -1;
  let quoted = false;

  while (currentIndex < line.length) {
    const currentSymbol = line[currentIndex];
    if (line.slice(currentIndex, currentIndex + 3) === 'NOT') {
      const closingBracketIndex = line.indexOf(']');
      split.push(line.slice(currentIndex, closingBracketIndex + 1));
      currentIndex = closingBracketIndex + 1;
      firstSliceIndex = currentIndex;
    } else if (currentSymbol === '(') bracketEquality += 1;
    else if (currentSymbol === ')') bracketEquality -= 1;
    else if (currentSymbol === '"') quoted = !quoted;
    else if (!quoted && line[currentIndex] === ' ' && bracketEquality === 0) {
      if (currentIndex > firstSliceIndex + 1) {
        split.push(line.slice(firstSliceIndex + 1, currentIndex));
      }
      firstSliceIndex = currentIndex;
    }
    currentIndex += 1;
  }
  if (currentIndex > firstSliceIndex + 1) {
    split.push(line.slice(firstSliceIndex + 1, currentIndex));
  }
  return split;
}

// utils
function stripQuotes(str: string): string {
  if (str[0] === '"' && str[str.length - 1] === '"') {
    return str.slice(1, -1);
  }
  return str;
}

function splitonce(line: string, delim: string): [string, string] {
  /* reader */
  const p = line.indexOf(delim);
  return [line.slice(0, p), line.slice(p + 1)];
}

function splitSGroupDef(line: string): string[] {
  // eslint-disable-line max-statements
  /* reader */
  const split: string[] = [];
  let braceBalance = 0;
  let quoted = false;
  let i = 0;
  while (i < line.length) {
    const c = line.charAt(i);
    if (c === '"') {
      quoted = !quoted;
    } else if (!quoted) {
      if (c === '(') {
        braceBalance++;
      } else if (c === ')') {
        braceBalance--;
      } else if (c === ' ' && braceBalance === 0) {
        split.push(line.slice(0, i));
        line = line.slice(i + 1).trim();
        i = 0;
        continue;
      }
    }
    i++;
  }
  if (braceBalance !== 0) {
    throw new Error('Brace balance broken. S-group properies invalid!');
  }
  if (line.length > 0) split.push(line.trim());
  return split;
}

function parseBracedNumberList(line: string, shift?: number): number[] {
  /* reader */
  if (!line) return [];
  const list: number[] = [];
  line = line.trim();
  line = line.slice(1, -1);
  const splitParts = line.split(' ');
  const shiftVal = shift || 0;

  for (const splitItem of splitParts.slice(1)) {
    const value = parseInt(splitItem);
    if (!isNaN(value)) {
      // eslint-disable-line
      list.push(value + shiftVal);
    }
  }

  return list;
}

function stripV30(line: string): string {
  /* reader */
  if (line.slice(0, 7) !== 'M  V30 ') throw new Error('Prefix invalid');
  return line.slice(7);
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

export default {
  parseCTabV3000,
  readRGroups3000,
  parseRxn3000,
};
