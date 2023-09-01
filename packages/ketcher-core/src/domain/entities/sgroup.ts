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

import { Atom } from './atom';
import { Bond } from './bond';
import { Box2Abs } from './box2Abs';
import { Pile } from './pile';
import { Struct } from './struct';
import { SaltsAndSolventsProvider } from '../helpers';
import { Vec2 } from './vec2';
import { ReStruct } from '../../application/render';
import { Pool, SGroupAttachmentPoint } from 'domain/entities';
import { ReSGroup } from 'application/render';
import { SgContexts } from 'application/editor/shared/constants';
import assert from 'assert';

export class SGroupBracketParams {
  readonly c: Vec2;
  readonly d: Vec2;
  readonly n: Vec2;
  readonly w: number;
  readonly h: number;

  constructor(c: Vec2, d: Vec2, w: number, h: number) {
    this.c = c;
    this.d = d;
    this.n = d.rotateSC(1, 0);
    this.w = w;
    this.h = h;
  }
}

export class SGroup {
  static TYPES = {
    SUP: 'SUP',
    MUL: 'MUL',
    SRU: 'SRU',
    MON: 'MON',
    MER: 'MER',
    COP: 'COP',
    CRO: 'CRO',
    MOD: 'MOD',
    GRA: 'GRA',
    COM: 'COM',
    MIX: 'MIX',
    FOR: 'FOR',
    DAT: 'DAT',
    ANY: 'ANY',
    GEN: 'GEN',
  };

  type: string;
  id: number;
  label: number;
  bracketBox: any;
  bracketDirection: Vec2;
  areas: any;
  hover: boolean;
  hovering: any;
  selected: boolean;
  selectionPlate: any;
  atoms: any;
  atomSet: any;
  parentAtomSet: any;
  patoms?: any;
  allAtoms: any;
  bonds: any;
  xBonds: any;
  neiAtoms: any;
  pp: Vec2 | null;
  data: any;
  dataArea: any;
  private readonly attachmentPoints: SGroupAttachmentPoint[];

  constructor(type: string) {
    this.type = type;
    this.id = -1;
    this.label = -1;
    this.bracketBox = null;
    this.bracketDirection = new Vec2(1, 0);
    this.areas = [];

    this.hover = false;
    this.hovering = null;
    this.selected = false;
    this.selectionPlate = null;

    this.atoms = [];
    this.patoms = [];
    this.bonds = [];
    this.xBonds = [];
    this.neiAtoms = [];
    this.attachmentPoints = [];
    this.pp = null;
    this.data = {
      mul: 1, // multiplication count for MUL group
      connectivity: 'ht', // head-to-head, head-to-tail or either-unknown
      name: '',
      subscript: 'n',
      expanded: undefined,
      // data s-group fields
      attached: false,
      absolute: true,
      showUnits: false,
      nCharsToDisplay: -1,
      tagChar: '',
      daspPos: 1,
      fieldType: 'F',
      fieldName: '',
      fieldValue: '',
      units: '',
      query: '',
      queryOp: '',
    };
  }

  // TODO: these methods should be overridden
  //      and should only accept valid attributes for each S-group type.
  //      The attributes should be accessed via these methods only and not directly through this.data.
  // stub
  getAttr(attr: string): any {
    return this.data[attr];
  }

  // TODO: should be group-specific
  getAttrs(): any {
    const attrs = {};
    Object.keys(this.data).forEach((attr) => {
      attrs[attr] = this.data[attr];
    });
    return attrs;
  }

  // stub
  setAttr(attr: string, value: any): any {
    const oldValue = this.data[attr];
    this.data[attr] = value;
    return oldValue;
  }

  // stub
  checkAttr(attr: string, value: any): boolean {
    return this.data[attr] === value;
  }

  updateOffset(offset: Vec2): void {
    this.pp = Vec2.sum(this.bracketBox.p1, offset);
  }

  isExpanded(): boolean {
    // flag ".data.expanded" exists only for the SuperAtom
    if (SGroup.isSuperAtom(this)) {
      return Boolean(this.data.expanded);
    } else {
      return true;
    }
  }

  isContracted(): boolean {
    return !this.isExpanded();
  }

