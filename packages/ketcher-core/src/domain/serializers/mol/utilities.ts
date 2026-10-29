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
import { Bond } from 'domain/entities/bond';
import { RxnArrow, RxnArrowMode } from 'domain/entities/rxnArrow';
import { RxnPlus } from 'domain/entities/rxnPlus';
import { Struct } from 'domain/entities/struct';
import { Vec2 } from 'domain/entities/vec2';
import { RGroup } from 'domain/entities/rgroup';
import { Fragment } from 'domain/entities/fragment';
import type { Atom } from 'domain/entities/atom';
import type { SGroup } from 'domain/entities/sgroup';

/**
 * Bounding box with min and max coordinates
 */
interface BoundingBox {
  min: Vec2;
  max: Vec2;
}

/**
 * Formatted information for mol file parsing/serialization
 */
interface FmtInfo {
  bondTypeMap: Record<number, number>;
  bondStereoMap: Record<number, number>;
  v30bondStereoMap: Record<number, number>;
  bondTopologyMap: Record<number, number>;
  countsLinePartition: number[];
  atomLinePartition: number[];
  bondLinePartition: number[];
  atomListHeaderPartition: number[];
  atomListHeaderLength: number;
  atomListHeaderItemLength: number;
  chargeMap: (number | null)[];
  valenceMap: (number | undefined)[];
  implicitHydrogenMap: (number | undefined)[];
  v30atomPropMap: Record<string, string>;
  rxnItemsPartition: number[];
}

/**
 * Categorized molecules organized by fragment type
 */
interface CategorizedMolecules {
  bbReact: BoundingBox[];
  bbAgent: BoundingBox[];
  bbProd: BoundingBox[];
  molReact: Struct[];
  molAgent: Struct[];
  molProd: Struct[];
}

enum FragmentType {
  None = 0,
  Reactant = 1,
  Product = 2,
  Agent = 3,
}

const SHOULD_RESCALE_MOLECULES = true;

function paddedNumber(
  number: number | string,
  width: number,
  precision?: number,
): string {
  const parsedNumber = Number.parseFloat(String(number));

  const numberString = parsedNumber.toFixed(precision || 0).replace(',', '.'); // Really need to replace?
  if (numberString.length > width) throw new Error('number does not fit');

  return numberString.padStart(width);
}

/**
 * Parse a decimal integer from string
 * @param string_ - The string to parse
 * @returns The parsed integer, or 0 if parsing fails
 */
function parseDecimalInt(string_: string): number {
  /* reader */
  const value = Number.parseInt(string_, 10);

  return Number.isNaN(value) ? 0 : value;
}

/**
 * Partition a line string into parts of varying lengths
 * @param string_ - The string to partition
 * @param parts - Array of lengths for each part
 * @param hasSpaceBetweenParts - Whether there's a space between parts (default: false)
 * @returns Array of string parts
 */
function partitionLine(
  string_: string,
  parts: number[],
  hasSpaceBetweenParts: boolean = false,
): string[] {
  /* reader */
  const result: string[] = [];
  for (let index = 0, shift = 0; index < parts.length; ++index) {
    result.push(string_.slice(shift, shift + parts[index]));
    if (hasSpaceBetweenParts) shift++;
    shift += parts[index];
  }
  return result;
}

/**
 * Partition a line string into fixed-length parts
 * @param string_ - The string to partition
 * @param itemLength - Length of each item
 * @param hasSpaceBetweenParts - Whether there's a space between items (default: false)
 * @returns Array of string parts
 */
function partitionLineFixed(
  string_: string,
  itemLength: number,
  hasSpaceBetweenParts: boolean = false,
): string[] {
  /* reader */
  const result: string[] = [];
  const step = hasSpaceBetweenParts ? itemLength + 1 : itemLength;
  let shift = 0;
  while (shift < string_.length) {
    result.push(string_.slice(shift, shift + itemLength));
    shift += step;
  }
  return result;
}

