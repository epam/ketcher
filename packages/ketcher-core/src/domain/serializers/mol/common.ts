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

import { MonomerMicromolecule, Pile, SGroup, Struct } from 'domain/entities';

import { Mapping } from './mol.types';
import utils from './utils';
import v2000 from './v2000';
import v3000 from './v3000';

interface SGroupSavingError extends Error {
  id: number;
  'error-type': string;
}

const loadRGroupFragments = true; // TODO: set to load the fragments

/* Parse Mol */
function parseMol(ctabLines: string[], ignoreChiralFlag?: boolean): Struct {
  if (ctabLines[0].search('\\$MDL') === 0) {
    const struct = v2000.parseRg2000(ctabLines, ignoreChiralFlag);
    struct.name = ctabLines[3].trim();
    return struct;
  }
  const struct = parseCTab(ctabLines.slice(3), ignoreChiralFlag);
  struct.name = ctabLines[0].trim();
  return struct;
}

function parseCTab(ctabLines: string[], ignoreChiralFlag?: boolean): Struct {
  const countsSplit = partitionLine(
    ctabLines[0],
    utils.fmtInfo.countsLinePartition,
  );
  const version = countsSplit[11].trim();
  ctabLines = ctabLines.slice(1);
  if (version === 'V2000') {
    return v2000.parseCTabV2000(ctabLines, countsSplit, ignoreChiralFlag);
  }
  if (version === 'V3000') {
    return v3000.parseCTabV3000(ctabLines, !loadRGroupFragments);
  } else {
    throw new Error('Molfile version unknown: ' + version);
  }
}

/* Parse Rxn */
function parseRxn(
  ctabLines: string[],
  shouldReactionRelayout?: boolean,
  ignoreChiralFlag?: boolean,
): Struct {
  const split = ctabLines[0].trim().split(' ');
  if (split.length > 1 && split[1] === 'V3000') {
    return v3000.parseRxn3000(ctabLines, shouldReactionRelayout);
  }

  const struct = v2000.parseRxn2000(
    ctabLines,
    shouldReactionRelayout,
    ignoreChiralFlag,
  );
  struct.name = ctabLines[1].trim();
  return struct;
}

/* Prepare For Saving */
const prepareForSaving: Record<string, (sgroup: SGroup, mol: Struct) => void> =
  {
    MUL: SGroup.prepareMulForSaving,
    SRU: prepareSruForSaving,
    SUP: prepareSupForSaving,
    DAT: prepareDatForSaving,
    GEN: prepareGenForSaving,
    COP: prepareCopForSaving,
    queryComponent: prepareQueryComponentForSaving,
  };

function prepareSruForSaving(sgroup: SGroup, mol: Struct): void {
  const xBonds: number[] = [];
  mol.bonds.forEach((bond, bid) => {
    const a1 = mol.atoms.get(bond.begin)!;
    const a2 = mol.atoms.get(bond.end)!;
    /* eslint-disable no-mixed-operators */
    if (
      (a1.sgs.has(sgroup.id) && !a2.sgs.has(sgroup.id)) ||
      (a2.sgs.has(sgroup.id) && !a1.sgs.has(sgroup.id))
    ) {
      /* eslint-enable no-mixed-operators */
      xBonds.push(bid);
    }
  });
  if (xBonds.length !== 0 && xBonds.length !== 2) {
    const error = new Error(
      'Unsupported cross-bonds number',
    ) as SGroupSavingError;
    error.id = sgroup.id;
    error['error-type'] = 'cross-bond-number';
    throw error;
  }
  sgroup.bonds = xBonds;
}

function prepareCopForSaving(sgroup: SGroup, mol: Struct): void {
  const xBonds: number[] = [];
  mol.bonds.forEach((bond, bid) => {
    const a1 = mol.atoms.get(bond.begin)!;
    const a2 = mol.atoms.get(bond.end)!;
    if (
      (a1.sgs.has(sgroup.id) && !a2.sgs.has(sgroup.id)) ||
      (a2.sgs.has(sgroup.id) && !a1.sgs.has(sgroup.id))
    ) {
      xBonds.push(bid);
    }
  });
  if (xBonds.length !== 0 && xBonds.length !== 2) {
    const error = new Error(
      'Unsupported cross-bonds number',
    ) as SGroupSavingError;
    error.id = sgroup.id;
    error['error-type'] = 'cross-bond-number';
    throw error;
  }
  sgroup.bonds = xBonds;
}

function prepareSupForSaving(sgroup: SGroup, mol: Struct): void {
  // This code is also used for GroupSru and should be moved into a separate common method
  // It seems that such code should be used for any sgroup by this this should be checked
  const xBonds: number[] = [];
  mol.bonds.forEach((bond, bid) => {
    const a1 = mol.atoms.get(bond.begin)!;
    const a2 = mol.atoms.get(bond.end)!;
    /* eslint-disable no-mixed-operators */
    if (
      (a1.sgs.has(sgroup.id) && !a2.sgs.has(sgroup.id)) ||
      (a2.sgs.has(sgroup.id) && !a1.sgs.has(sgroup.id))
    ) {
      /* eslint-enable no-mixed-operators */
      xBonds.push(bid);
    }
  });
  sgroup.bonds = xBonds;
}