  calculatePP(struct: Struct): void {
    let topLeftPoint;

    const isAtomContext = this.data.context === SgContexts.Atom;
    const isBondContent = this.data.context === SgContexts.Bond;
    if (isAtomContext || isBondContent) {
      const contentBoxes: Array<any> = [];
      let contentBB: Box2Abs | null = null;

      this.atoms.forEach((aid) => {
        const atom = struct.atoms.get(aid);
        const pos = new Vec2(atom!.pp);

        const ext = new Vec2(0.05 * 3, 0.05 * 3);
        const bba = new Box2Abs(pos, pos).extend(ext, ext);
        contentBoxes.push(bba);
      });

      contentBoxes.forEach((bba) => {
        let bbb: Box2Abs | null = null;
        [bba.p0.x, bba.p1.x].forEach((x) => {
          [bba.p0.y, bba.p1.y].forEach((y) => {
            const v = new Vec2(x, y);
            bbb = !bbb ? new Box2Abs(v, v) : bbb!.include(v);
          });
        });
        contentBB = !contentBB ? bbb : Box2Abs.union(contentBB, bbb!);
      });

      topLeftPoint = isBondContent ? contentBB!.centre() : contentBB!.p0;
    } else {
      topLeftPoint = this.bracketBox.p1.add(new Vec2(0.5, 0.5));
    }

    const sgroups = Array.from(struct.sgroups.values());
    for (let i = 0; i < struct.sgroups.size; ++i) {
      if (!descriptorIntersects(sgroups as [], topLeftPoint)) break;

      topLeftPoint = topLeftPoint.add(new Vec2(0, 0.5));
    }

    // TODO: the code below is a temporary solution that will be removed after the implementation of the internal format
    // TODO: in schema.json required fields ["context", "FieldValue"] in sgroups type DAT must be returned
    if (this.data.fieldName === 'INDIGO_CIP_DESC') {
      if (this.atoms.length === 1) {
        const sAtom = this.atoms[0];
        const sAtomPP = struct.atoms.get(sAtom)?.pp;

        if (sAtomPP) {
          topLeftPoint = sAtomPP;
        }
      } else {
        topLeftPoint = SGroup.getMassCentre(struct, this.atoms);
      }
    }

    this.pp = topLeftPoint;
  }

  isGroupAttached(struct: Struct): boolean {
    return this.getConnectionPointsCount(struct) >= 1;
  }

  addAttachmentPoint(attachmentPoint: SGroupAttachmentPoint): void {
    const isAttachmentPointAlreadyExist = this.attachmentPoints.some(
      ({ atomId }) => attachmentPoint.atomId === atomId,
    );

    if (isAttachmentPointAlreadyExist) {
      throw new Error(
        'The same attachment point cannot be added to an S-group more than once',
      );
    }

    this.attachmentPoints.push(attachmentPoint);
  }

  addAttachmentPoints(
    attachmentPoints:
      | ReadonlyArray<SGroupAttachmentPoint>
      | SGroupAttachmentPoint[],
  ): void {
    for (const attachmentPoint of attachmentPoints) {
      this.addAttachmentPoint(attachmentPoint);
    }
  }

  removeAttachmentPoint(attachmentPointAtomId: number): boolean {
    const index = this.attachmentPoints.findIndex(
      ({ atomId }) => attachmentPointAtomId === atomId,
    );
    if (index !== -1) {
      this.attachmentPoints.splice(index, 1);
      return true;
    }
    return false;
  }

  getAttachmentPoints(): ReadonlyArray<SGroupAttachmentPoint> {
    return this.attachmentPoints;
  }

  /**
   * Connection point - is not! the same as Attachment point.
   * Connection point is a fact for the sgroup - is the atom that has connected bond to an external atom.
   * So it doesn't matter how it happens (connection atom).
   * When we talk about "Attachment point" it is a hypothetical, suitable place to connect to sgroup.
   * But there are cases when sgroup doesn't have attachment points but have connection (read from external file)
   */
  private getConnectionPointsCount(struct: Struct): number {
    const connectionAtoms = new Set<number>();
    for (const atomId of this.atoms) {
      const neighbors = struct.atomGetNeighbors(atomId) ?? [];
      for (const { aid } of neighbors) {
        if (!this.atoms.includes(aid)) {
          connectionAtoms.add(atomId);
          break;
        }
      }
    }
    return connectionAtoms.size;
  }