const fmtInfo: FmtInfo = {
  bondTypeMap: {
    1: Bond.PATTERN.TYPE.SINGLE,
    2: Bond.PATTERN.TYPE.DOUBLE,
    3: Bond.PATTERN.TYPE.TRIPLE,
    4: Bond.PATTERN.TYPE.AROMATIC,
    5: Bond.PATTERN.TYPE.SINGLE_OR_DOUBLE,
    6: Bond.PATTERN.TYPE.SINGLE_OR_AROMATIC,
    7: Bond.PATTERN.TYPE.DOUBLE_OR_AROMATIC,
    8: Bond.PATTERN.TYPE.ANY,
    9: Bond.PATTERN.TYPE.DATIVE,
    10: Bond.PATTERN.TYPE.HYDROGEN,
  },
  bondStereoMap: {
    0: Bond.PATTERN.STEREO.NONE,
    1: Bond.PATTERN.STEREO.UP,
    4: Bond.PATTERN.STEREO.EITHER,
    6: Bond.PATTERN.STEREO.DOWN,
    3: Bond.PATTERN.STEREO.CIS_TRANS,
  },
  v30bondStereoMap: {
    0: Bond.PATTERN.STEREO.NONE,
    1: Bond.PATTERN.STEREO.UP,
    2: Bond.PATTERN.STEREO.EITHER,
    3: Bond.PATTERN.STEREO.DOWN,
  },
  bondTopologyMap: {
    0: Bond.PATTERN.TOPOLOGY.EITHER,
    1: Bond.PATTERN.TOPOLOGY.RING,
    2: Bond.PATTERN.TOPOLOGY.CHAIN,
  },
  countsLinePartition: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 6],
  atomLinePartition: [10, 10, 10, 1, 3, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
  bondLinePartition: [3, 3, 3, 3, 3, 3, 3],
  atomListHeaderPartition: [3, 1, 1, 4, 1, 1],
  atomListHeaderLength: 11, // = atomListHeaderPartition.reduce(function(a,b) { return a + b; }, 0)
  atomListHeaderItemLength: 4,
  chargeMap: [null, +3, +2, +1, null, -1, -2, -3],
  valenceMap: [undefined, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 0],
  implicitHydrogenMap: [undefined, 0, 1, 2, 3, 4],
  v30atomPropMap: {
    CHG: 'charge',
    RAD: 'radical',
    MASS: 'isotope',
    VAL: 'explicitValence',
    HCOUNT: 'hCount',
    INVRET: 'invRet',
    SUBST: 'substitutionCount',
    UNSAT: 'unsaturatedAtom',
    RBCNT: 'ringBondCount',
  },
  rxnItemsPartition: [3, 3, 3],
};

/**
 * Calculate the median bond length across molecules
 * @param mols - Array of molecules (Struct instances)
 * @returns Median bond length, or 1 if no positive bond length exists
 */
function calculateMedianBondLength(mols: Struct[]): number {
  const lengths: number[] = [];
  for (const mol of mols) {
    // Appended one by one on purpose: push(...arr) overflows the stack once a
    // reaction carries more than ~100k bonds across all its fragments.
    for (const length of mol.getBondLengths()) {
      lengths.push(length);
    }
  }
  const median = Struct.median(lengths);
  return median > 0 ? median : 1;
}

// Same normalization rule as Struct.rescale(): median bond length, not mean, and
// the same sanity bounds on the resulting factor.
function rescaleMolecules(mols: Struct[]): void {
  const medianBondLength = calculateMedianBondLength(mols);
  const scaleFactor = 1 / medianBondLength;
  if (!Struct.isRescaleFactorSane(scaleFactor)) {
    return;
  }
  for (const mol of mols) {
    mol.scale(scaleFactor);
  }
}

/**
 * Determine the fragment type based on index
 * @param index - Index of the molecule
 * @param nReactants - Number of reactants
 * @param nProducts - Number of products
 * @returns Fragment type (Reactant, Product, or Agent)
 */
function getFragmentType(
  index: number,
  nReactants: number,
  nProducts: number,
): FragmentType {
  if (index < nReactants) {
    return FragmentType.Reactant;
  } else if (index < nReactants + nProducts) {
    return FragmentType.Product;
  } else {
    return FragmentType.Agent;
  }
}

/**
 * Categorize molecules into reactants, products, and agents
 * @param mols - Array of molecules
 * @param nReactants - Number of reactants
 * @param nProducts - Number of products
 * @returns Categorized molecules and their bounding boxes
 */
function categorizeMolecules(
  mols: Struct[],
  nReactants: number,
  nProducts: number,
): CategorizedMolecules {
  const bbReact: BoundingBox[] = [];
  const bbAgent: BoundingBox[] = [];
  const bbProduction: BoundingBox[] = [];
  const molReact: Struct[] = [];
  const molAgent: Struct[] = [];
  const molProduction: Struct[] = [];

  for (let index = 0; index < mols.length; ++index) {
    const mol = mols[index];
    const bb = mol.getCoordBoundingBoxObj();
    if (!bb) continue;

    const fragmentType = getFragmentType(index, nReactants, nProducts);

    if (fragmentType === FragmentType.Reactant) {
      bbReact.push(bb);
      molReact.push(mol);
    } else if (fragmentType === FragmentType.Agent) {
      bbAgent.push(bb);
      molAgent.push(mol);
    } else if (fragmentType === FragmentType.Product) {
      bbProduction.push(bb);
      molProduction.push(mol);
    }

    mol.atoms.forEach((atom: Atom) => {
      atom.rxnFragmentType = fragmentType;
    });
  }

  return {
    bbReact,
    bbAgent,
    bbProd: bbProduction,
    molReact,
    molAgent,
    molProd: molProduction,
  };
}