function prepareGenForSaving(_sgroup: SGroup, _mol: Struct): void {
  // no-op
}

function prepareQueryComponentForSaving(_sgroup: SGroup, _mol: Struct): void {
  // no-op
}

function prepareDatForSaving(sgroup: SGroup, mol: Struct): void {
  sgroup.atoms = SGroup.getAtoms(mol, sgroup);
}

/* Save To Molfile */
const saveToMolfile: Record<
  string,
  (
    sgroup: SGroup,
    mol: Struct,
    sgMap: Mapping,
    atomMap: Mapping,
    bondMap: Mapping,
  ) => string
> = {
  MUL: saveMulToMolfile,
  SRU: saveSruToMolfile,
  COP: saveCopToMolfile,
  SUP: saveSupToMolfile,
  DAT: saveDatToMolfile,
  GEN: saveGenToMolfile,
};

function saveMulToMolfile(
  sgroup: SGroup,
  mol: Struct,
  sgMap: Mapping,
  atomMap: Mapping,
  bondMap: Mapping,
): string {
  const idstr = (sgMap[sgroup.id] + '').padStart(3);

  let lines: string[] = [];
  lines = lines.concat(
    makeAtomBondLines(
      'SAL',
      idstr,
      Array.from(sgroup.atomSet.values()),
      atomMap,
    ),
  ); // TODO: check atomSet
  lines = lines.concat(
    makeAtomBondLines(
      'SPA',
      idstr,
      Array.from(sgroup.parentAtomSet.values()),
      atomMap,
    ),
  );
  lines = lines.concat(makeAtomBondLines('SBL', idstr, sgroup.bonds, bondMap));
  const smtLine = 'M  SMT ' + idstr + ' ' + sgroup.data.mul;
  lines.push(smtLine);
  lines = lines.concat(bracketsToMolfile(mol, sgroup, idstr));
  return lines.join('\n');
}

function saveSruToMolfile(
  sgroup: SGroup,
  mol: Struct,
  sgMap: Mapping,
  atomMap: Mapping,
  bondMap: Mapping,
): string {
  const idstr = (sgMap[sgroup.id] + '').padStart(3);

  let lines: string[] = [];
  lines = lines.concat(makeAtomBondLines('SAL', idstr, sgroup.atoms, atomMap));
  lines = lines.concat(makeAtomBondLines('SBL', idstr, sgroup.bonds, bondMap));
  lines = lines.concat(bracketsToMolfile(mol, sgroup, idstr));
  return lines.join('\n');
}

function saveCopToMolfile(
  sgroup: SGroup,
  mol: Struct,
  sgMap: Mapping,
  atomMap: Mapping,
  bondMap: Mapping,
): string {
  const idstr = (sgMap[sgroup.id] + '').padStart(3);

  let lines: string[] = [];
  lines = lines.concat(makeAtomBondLines('SAL', idstr, sgroup.atoms, atomMap));
  lines = lines.concat(makeAtomBondLines('SBL', idstr, sgroup.bonds, bondMap));
  lines = lines.concat(bracketsToMolfile(mol, sgroup, idstr));
  return lines.join('\n');
}

function saveSupToMolfile(
  sgroup: SGroup,
  _mol: Struct,
  sgMap: Mapping,
  atomMap: Mapping,
  bondMap: Mapping,
): string {
  const idstr = (sgMap[sgroup.id] + '').padStart(3);

  let lines: string[] = [];
  lines = lines.concat(makeAtomBondLines('SAL', idstr, sgroup.atoms, atomMap));
  lines = lines.concat(makeAtomBondLines('SBL', idstr, sgroup.bonds, bondMap));

  let sgroupName: string | undefined;

  if (sgroup instanceof MonomerMicromolecule) {
    sgroupName = sgroup.monomer.label;
  } else if (sgroup.data.name && sgroup.data.name !== '') {
    sgroupName = sgroup.data.name;
  }

  if (sgroupName) {
    lines.push('M  SMT ' + idstr + ' ' + sgroupName);
  }

  if (sgroup.data.class) {
    lines.push('M  SCL ' + idstr + ' ' + sgroup.data.class);
  }

  return lines.join('\n');
}