  isNotContractible(struct: Struct): boolean {
    return this.getConnectionPointsCount(struct) > 1;
  }

  /**
   * Why only one?
   * Currently other parts of application don't support several attachment points for sgroup.
   * So to support it - it's required to refactor almost every peace of code with sgroups.
   *
   *
   * Why return 'undefined' without fallback?
   * If sgroup doesn't have attachment points it can't be attached, (salt and solvents for example).
   */
  getAttachmentAtomId(): number | undefined {
    return this.attachmentPoints[0]?.atomId;
  }

  /**
   * WHY? When group is contracted we need to understand the represent atom to calculate position.
   * It is not always the attachmentPoint!! if no attachment point - use the first atom
   */
  getContractedPosition(struct: Struct): {
    atomId: number;
    position: Vec2;
  } {
    let atomId = this.attachmentPoints[0]?.atomId;
    let representAtom = struct.atoms.get(atomId);
    if (!representAtom) {
      atomId = this.atoms[0];
      representAtom = struct.atoms.get(this.atoms[0]);
    }
    assert(representAtom != null);
    return { atomId, position: representAtom.pp };
  }

  cloneAttachmentPoints(
    atomIdMap: Map<number, number>,
  ): ReadonlyArray<SGroupAttachmentPoint> {
    return this.attachmentPoints.map((point) => point.clone(atomIdMap));
  }

  static getOffset(sgroup: SGroup): null | Vec2 {
    if (!sgroup?.pp) return null;
    return Vec2.diff(sgroup.pp, sgroup.bracketBox.p1);
  }

  static isSaltOrSolvent(moleculeName: string): boolean {
    const saltsAndSolventsProvider = SaltsAndSolventsProvider.getInstance();
    const saltsAndSolvents = saltsAndSolventsProvider.getSaltsAndSolventsList();
    return saltsAndSolvents.some(
      ({ name, abbreviation }) =>
        name === moleculeName || moleculeName === abbreviation,
    );
  }

  static isAtomInSaltOrSolvent(
    atomId: number,
    sgroupsOnCanvas: SGroup[],
  ): boolean {
    const onlySaltsOrSolvents = sgroupsOnCanvas.filter((sgroup) =>
      this.isSaltOrSolvent(sgroup.data.name),
    );
    return onlySaltsOrSolvents.some(({ atoms }) =>
      atoms.some((atomIdInSaltOrSolvent) => atomIdInSaltOrSolvent === atomId),
    );
  }

  static isBondInSaltOrSolvent(
    bondId: number,
    sgroupsOnCanvas: SGroup[],
  ): boolean {
    const onlySaltsOrSolvents = sgroupsOnCanvas.filter((sgroup) =>
      this.isSaltOrSolvent(sgroup.data.name),
    );
    return onlySaltsOrSolvents.some(({ bonds }) =>
      bonds.some((bondIdInSaltOrSolvent) => bondIdInSaltOrSolvent === bondId),
    );
  }

  static filterAtoms(atoms: any, map: any) {
    const newAtoms: Array<any> = [];
    for (let i = 0; i < atoms.length; ++i) {
      const aid = atoms[i];
      if (typeof map[aid] !== 'number') newAtoms.push(aid);
      else if (map[aid] >= 0) newAtoms.push(map[aid]);
      else newAtoms.push(-1);
    }
    return newAtoms;
  }

  static removeNegative(atoms: any) {
    const newAtoms: Array<any> = [];
    for (let j = 0; j < atoms.length; ++j) {
      if (atoms[j] >= 0) newAtoms.push(atoms[j]);
    }
    return newAtoms;
  }

  static filter(_mol, sg, atomMap) {
    sg.atoms = SGroup.removeNegative(SGroup.filterAtoms(sg.atoms, atomMap));
  }

  static clone(sgroup: SGroup, aidMap: Map<number, number>): SGroup {
    const cp = new SGroup(sgroup.type);

    Object.keys(sgroup.data).forEach((field) => {
      cp.data[field] = sgroup.data[field];
    });

    cp.atoms = sgroup.atoms.map((elem) => aidMap.get(elem));
    cp.pp = sgroup.pp;
    cp.bracketBox = sgroup.bracketBox;
    cp.patoms = null;
    cp.bonds = null;
    cp.allAtoms = sgroup.allAtoms;
    cp.data.expanded = sgroup.data.expanded;
    cp.addAttachmentPoints(sgroup.cloneAttachmentPoints(aidMap));
    return cp;
  }