/**
 * Shift a molecule and merge it into the result
 * @param returnValue - Result structure to merge into
 * @param mol - Molecule to shift and merge
 * @param bb - Bounding box of the molecule
 * @param xorig - X origin for shifting
 * @param isAboveReactionArrow - Whether to shift vertically over (true) or center (false)
 * @returns Width of the shifted molecule
 */
function shiftMol(
  returnValue: Struct,
  mol: Struct,
  bb: BoundingBox,
  xorig: number,
  isAboveReactionArrow: boolean,
): number {
  const d = new Vec2(
    xorig - bb.min.x,
    isAboveReactionArrow ? 1 - bb.min.y : -(bb.min.y + bb.max.y) / 2,
  );
  mol.atoms.forEach((atom: Atom) => {
    atom.pp.add_(d);
  });

  mol.sgroups.forEach((item: SGroup) => {
    if (item.pp) item.pp.add_(d);
  });
  bb.min.add_(d);
  bb.max.add_(d);
  mol.mergeInto(returnValue);
  return bb.max.x - bb.min.x;
}

/**
 * Layout reaction fragments (reactants, agents, products)
 * @param returnValue - Result structure to add molecules to
 * @param molReact - Reactant molecules
 * @param bbReact - Reactant bounding boxes
 * @param molAgent - Agent molecules
 * @param bbAgent - Agent bounding boxes
 * @param molProduction - Product molecules
 * @param bbProduction - Product bounding boxes
 */
function layoutReactionFragments(
  returnValue: Struct,
  molReact: Struct[],
  bbReact: BoundingBox[],
  molAgent: Struct[],
  bbAgent: BoundingBox[],
  molProduction: Struct[],
  bbProduction: BoundingBox[],
): void {
  let xorig = 0;
  for (let index = 0; index < molReact.length; ++index) {
    xorig +=
      shiftMol(returnValue, molReact[index], bbReact[index], xorig, false) + 2;
  }
  xorig += 2;
  for (let index = 0; index < molAgent.length; ++index) {
    xorig +=
      shiftMol(returnValue, molAgent[index], bbAgent[index], xorig, true) + 2;
  }
  xorig += 2;

  for (let index = 0; index < molProduction.length; ++index) {
    xorig +=
      shiftMol(
        returnValue,
        molProduction[index],
        bbProduction[index],
        xorig,
        false,
      ) + 2;
  }
}

/**
 * Merge molecules without layout
 * @param returnValue - Result structure to merge into
 * @param molReact - Reactant molecules
 * @param molAgent - Agent molecules
 * @param molProduction - Product molecules
 */
function mergeWithoutLayout(
  returnValue: Struct,
  molReact: Struct[],
  molAgent: Struct[],
  molProduction: Struct[],
): void {
  for (const mol of molReact) mol.mergeInto(returnValue);
  for (const mol of molAgent) mol.mergeInto(returnValue);
  for (const mol of molProduction) mol.mergeInto(returnValue);
}

/**
 * Add plus signs between molecule fragments
 * @param returnValue - Result structure to add plus signs to
 * @param boundingBoxes - Bounding boxes of molecules
 */
function addPlusSigns(returnValue: Struct, boundingBoxes: BoundingBox[]): void {
  for (let index = 0; index < boundingBoxes.length - 1; ++index) {
    const bb1 = boundingBoxes[index];
    const bb2 = boundingBoxes[index + 1];

    const x = (bb1.max.x + bb2.min.x) / 2;
    const y = (bb1.max.y + bb1.min.y + bb2.max.y + bb2.min.y) / 4;

    returnValue.rxnPluses.add(new RxnPlus({ pp: new Vec2(x, y) }));
  }
}

/**
 * Aggregate multiple bounding boxes into one
 * @param boundingBoxes - Array of bounding boxes to aggregate
 * @returns Aggregated bounding box, or null if input is empty
 */
function aggregateBoundingBoxes(
  boundingBoxes: BoundingBox[],
): BoundingBox | null {
  if (boundingBoxes.length === 0) return null;

  const bbAll: BoundingBox = {
    max: new Vec2(boundingBoxes[0].max),
    min: new Vec2(boundingBoxes[0].min),
  };

  for (let index = 1; index < boundingBoxes.length; ++index) {
    bbAll.max = Vec2.max(bbAll.max, boundingBoxes[index].max);
    bbAll.min = Vec2.min(bbAll.min, boundingBoxes[index].min);
  }

  return bbAll;
}