function saveDatToMolfile(
  sgroup: SGroup,
  mol: Struct,
  sgMap: Mapping,
  atomMap: Mapping,
): string {
  const idstr = (sgMap[sgroup.id] + '').padStart(3);

  const data = sgroup.data;
  let pp = sgroup.pp!;
  if (!data.absolute) pp = pp.sub(SGroup.getMassCentre(mol, sgroup.atoms));
  let lines: string[] = [];
  lines = lines.concat(makeAtomBondLines('SAL', idstr, sgroup.atoms, atomMap));
  let sdtLine =
    'M  SDT ' +
    idstr +
    ' ' +
    (data.fieldName || '').padEnd(30) +
    (data.fieldType || '').padStart(2) +
    (data.units || '').padEnd(20) +
    (data.query || '').padStart(2);

  if (data.queryOp) {
    // see gitlab #184
    sdtLine += data.queryOp.padEnd(80 - 65);
  }

  lines.push(sdtLine);
  const sddLine =
    'M  SDD ' +
    idstr +
    ' ' +
    utils.paddedNum(pp.x, 10, 4) +
    utils.paddedNum(-pp.y, 10, 4) +
    '    ' + // ' eee'
    (data.attached ? 'A' : 'D') + // f
    (data.absolute ? 'A' : 'R') + // g
    (data.showUnits ? 'U' : ' ') + // h
    '   ' + //  i
    (data.nCharnCharsToDisplay >= 0
      ? utils.paddedNum(data.nCharnCharsToDisplay, 3)
      : 'ALL') + // jjj
    '  1   ' + // 'kkk ll '
    (data.tagChar || ' ') + // m
    '  ' +
    utils.paddedNum(data.daspPos, 1) + // n
    '  '; // oo
  lines.push(sddLine);
  const val = normalizeNewlines(data.fieldValue).replace(/\n*$/, '');
  const charsPerLine = 69;
  val.split('\n').forEach((chars) => {
    while (chars.length > charsPerLine) {
      lines.push('M  SCD ' + idstr + ' ' + chars.slice(0, charsPerLine));
      chars = chars.slice(charsPerLine);
    }
    lines.push('M  SED ' + idstr + ' ' + chars);
  });
  return lines.join('\n');
}

function saveGenToMolfile(
  sgroup: SGroup,
  mol: Struct,
  sgMap: Mapping,
  atomMap: Mapping,
  bondMap: Mapping,
): string {
  const idstr = (sgMap[sgroup.id] + '').padStart(3);

  let lines: string[] = [];
  lines = lines.concat(makeAtomBondLines('SAL', idstr, sgroup.atoms, atomMap));
  lines = lines.concat(makeAtomBondLines('SBL', idstr, sgroup.bonds, bondMap));
  lines = lines.concat(bracketsToMolfile(mol, sgroup, idstr));
  return lines.join('\n');
}

function makeAtomBondLines(
  prefix: string,
  idstr: string,
  ids: number[] | undefined,
  map: Mapping,
): string[] {
  if (!ids) return [];
  const lines: string[] = [];
  for (let i = 0; i < Math.floor((ids.length + 14) / 15); ++i) {
    const rem = Math.min(ids.length - 15 * i, 15); // eslint-disable-line no-mixed-operators
    let salLine = 'M  ' + prefix + ' ' + idstr + ' ' + utils.paddedNum(rem, 2);
    for (let j = 0; j < rem; ++j) {
      salLine += ' ' + utils.paddedNum(map[ids[i * 15 + j]], 3);
    } // eslint-disable-line no-mixed-operators
    lines.push(salLine);
  }
  return lines;
}

function bracketsToMolfile(mol: Struct, sg: SGroup, idstr: string): string[] {
  const atomSet = new Pile<number>(sg.atoms);
  const crossBonds = SGroup.getCrossBonds(mol, atomSet);
  SGroup.bracketPos(sg, mol);
  const bb = sg.bracketBox;
  const d = sg.bracketDirection;
  const n = d.rotateSC(1, 0);
  const brackets = SGroup.getBracketParameters(
    mol,
    crossBonds as any,
    atomSet,
    bb,
    d,
    n,
  );
  const lines: string[] = [];
  for (const bracket of brackets) {
    const a0 = bracket.c.addScaled(bracket.n, -0.5 * bracket.h).yComplement(0);
    const a1 = bracket.c.addScaled(bracket.n, 0.5 * bracket.h).yComplement(0);
    let line = 'M  SDI ' + idstr + utils.paddedNum(4, 3);
    const coord = [a0.x, a0.y, a1.x, a1.y];
    for (const coordValue of coord) {
      line += utils.paddedNum(coordValue, 10, 4);
    }
    lines.push(line);
  }
  return lines;
}

// According Unicode Consortium sould be
// nlRe = /\r\n|[\n\v\f\r\x85\u2028\u2029]/g;
// http://www.unicode.org/reports/tr18/#Line_Boundaries
const nlRe = /\r\n|[\n\r]/g;
function normalizeNewlines(str: string): string {
  return str.replace(nlRe, '\n');
}

function partitionLine(
  str: string,
  parts: number[],
  withspace?: boolean,
): string[] {
  const res: string[] = [];
  for (let i = 0, shift = 0; i < parts.length; ++i) {
    res.push(str.slice(shift, shift + parts[i]));
    if (withspace) shift++;
    shift += parts[i];
  }
  return res;
}

export default {
  parseCTab,
  parseMol,
  parseRxn,
  prepareForSaving,
  saveToMolfile,
};