  static addAtom(sgroup: SGroup, aid: number, struct: Struct): void {
    sgroup.atoms.push(aid);
    if (sgroup.isNotContractible(struct)) {
      sgroup.setAttr('expanded', true);
    }
  }

  static removeAtom(sgroup: SGroup, aid: number): void {
    if (!sgroup) {
      return;
    }

    for (let i = 0; i < sgroup.atoms.length; ++i) {
      if (sgroup.atoms[i] === aid) {
        sgroup.atoms.splice(i, 1);
        return;
      }
    }
  }

  static getCrossBonds(
    mol: any,
    parentAtomSet: Pile<number>,
  ): { [key: number]: Array<Bond> } {
    const crossBonds: { [key: number]: Array<Bond> } = {};
    mol.bonds.forEach((bond, bid) => {
      if (parentAtomSet.has(bond.begin) && !parentAtomSet.has(bond.end)) {
        if (!crossBonds[bond.begin]) {
          crossBonds[bond.begin] = [];
        }
        crossBonds[bond.begin].push(bid);
      } else if (
        parentAtomSet.has(bond.end) &&
        !parentAtomSet.has(bond.begin)
      ) {
        if (!crossBonds[bond.end]) {
          crossBonds[bond.end] = [];
        }
        crossBonds[bond.end].push(bid);
      }
    });
    return crossBonds;
  }

  static bracketPos(
    sGroup,
    mol,
    crossBondsPerAtom?: { [key: number]: Array<Bond> },
    remol?: ReStruct,
    render?,
  ): void {
    const BORDER_EXT = new Vec2(0.05 * 3, 0.05 * 3);
    const PADDING_VECTOR = new Vec2(0.2, 0.4);
    const atoms = sGroup.atoms;
    const crossBonds = crossBondsPerAtom
      ? Object.values(crossBondsPerAtom).flat()
      : null;
    if (!crossBonds || crossBonds.length !== 2) {
      sGroup.bracketDirection = new Vec2(1, 0);
    } else {
      const p1 = mol.bonds.get(crossBonds[0]).getCenter(mol);
      const p2 = mol.bonds.get(crossBonds[1]).getCenter(mol);
      sGroup.bracketDirection = Vec2.diff(p2, p1).normalized();
    }

    let braketBox: Box2Abs | null = null;
    let sGroupBoundingBox = null;
    const getAtom = (aid) => {
      if (remol && render) {
        return remol.atoms.get(aid);
      }
      return mol.atoms.get(aid);
    };
    atoms.forEach((aid) => {
      const atom = getAtom(aid);
      let position;
      let structBoundingBox;
      if ('getVBoxObj' in atom && render) {
        structBoundingBox = atom.getVBoxObj(render);
      } else {
        position = new Vec2(atom.pp);
        structBoundingBox = new Box2Abs(position, position);
      }
      if (structBoundingBox) {
        sGroupBoundingBox = sGroupBoundingBox
          ? Box2Abs.union(sGroupBoundingBox, structBoundingBox)
          : structBoundingBox.extend(BORDER_EXT, BORDER_EXT);
      }
    });
    if (!render) render = window.ketcher!.editor.render;
    let attachmentPointsVBox =
      render.ctab.getRGroupAttachmentPointsVBoxByAtomIds(atoms);
    attachmentPointsVBox = attachmentPointsVBox
      ? attachmentPointsVBox.extend(BORDER_EXT, BORDER_EXT)
      : attachmentPointsVBox;
    braketBox =
      attachmentPointsVBox && sGroupBoundingBox
        ? Box2Abs.union(sGroupBoundingBox, attachmentPointsVBox)
        : sGroupBoundingBox;
    if (braketBox)
      braketBox = (braketBox as Box2Abs).extend(PADDING_VECTOR, PADDING_VECTOR);
    sGroup.bracketBox = braketBox;
  }