/**
 * Create a reaction arrow between two bounding boxes
 * @param bb1 - First bounding box (reactants)
 * @param bb2 - Second bounding box (products)
 * @returns Reaction arrow instance
 */
function createReactionArrow(
  bb1: BoundingBox | null,
  bb2: BoundingBox | null,
): RxnArrow {
  const defaultArrowLength = 2;
  const defaultOffset = 3;

  if (!bb1 && !bb2) {
    return new RxnArrow({
      mode: RxnArrowMode.OpenAngle,
      pos: [new Vec2(0, 0), new Vec2(defaultArrowLength, 0)],
    });
  }

  let v1: Vec2 | null = bb1
    ? new Vec2(bb1.max.x, (bb1.max.y + bb1.min.y) / 2)
    : null;
  let v2: Vec2 | null = bb2
    ? new Vec2(bb2.min.x, (bb2.max.y + bb2.min.y) / 2)
    : null;

  if (!v1 && v2) {
    v1 = new Vec2(v2.x - defaultOffset, v2.y);
  }
  if (!v2 && v1) {
    v2 = new Vec2(v1.x + defaultOffset, v1.y);
  }

  const arrowCenter = Vec2.lc2(v1 || new Vec2(), 0.5, v2 || new Vec2(), 0.5);
  const arrowStart = new Vec2(
    arrowCenter.x - 0.5 * defaultArrowLength,
    arrowCenter.y,
    arrowCenter.z,
  );
  const arrowEnd = new Vec2(
    arrowCenter.x + 0.5 * defaultArrowLength,
    arrowCenter.y,
    arrowCenter.z,
  );

  return new RxnArrow({
    mode: RxnArrowMode.OpenAngle,
    pos: [arrowStart, arrowEnd],
  });
}

/**
 * Merge multiple molecules into a single reaction structure
 * @param mols - Array of molecules to merge
 * @param nReactants - Number of reactant molecules
 * @param nProducts - Number of product molecules
 * @param _nAgents - Number of agent molecules (currently unused, kept for API compatibility)
 * @param shouldReactionRelayout - Whether to layout fragments (default: false)
 * @returns Merged reaction structure
 */
function rxnMerge(
  mols: Struct[],
  nReactants: number,
  nProducts: number,
  _nAgents: number,
  shouldReactionRelayout?: boolean,
): Struct {
  /* reader */
  const returnValue = new Struct();

  if (SHOULD_RESCALE_MOLECULES) {
    rescaleMolecules(mols);
  }

  const { bbReact, bbAgent, bbProd, molReact, molAgent, molProd } =
    categorizeMolecules(mols, nReactants, nProducts);

  if (shouldReactionRelayout) {
    layoutReactionFragments(
      returnValue,
      molReact,
      bbReact,
      molAgent,
      bbAgent,
      molProd,
      bbProd,
    );
  } else {
    mergeWithoutLayout(returnValue, molReact, molAgent, molProd);
  }

  addPlusSigns(returnValue, bbReact);
  addPlusSigns(returnValue, bbProd);

  const bbReactAll = aggregateBoundingBoxes(bbReact);
  const bbProductionAll = aggregateBoundingBoxes(bbProd);

  const arrow = createReactionArrow(bbReactAll, bbProductionAll);
  returnValue.addRxnArrow(arrow);

  returnValue.isReaction = true;
  return returnValue;
}

/**
 * Merge R-group scaffold with R-groups
 * @param scaffold - Scaffold structure
 * @param rgroups - R-groups organized by ID
 * @returns Merged R-group structure
 */
function rgMerge(scaffold: Struct, rgroups: Record<number, Struct[]>): Struct {
  /* reader */
  const returnValue = new Struct();

  scaffold.mergeInto(returnValue, null, null, false, true);

  Object.keys(rgroups).forEach((id: string) => {
    const rgid = Number.parseInt(id, 10);

    for (const ctab of rgroups[rgid]) {
      ctab.rgroups.set(rgid, new RGroup());
      const frag = new Fragment();
      const frid = ctab.frags.add(frag);
      ctab.rgroups.get(rgid)?.frags.add(frid);
      ctab.atoms.forEach((atom: Atom) => {
        atom.fragment = frid;
      });
      ctab.mergeInto(returnValue);
    }
  });

  return returnValue;
}

export default {
  fmtInfo,
  paddedNumber,
  parseDecimalInt,
  partitionLine,
  partitionLineFixed,
  rxnMerge,
  rgMerge,
};