  static getBracketParameters(
    mol,
    crossBondsPerAtom: { [key: number]: Array<Bond> },
    atomSet: Pile<number>,
    bb,
    d,
    n,
  ): Array<any> {
    const brackets: Array<any> = [];
    const crossBondsPerAtomValues = Object.values(crossBondsPerAtom);
    const crossBonds = crossBondsPerAtomValues.flat();
    if (crossBonds.length < 2) {
      (function () {
        d = d || new Vec2(1, 0);
        n = n || d.rotateSC(1, 0);
        const bracketWidth = Math.min(0.25, bb.sz().x * 0.3);
        const cl = Vec2.lc2(d, bb.p0.x, n, 0.5 * (bb.p0.y + bb.p1.y));
        const cr = Vec2.lc2(d, bb.p1.x, n, 0.5 * (bb.p0.y + bb.p1.y));
        const bracketHeight = bb.sz().y;

        brackets.push(
          new SGroupBracketParams(cl, d.negated(), bracketWidth, bracketHeight),
          new SGroupBracketParams(cr, d, bracketWidth, bracketHeight),
        );
      })();
    } else if (
      crossBonds.length === 2 &&
      crossBondsPerAtomValues.length === 2
    ) {
      (function () {
        const b1 = mol.bonds.get(crossBonds[0]);
        const b2 = mol.bonds.get(crossBonds[1]);
        const cl0 = b1.getCenter(mol);
        const cr0 = b2.getCenter(mol);
        const dr = Vec2.diff(cr0, cl0).normalized();
        const dl = dr.negated();

        const bracketWidth = 0.25;
        const bracketHeight = 1.5;
        brackets.push(
          new SGroupBracketParams(
            cl0.addScaled(dl, 0),
            dl,
            bracketWidth,
            bracketHeight,
          ),
          new SGroupBracketParams(
            cr0.addScaled(dr, 0),
            dr,
            bracketWidth,
            bracketHeight,
          ),
        );
      })();
    } else {
      (function () {
        for (let i = 0; i < crossBonds.length; ++i) {
          const b = mol.bonds.get(crossBonds[i]);
          const c = b.getCenter(mol);
          const d = atomSet.has(b.begin)
            ? b.getDir(mol)
            : b.getDir(mol).negated();
          brackets.push(new SGroupBracketParams(c, d, 0.2, 1.0));
        }
      })();
    }
    return brackets;
  }

  static getObjBBox(atoms, mol): Box2Abs {
    const a0 = mol.atoms.get(atoms[0]).pp;
    let bb = new Box2Abs(a0, a0);
    for (let i = 1; i < atoms.length; ++i) {
      const aid = atoms[i];
      const atom = mol.atoms.get(aid);
      const p = atom.pp;
      bb = bb.include(p);
    }
    return bb;
  }

  static getAtoms(mol, sg): Array<any> {
    if (!sg.allAtoms) return sg.atoms;
    const atoms: Array<any> = [];
    mol.atoms.forEach((_atom, aid) => {
      atoms.push(aid);
    });
    return atoms;
  }

  static getBonds(mol, sg): Array<any> {
    const atoms = SGroup.getAtoms(mol, sg);
    const bonds: Array<any> = [];
    mol.bonds.forEach((bond, bid) => {
      if (atoms.indexOf(bond.begin) >= 0 && atoms.indexOf(bond.end) >= 0) {
        bonds.push(bid);
      }
    });
    return bonds;
  }

  static prepareMulForSaving(sgroup, mol): void {
    sgroup.atoms.sort((a, b) => a - b);
    sgroup.atomSet = new Pile(sgroup.atoms);
    sgroup.parentAtomSet = new Pile(sgroup.atomSet);
    const inBonds: Array<any> = [];
    const xBonds: Array<any> = [];

    mol.bonds.forEach((bond, bid) => {
      if (
        sgroup.parentAtomSet.has(bond.begin) &&
        sgroup.parentAtomSet.has(bond.end)
      ) {
        inBonds.push(bid);
      } else if (
        sgroup.parentAtomSet.has(bond.begin) ||
        sgroup.parentAtomSet.has(bond.end)
      ) {
        xBonds.push(bid);
      }
    });

    if (xBonds.length !== 0 && xBonds.length !== 2) {
      throw Error('Unsupported cross-bonds number');
    }

    let xAtom1 = -1;
    let xAtom2 = -1;
    let crossBond = null;
    if (xBonds.length === 2) {
      const bond1 = mol.bonds.get(xBonds[0]);
      xAtom1 = sgroup.parentAtomSet.has(bond1.begin) ? bond1.begin : bond1.end;

      const bond2 = mol.bonds.get(xBonds[1]);
      xAtom2 = sgroup.parentAtomSet.has(bond2.begin) ? bond2.begin : bond2.end;
      crossBond = bond2;
    }

    let tailAtom = xAtom2;

    const newAtoms: Array<any> = [];
    for (let j = 0; j < sgroup.data.mul - 1; j++) {
      const amap = {};
      sgroup.atoms.forEach((aid) => {
        const atom = mol.atoms.get(aid);
        const aid2 = mol.atoms.add(new Atom(atom));
        newAtoms.push(aid2);
        sgroup.atomSet.add(aid2);
        amap[aid] = aid2;
      });
      inBonds.forEach((bid) => {
        const bond = mol.bonds.get(bid);
        const newBond = new Bond(bond);
        newBond.begin = amap[newBond.begin];
        newBond.end = amap[newBond.end];
        mol.bonds.add(newBond);
      });
      if (crossBond !== null) {
        const newCrossBond = new Bond(crossBond);
        newCrossBond.begin = tailAtom;
        newCrossBond.end = amap[xAtom1];
        mol.bonds.add(newCrossBond);
        tailAtom = amap[xAtom2];
      }
    }
    if (tailAtom >= 0) {
      const xBond2 = mol.bonds.get(xBonds[1]);
      if (xBond2.begin === xAtom2) xBond2.begin = tailAtom;
      else xBond2.end = tailAtom;
    }
    sgroup.bonds = xBonds;

    newAtoms.forEach((aid) => {
      mol.sGroupForest
        .getPathToRoot(sgroup.id)
        .reverse()
        .forEach((sgid) => {
          mol.atomAddToSGroup(sgid, aid);
        });
    });
  }

  static getMassCentre(mol, atoms): Vec2 {
    let c = new Vec2(); // mass centre
    for (let i = 0; i < atoms.length; ++i) {
      c = c.addScaled(mol.atoms.get(atoms[i]).pp, 1.0 / atoms.length);
    }
    return c;
  }

  static isAtomInContractedSGroup = (atom, sGroups) => {
    const contractedSGroup: number[] = [];

    sGroups.forEach((sGroupOrReSGroup) => {
      const sGroup =
        'item' in sGroupOrReSGroup ? sGroupOrReSGroup.item : sGroupOrReSGroup;
      if (sGroup.isContracted()) {
        contractedSGroup.push(sGroup.id);
      }
    });
    return contractedSGroup.some((sg) => atom.sgs.has(sg));
  };

  static isBondInContractedSGroup(
    bond: Bond,
    sGroups: Map<number, ReSGroup> | Pool<SGroup>,
  ) {
    return [...sGroups.values()].some((sGroupOrReSGroup) => {
      const sGroup: SGroup | undefined =
        'item' in sGroupOrReSGroup ? sGroupOrReSGroup.item : sGroupOrReSGroup;
      const atomsInSGroup = sGroup?.atoms;
      return (
        sGroup?.isContracted() &&
        atomsInSGroup.includes(bond?.begin) &&
        atomsInSGroup.includes(bond?.end)
      );
    });
  }

  static isSuperAtom(sGroup?: SGroup): boolean {
    if (!sGroup) {
      return false;
    }
    return sGroup?.type === SGroup.TYPES.SUP;
  }

  static isDataSGroup(sGroup: SGroup): boolean {
    return sGroup.type === SGroup.TYPES.DAT;
  }

  static isSRUSGroup(sGroup: SGroup): boolean {
    return sGroup.type === SGroup.TYPES.SRU;
  }

  static isMulSGroup(sGroup: SGroup): boolean {
    return sGroup.type === SGroup.TYPES.MUL;
  }
}

function descriptorIntersects(sgroups: SGroup[], topLeftPoint: Vec2): boolean {
  return sgroups.some((sg: SGroup) => {
    if (!sg.pp) return false;

    const sgBottomRightPoint = sg.pp.add(new Vec2(0.5, 0.5));
    const bottomRightPoint = topLeftPoint.add(new Vec2(0.5, 0.5));

    return Box2Abs.segmentIntersection(
      sg.pp,
      sgBottomRightPoint,
      topLeftPoint,
      bottomRightPoint,
    );
  });
}
