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

import { assert } from 'utilities';
import { Atom, radicalElectrons } from './atom';
import type { EditorSelection } from 'application/editor/editor.types';
import { Bond } from './bond';
import { Box2Abs } from './box2Abs';
import { Elements } from 'domain/constants';
import { Fragment } from './fragment';
import { FunctionalGroup } from './functionalGroup';
import { HalfBond } from './halfBond';
import { Loop } from './loop';
import { Pile } from './pile';
import { Pool } from './pool';
import type { RGroup } from './rgroup';
import type { RxnArrow } from './rxnArrow';
import type { RxnPlus } from './rxnPlus';
import { SGroup } from './sgroup';
import { SGroupForest } from './sgroupForest';
import type { SimpleObject } from './simpleObject';
import type { Text } from './text';
import { Vec2 } from './vec2';
import type { Highlight } from './highlight';
import type { RGroupAttachmentPoint } from './rgroupAttachmentPoint';
import { MonomerMicromolecule } from 'domain/entities/monomerMicromolecule';
import { isNumber } from 'lodash';
import type { Image } from './image';
import { getStereoAtomsMap } from 'application/editor/actions/helpers';
import type { MultitailArrow } from './multitailArrow';
import {
  flipPointByCenter,
  rotateDelta,
} from 'application/editor/shared/utils';
import { getAttachmentPointStereoBond } from 'domain/helpers/getAttachmentPointStereoBond';

export type Neighbor = {
  aid: number;
  bid: number;
};

export type StructProperty = {
  key: string;
  value: string;
};

type ArrowWithId = {
  arrowId?: number;
};

type CoordBoundingBox = {
  min: Vec2;
  max: Vec2;
};

type LoopHalfBondIds = number[];
type ConnectedComponent = Pile<number>;

function arrayAddIfMissing<T>(array: T[], item: T) {
  for (const arrayItem of array) {
    if (arrayItem === item) return false;
  }
  array.push(item);
  return true;
}

export class Struct {
  atoms: Pool<Atom>;
  bonds: Pool<Bond>;
  sgroups: Pool<SGroup>;
  halfBonds: Pool<HalfBond>;
  loops: Pool<Loop>;
  isReaction: boolean;
  rxnArrows: Pool<RxnArrow>;
  rxnPluses: Pool<RxnPlus>;
  frags: Pool<Fragment | null>;
  rgroups: Pool<RGroup>;
  rgroupAttachmentPoints: Pool<RGroupAttachmentPoint>;
  name: string;
  abbreviation?: string;
  sGroupForest: SGroupForest;
  simpleObjects: Pool<SimpleObject>;
  texts: Pool<Text>;
  functionalGroups: Pool<FunctionalGroup>;
  highlights: Pool<Highlight>;
  images = new Pool<Image>();
  multitailArrows = new Pool<MultitailArrow>();
  private static readonly MIN_RESCALE = 0.01;
  private static readonly MAX_RESCALE = 100;

  private nextArrowId = 0;

  constructor() {
    this.atoms = new Pool<Atom>();
    this.bonds = new Pool<Bond>();
    this.sgroups = new Pool<SGroup>();
    this.halfBonds = new Pool<HalfBond>();
    this.loops = new Pool<Loop>();
    this.isReaction = false;
    this.rxnArrows = new Pool<RxnArrow>();
    this.rxnPluses = new Pool<RxnPlus>();
    this.frags = new Pool<Fragment>();
    this.rgroups = new Pool<RGroup>();
    this.rgroupAttachmentPoints = new Pool<RGroupAttachmentPoint>();
    this.name = '';
    this.abbreviation = '';
    this.sGroupForest = new SGroupForest();
    this.simpleObjects = new Pool<SimpleObject>();
    this.texts = new Pool<Text>();
    this.functionalGroups = new Pool<FunctionalGroup>();
    this.highlights = new Pool<Highlight>();
  }

  private syncNextArrowId(arrowId: number): void {
    this.nextArrowId = Math.max(this.nextArrowId, arrowId + 1);
  }

  private ensureArrowId<T extends ArrowWithId>(arrow: T): T {
    const arrowId = arrow.arrowId ?? this.nextArrowId;

    arrow.arrowId = arrowId;
    this.syncNextArrowId(arrowId);

    return arrow;
  }

  addRxnArrow(item: RxnArrow): number {
    this.ensureArrowId(item);

    return this.rxnArrows.add(item);
  }

  setRxnArrow(id: number, item: RxnArrow): void {
    this.ensureArrowId(item);
    this.rxnArrows.set(id, item);
  }

  addMultitailArrow(item: MultitailArrow): number {
    this.ensureArrowId(item);

    return this.multitailArrows.add(item);
  }

  setMultitailArrow(id: number, item: MultitailArrow): void {
    this.ensureArrowId(item);
    this.multitailArrows.set(id, item);
  }

  hasRxnProps(): boolean {
    return !!(
      this.atoms.find((_aid, atom) => atom.hasRxnProps()) ??
      this.bonds.find((_bid, bond) => bond.hasRxnProps())
    );
  }

  hasRxnArrow(): boolean {
    return this.rxnArrows.size >= 1;
  }

  hasMultitailArrow(): boolean {
    return this.multitailArrows.size >= 1;
  }

  hasRxnPluses(): boolean {
    return this.rxnPluses.size > 0;
  }

  isRxn(): boolean {
    return this.hasRxnArrow() || this.hasRxnPluses();
  }

  isBlank(): boolean {
    return (
      this.atoms.size === 0 &&
      this.rxnArrows.size === 0 &&
      this.rxnPluses.size === 0 &&
      this.simpleObjects.size === 0 &&
      this.texts.size === 0 &&
      this.images.size === 0 &&
      this.multitailArrows.size === 0
    );
  }

  isSingleGroup(): boolean {
    if (!this.sgroups.size || this.sgroups.size > 1) return false;
    const sgroup = this.sgroups.values().next().value; // get sgroup from map
    return sgroup !== undefined && this.atoms.size === sgroup.atoms.length;
  }

  clone(
    atomSet?: Pile<number> | null,
    bondSet?: Pile<number> | null,
    dropRxnSymbols?: boolean,
    aidMap?: Map<number, number> | null,
    simpleObjectsSet?: Pile<number> | null,
    textsSet?: Pile<number> | null,
    rgroupAttachmentPointSet?: Pile<number> | null,
    imagesSet?: Pile<number> | null,
    multitailArrowsSet?: Pile<number> | null,
    bidMap?: Map<number, number> | null,
    needCloneAttachmentPoints = false,
  ): Struct {
    const cloneStruct = this.mergeInto(
      new Struct(),
      atomSet,
      bondSet,
      dropRxnSymbols,
      false,
      aidMap,
      simpleObjectsSet,
      textsSet,
      rgroupAttachmentPointSet,
      imagesSet,
      multitailArrowsSet,
      bidMap,
      needCloneAttachmentPoints,
    );
    cloneStruct.findConnectedComponents();
    cloneStruct.setImplicitHydrogen(undefined, true);
    cloneStruct.setStereoLabelsToAtoms();
    cloneStruct.markFragments();
    return cloneStruct;
  }

  getScaffold(): Struct {
    const atomSet = new Pile<number>();
    this.atoms.forEach((_atom, aid) => {
      atomSet.add(aid);
    });

    this.rgroups.forEach((rg) => {
      rg.frags.forEach((_fnum, fid) => {
        this.atoms.forEach((atom, aid) => {
          if (atom.fragment === fid) atomSet.delete(aid);
        });
      });
    });

    return this.clone(atomSet);
  }

  getFragmentIds(_fid: number | number[]): Pile<number> {
    const atomSet = new Pile<number>();
    const fid = Array.isArray(_fid) ? _fid : [_fid];
    this.atoms.forEach((atom, aid) => {
      if (fid.includes(atom.fragment)) atomSet.add(aid);
    });

    return atomSet;
  }

  getFragment(fid: number | number[], aidMap?: Map<number, number>): Struct {
    return this.clone(this.getFragmentIds(fid), null, true, aidMap);
  }

  getFragmentOnly(
    fid: number | number[],
    aidMap?: Map<number, number>,
  ): Struct {
    const atomSet = this.getFragmentIds(fid);
    const rgroupAttachmentPointSet = new Pile<number>();
    this.rgroupAttachmentPoints.forEach((point, id) => {
      if (atomSet.has(point.atomId)) {
        rgroupAttachmentPointSet.add(id);
      }
    });
    return this.clone(
      atomSet,
      null,
      true,
      aidMap,
      new Pile(),
      new Pile(),
      rgroupAttachmentPointSet,
      new Pile(),
      new Pile(),
    );
  }

  mergeInto(
    cp: Struct,
    atomSet?: Pile<number> | null,
    bondSet?: Pile<number> | null,
    dropRxnSymbols?: boolean,
    keepAllRGroups?: boolean,
    aidMap?: Map<number, number> | null,
    simpleObjectsSet?: Pile<number> | null,
    textsSet?: Pile<number> | null,
    rgroupAttachmentPointSet?: Pile<number> | null,
    imagesSet?: Pile<number> | null,
    multitailArrowsSet?: Pile<number> | null,
    bidMapEntity?: Map<number, number> | null,
    needCloneAttachmentPoints = false,
  ): Struct {
    const atoms: Pile<number> = atomSet ?? new Pile<number>(this.atoms.keys());
    let bonds: Pile<number> = bondSet ?? new Pile<number>(this.bonds.keys());
    const simpleObjects: Pile<number> =
      simpleObjectsSet ?? new Pile<number>(this.simpleObjects.keys());
    const texts: Pile<number> = textsSet ?? new Pile<number>(this.texts.keys());
    const images: Pile<number> =
      imagesSet ?? new Pile<number>(this.images.keys());
    const multitailArrows: Pile<number> =
      multitailArrowsSet ?? new Pile<number>(this.multitailArrows.keys());
    const rgroupAttachmentPoints: Pile<number> =
      rgroupAttachmentPointSet ??
      new Pile<number>(this.rgroupAttachmentPoints.keys());
    const aids: Map<number, number> = aidMap ?? new Map();
    const bidMap = bidMapEntity ?? new Map();

    bonds = bonds.filter((bid) => {
      const bond = this.bonds.get(bid);
      assert(bond, `Bond ${bid} not found`);
      return atoms.has(bond.begin) && atoms.has(bond.end);
    });

    const fidMask = new Pile();
    this.atoms.forEach((atom, aid) => {
      if (atoms.has(aid)) fidMask.add(atom.fragment);
    });

    const fidMap = new Map();
    this.frags.forEach((_frag, fid) => {
      if (fidMask.has(fid)) fidMap.set(fid, cp.frags.add(null));
    });

    const rgroupsIds: Array<number> = [];
    this.rgroups.forEach((rgroup, rgid) => {
      let keepGroup = keepAllRGroups;
      if (!keepGroup) {
        rgroup.frags.forEach((_fnum, fid) => {
          rgroupsIds.push(fid);
          if (fidMask.has(fid)) keepGroup = true;
        });

        if (!keepGroup) return;
      }

      const rg = cp.rgroups.get(rgid);
      if (rg) {
        rgroup.frags.forEach((_fnum, fid) => {
          rgroupsIds.push(fid);
          if (fidMask.has(fid)) rg.frags.add(fidMap.get(fid));
        });
      } else {
        cp.rgroups.set(rgid, rgroup.clone(fidMap));
      }
    });
    // atoms in not RGroup
    this.atoms.forEach((atom, aid) => {
      if (atoms.has(aid) && rgroupsIds.indexOf(atom.fragment) === -1) {
        aids.set(aid, cp.atoms.add(atom.clone(fidMap)));
      }
    });
    // atoms in RGroup
    this.atoms.forEach((atom, aid) => {
      if (atoms.has(aid) && rgroupsIds.indexOf(atom.fragment) !== -1) {
        aids.set(aid, cp.atoms.add(atom.clone(fidMap)));
      }
    });

    fidMap.forEach((newfid, oldfid) => {
      const fragment = this.frags.get(oldfid);

      // TODO: delete type check
      if (fragment && fragment instanceof Fragment) {
        cp.frags.set(newfid, fragment.clone(aids)); // clone Fragments
      }
    });

    this.bonds.forEach((bond, bid) => {
      if (bonds.has(bid)) bidMap.set(bid, cp.bonds.add(bond.clone(aids)));
    });

    const sgroupIdMap = {};
    this.sgroups.forEach((sg, sgroupId) => {
      if (sg.atoms.some((aid) => !atoms.has(aid))) return;
      const oldSgroup = sg;

      sg =
        oldSgroup instanceof MonomerMicromolecule
          ? MonomerMicromolecule.clone(
              oldSgroup,
              aids,
              needCloneAttachmentPoints,
            )
          : SGroup.clone(sg, aids);

      const id = cp.sgroups.add(sg);
      sg.id = id;

      sgroupIdMap[sgroupId] = id;

      sg.atoms.forEach((aid) => {
        const atom = cp.atoms.get(aid);
        if (atom) {
          atom.sgs.add(id);
        }
      });

      if (sg.type === 'DAT') cp.sGroupForest.insert(sg, -1, []);
      else cp.sGroupForest.insert(sg);
    });

    this.functionalGroups.forEach((fg) => {
      if (fg.relatedSGroup.atoms.some((aid) => !atoms.has(aid))) return;
      const sgroup = cp.sgroups.get(sgroupIdMap[fg.relatedSGroupId]);
      // It is possible that there is no sgroup in case of templates library rendering
      // Sgroup is deleteing before render to show templates without brackets (see RenderStruct.prepareStruct method)
      fg = sgroup ? new FunctionalGroup(sgroup) : FunctionalGroup.clone(fg);
      cp.functionalGroups.add(fg);
    });

    simpleObjects.forEach((soid) => {
      const simpleObject = this.simpleObjects.get(soid);
      assert(simpleObject, `SimpleObject ${soid} not found`);
      cp.simpleObjects.add(simpleObject.clone());
    });

    texts.forEach((id) => {
      const text = this.texts.get(id);
      assert(text, `Text ${id} not found`);
      cp.texts.add(text.clone());
    });

    images.forEach((id) => {
      const image = this.images.get(id);
      assert(image, `Image ${id} not found`);
      cp.images.add(image.clone());
    });

    multitailArrows.forEach((id) => {
      const multitailArrow = this.multitailArrows.get(id);
      assert(multitailArrow, `MultitailArrow ${id} not found`);
      cp.addMultitailArrow(multitailArrow.clone());
    });

    rgroupAttachmentPoints.forEach((id) => {
      const rgroupAttachmentPoint = this.rgroupAttachmentPoints.get(id);
      assert(rgroupAttachmentPoint, `RgroupAttachmentPoint ${id} not found`);
      cp.rgroupAttachmentPoints.add(rgroupAttachmentPoint.clone(aids));
    });

    if (!dropRxnSymbols) {
      cp.isReaction = this.isReaction;
      this.rxnArrows.forEach((item) => {
        cp.addRxnArrow(item.clone());
      });
      this.rxnPluses.forEach((item) => {
        cp.rxnPluses.add(item.clone());
      });
    }

    cp.name = this.name;

    return cp;
  }

  // NB: this updates the structure without modifying the corresponding ReStruct.
  //  To be applied to standalone structures only.
  prepareLoopStructure() {
    this.initHalfBonds();
    this.initNeighbors();
    this.updateHalfBonds(Array.from(this.atoms.keys()));
    this.sortNeighbors(Array.from(this.atoms.keys()));
    this.findLoops();
  }

  atomAddToSGroup(sgid, aid) {
    // TODO: [MK] make sure the addition does not break the hierarchy?
    const sgroup = this.sgroups.get(sgid);
    assert(sgroup, `SGroup ${sgid} not found`);
    SGroup.addAtom(sgroup, aid, this);
    const atom = this.atoms.get(aid);
    assert(atom, `Atom ${aid} not found`);
    atom.sgs.add(sgid);
  }

  calcConn(atom, includeAtomsInCollapsedSgroups = false) {
    let conn = 0;
    for (const neighborId of atom.neighbors) {
      const hb = this.halfBonds.get(neighborId);
      assert(hb, `HalfBond ${neighborId} not found`);
      const bond = this.bonds.get(hb.bid);
      assert(bond, `Bond ${hb.bid} not found`);

      if (
        Bond.isBondToHiddenLeavingGroup(
          this,
          bond,
          includeAtomsInCollapsedSgroups,
        )
      ) {
        continue;
      }

      switch (bond.type) {
        case Bond.PATTERN.TYPE.SINGLE:
          conn += 1;
          break;
        case Bond.PATTERN.TYPE.DOUBLE:
          conn += 2;
          break;
        case Bond.PATTERN.TYPE.TRIPLE:
          conn += 3;
          break;
        case Bond.PATTERN.TYPE.DATIVE:
        case Bond.PATTERN.TYPE.HYDROGEN:
          break;
        case Bond.PATTERN.TYPE.AROMATIC:
          if (atom.neighbors.length === 1) return [-1, true];
          return [atom.neighbors.length, true];
        default:
          return [-1, false];
      }
    }
    return [conn, false];
  }

  findBondId(begin: number, end: number) {
    return this.bonds.find(
      (_bid, bond) =>
        (bond.begin === begin && bond.end === end) ||
        (bond.begin === end && bond.end === begin),
    );
  }

  initNeighbors() {
    this.atoms.forEach((atom) => {
      atom.neighbors = [];
    });

    this.bonds.forEach((bond) => {
      const a1 = this.atoms.get(bond.begin);
      const a2 = this.atoms.get(bond.end);
      assert(a1, `Atom ${bond.begin} not found`);
      assert(a2, `Atom ${bond.end} not found`);
      assert(
        bond.hb1 !== null && bond.hb1 !== undefined,
        'bond.hb1 not initialized',
      );
      assert(
        bond.hb2 !== null && bond.hb2 !== undefined,
        'bond.hb2 not initialized',
      );
      a1.neighbors.push(bond.hb1);
      a2.neighbors.push(bond.hb2);
    });
  }

  bondInitHalfBonds(bid, bond?: Bond) {
    bond = bond ?? this.bonds.get(bid);
    assert(bond, `Bond ${bid} not found`);
    bond.hb1 = 2 * bid;
    bond.hb2 = 2 * bid + 1;
    this.halfBonds.set(bond.hb1, new HalfBond(bond.begin, bond.end, bid));
    this.halfBonds.set(bond.hb2, new HalfBond(bond.end, bond.begin, bid));
    const hb1 = this.halfBonds.get(bond.hb1);
    const hb2 = this.halfBonds.get(bond.hb2);
    assert(hb1, `HalfBond ${bond.hb1} not found after initialization`);
    assert(hb2, `HalfBond ${bond.hb2} not found after initialization`);
    hb1.contra = bond.hb2;
    hb2.contra = bond.hb1;
  }

  halfBondUpdate(halfBondId: number) {
    const halfBond = this.halfBonds.get(halfBondId);
    assert(halfBond, `HalfBond ${halfBondId} not found`);
    const sgroup1 = this.getGroupFromAtomId(halfBond.begin);
    const sgroup2 = this.getGroupFromAtomId(halfBond.end);
    const atomBegin = this.atoms.get(halfBond.begin);
    const atomEnd = this.atoms.get(halfBond.end);
    assert(atomBegin, `Atom ${halfBond.begin} not found`);
    assert(atomEnd, `Atom ${halfBond.end} not found`);

    let startCoords: Vec2;
    let endCoords: Vec2;

    if (sgroup1 instanceof MonomerMicromolecule && sgroup1 !== sgroup2) {
      startCoords = sgroup1.isContracted()
        ? (sgroup1.pp as Vec2)
        : atomBegin.pp;
    } else if (sgroup1 && sgroup1 !== sgroup2 && sgroup1.isContracted()) {
      startCoords =
        sgroup1.getContractedPosition(this).position ?? atomBegin.pp;
    } else {
      startCoords = atomBegin.pp;
    }

    if (sgroup2 instanceof MonomerMicromolecule && sgroup1 !== sgroup2) {
      endCoords = sgroup2.isContracted() ? (sgroup2.pp as Vec2) : atomEnd.pp;
    } else if (sgroup2 && sgroup2 !== sgroup1 && sgroup2.isContracted()) {
      endCoords = sgroup2.getContractedPosition(this).position ?? atomEnd.pp;
    } else {
      endCoords = atomEnd.pp;
    }

    const coordsDifference = Vec2.diff(endCoords, startCoords).normalized();

    halfBond.dir =
      Vec2.dist(endCoords, startCoords) > 1e-4
        ? coordsDifference
        : new Vec2(1, 0);
    halfBond.norm = halfBond.dir.turnLeft();
    halfBond.ang = halfBond.dir.oxAngle();
    if (halfBond.loop < 0) halfBond.loop = -1;
  }

  initHalfBonds() {
    this.halfBonds.clear();
    this.bonds.forEach((bond, bid) => {
      this.bondInitHalfBonds(bid, bond);
    });
  }

  setHbNext(hbid, next) {
    const hb = this.halfBonds.get(hbid);
    assert(hb, `HalfBond ${hbid} not found`);
    const contra = this.halfBonds.get(hb.contra);
    assert(contra, `Contra half-bond ${hb.contra} not found`);
    contra.next = next;
  }

  halfBondSetAngle(hbid, left) {
    const hb = this.halfBonds.get(hbid);
    const hbl = this.halfBonds.get(left);
    assert(hb, `HalfBond ${hbid} not found`);
    assert(hbl, `HalfBond ${left} not found`);

    hbl.rightCos = Vec2.dot(hbl.dir, hb.dir);
    hb.leftCos = Vec2.dot(hbl.dir, hb.dir);

    hbl.rightSin = Vec2.cross(hbl.dir, hb.dir);
    hb.leftSin = Vec2.cross(hbl.dir, hb.dir);

    hb.leftNeighbor = left;
    hbl.rightNeighbor = hbid;
  }

  atomAddNeighbor(hbid) {
    const hb = this.halfBonds.get(hbid);
    assert(hb, `HalfBond ${hbid} not found`);
    const atom = this.atoms.get(hb.begin);
    assert(atom, `Atom ${hb.begin} not found`);

    let i;
    for (i = 0; i < atom.neighbors.length; ++i) {
      const neighborHb = this.halfBonds.get(atom.neighbors[i]);
      assert(neighborHb, `Neighbor half-bond ${atom.neighbors[i]} not found`);
      if (neighborHb.ang > hb.ang) break;
    }
    atom.neighbors.splice(i, 0, hbid);
    const ir = atom.neighbors[(i + 1) % atom.neighbors.length];
    const il =
      atom.neighbors[(i + atom.neighbors.length - 1) % atom.neighbors.length];
    this.setHbNext(il, hbid);
    this.setHbNext(hbid, ir);
    this.halfBondSetAngle(hbid, il);
    this.halfBondSetAngle(ir, hbid);
  }

  atomSortNeighbors(aid) {
    const atom = this.atoms.get(aid);
    assert(atom, `Atom ${aid} not found`);
    const halfBonds = this.halfBonds;

    atom.neighbors.sort((nei, nei2) => {
      const hb1 = halfBonds.get(nei);
      const hb2 = halfBonds.get(nei2);
      assert(hb1, `HalfBond ${nei} not found`);
      assert(hb2, `HalfBond ${nei2} not found`);
      return hb1.ang - hb2.ang;
    });
    atom.neighbors.forEach((nei, i) => {
      const nextNei = atom.neighbors[(i + 1) % atom.neighbors.length];
      const hb = this.halfBonds.get(nei);
      assert(hb, `HalfBond ${nei} not found`);
      const contraHb = this.halfBonds.get(hb.contra);
      assert(contraHb, `Contra half-bond ${hb.contra} not found`);
      contraHb.next = nextNei;
      this.halfBondSetAngle(nextNei, nei);
    });
  }

  sortNeighbors(list) {
    if (!list) {
      this.atoms.forEach((_atom, aid) => {
        this.atomSortNeighbors(aid);
      });
    } else {
      list.forEach((aid) => {
        this.atomSortNeighbors(aid);
      });
    }
  }

  atomUpdateHalfBonds(atomId: number) {
    const atom = this.atoms.get(atomId);
    assert(atom, `Atom ${atomId} not found`);
    atom.neighbors.forEach((hbid) => {
      this.halfBondUpdate(hbid);
      const hb = this.halfBonds.get(hbid);
      assert(hb, `HalfBond ${hbid} not found`);
      this.halfBondUpdate(hb.contra);
    });
  }

  updateHalfBonds(list) {
    if (!list) {
      this.atoms.forEach((_atom, atomId) => {
        this.atomUpdateHalfBonds(atomId);
      });
    } else {
      list.forEach((atomId) => {
        this.atomUpdateHalfBonds(atomId);
      });
    }
  }

  sGroupsRecalcCrossBonds() {
    this.sgroups.forEach((sg) => {
      sg.xBonds = [];
      sg.neiAtoms = [];
    });

    this.bonds.forEach((bond, bid) => {
      const a1 = this.atoms.get(bond.begin);
      const a2 = this.atoms.get(bond.end);
      assert(a1, `Atom ${bond.begin} not found`);
      assert(a2, `Atom ${bond.end} not found`);

      a1.sgs.forEach((sgid) => {
        if (!a2.sgs.has(sgid)) {
          const sg = this.sgroups.get(sgid);
          assert(sg, `SGroup ${sgid} not found`);
          sg.xBonds.push(bid);
          arrayAddIfMissing(sg.neiAtoms, bond.end);
        }
      });

      a2.sgs.forEach((sgid) => {
        if (!a1.sgs.has(sgid)) {
          const sg = this.sgroups.get(sgid);
          assert(sg, `SGroup ${sgid} not found`);
          sg.xBonds.push(bid);
          arrayAddIfMissing(sg.neiAtoms, bond.begin);
        }
      });
    });
  }

  sGroupDelete(sgid: number) {
    const sgroup = this.sgroups.get(sgid);
    assert(sgroup, `SGroup ${sgid} not found`);
    sgroup.atoms.forEach((atomId) => {
      const atom = this.atoms.get(atomId);
      assert(atom, `Atom ${atomId} not found`);
      atom.sgs.delete(sgid);
    });

    this.sGroupForest.remove(sgid);
    this.sgroups.delete(sgid);
  }

  atomSetPos(id: number, pp: Vec2): void {
    const item = this.atoms.get(id);
    assert(item, `Atom ${id} not found`);
    item.pp = pp;
  }

  rxnPlusSetPos(id: number, pp: Vec2): void {
    const item = this.rxnPluses.get(id);
    assert(item, `RxnPlus ${id} not found`);
    item.pp = pp;
  }

  rxnArrowSetPos(id: number, pos: Array<Vec2>): void {
    const item = this.rxnArrows.get(id);
    if (item) {
      item.pos = pos;
    }
  }

  simpleObjectSetPos(id: number, pos: Array<Vec2>) {
    const item = this.simpleObjects.get(id);
    assert(item, `SimpleObject ${id} not found`);
    item.pos = pos;
  }

  textSetPosition(id: number, position: Vec2): void {
    const item = this.texts.get(id);

    if (item) {
      item.position = position;
    }
  }

  getCoordBoundingBox(atomSet?: Pile<number>): CoordBoundingBox {
    let bb: CoordBoundingBox | null = null;
    function extend(pp: Vec2 | Vec2[]) {
      const points = Array.isArray(pp) ? pp : [pp];
      if (points.length === 0) {
        return;
      }

      if (!bb) {
        bb = {
          min: new Vec2(points[0]),
          max: new Vec2(points[0]),
        };
      }

      const boundingBox = bb;

      points.forEach((vec) => {
        boundingBox.min = Vec2.min(boundingBox.min, vec);
        boundingBox.max = Vec2.max(boundingBox.max, vec);
      });
    }

    const global = !atomSet || atomSet.size === 0;

    this.atoms.forEach((atom, aid) => {
      if (global || atomSet.has(aid)) extend(atom.pp);
    });
    if (global) {
      this.rxnPluses.forEach((item) => {
        extend(item.pp);
      });
      this.rxnArrows.forEach((item) => {
        extend(item.pos);
      });
      this.simpleObjects.forEach((item) => {
        extend(item.pos);
      });
      this.texts.forEach((item) => {
        extend(item.position);
      });
    }
    return (
      bb ?? {
        min: new Vec2(0, 0),
        max: new Vec2(1, 1),
      }
    );
  }

  getCoordBoundingBoxObj(): CoordBoundingBox {
    let bb: CoordBoundingBox | null = null;
    function extend(pp: Vec2) {
      if (!bb) {
        bb = {
          min: new Vec2(pp),
          max: new Vec2(pp),
        };
      } else {
        bb.min = Vec2.min(bb.min, pp);
        bb.max = Vec2.max(bb.max, pp);
      }
    }

    this.atoms.forEach((atom) => {
      extend(atom.pp);
    });
    return (
      bb ?? {
        min: new Vec2(0, 0),
        max: new Vec2(1, 1),
      }
    );
  }

  getBondLengthData() {
    let totalLength = 0;
    let cnt = 0;
    this.bonds.forEach((bond) => {
      const a1 = this.atoms.get(bond.begin);
      const a2 = this.atoms.get(bond.end);
      assert(a1, `Atom ${bond.begin} not found`);
      assert(a2, `Atom ${bond.end} not found`);
      totalLength += Vec2.dist(a1.pp, a2.pp);
      cnt++;
    });
    return { cnt, totalLength };
  }

  getAvgBondLength(): number {
    const bld = this.getBondLengthData();
    return bld.cnt > 0 ? bld.totalLength / bld.cnt : -1;
  }

  getBondLengths(): number[] {
    const lengths: number[] = [];
    this.bonds.forEach((bond) => {
      lengths.push(
        Vec2.dist(this.atoms.get(bond.begin)!.pp, this.atoms.get(bond.end)!.pp),
      );
    });
    return lengths;
  }

  /** Median of `values`, or -1 when there is nothing to measure. */
  static median(values: number[]): number {
    if (values.length === 0) {
      return -1;
    }
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  getMedianBondLength(): number {
    return Struct.median(this.getBondLengths());
  }

  getAvgClosestAtomDistance(): number {
    let totalDist = 0;
    let minDist;
    let dist: number;
    const keys = Array.from(this.atoms.keys());
    let k;
    let j;
    for (k = 0; k < keys.length; ++k) {
      minDist = -1;
      for (j = 0; j < keys.length; ++j) {
        if (j === k) continue;
        const atomJ = this.atoms.get(keys[j]);
        const atomK = this.atoms.get(keys[k]);
        assert(atomJ, `Atom ${keys[j]} not found`);
        assert(atomK, `Atom ${keys[k]} not found`);
        dist = Vec2.dist(atomJ.pp, atomK.pp);
        if (minDist < 0 || minDist > dist) minDist = dist;
      }
      totalDist += minDist;
    }

    return keys.length > 0 ? totalDist / keys.length : -1;
  }

  checkBondExists(begin: number, end: number): boolean {
    const key = this.bonds.find(
      (_bid, bond) =>
        (bond.begin === begin && bond.end === end) ||
        (bond.end === begin && bond.begin === end),
    );

    return key !== undefined;
  }

  findConnectedComponent(firstaid: number): Pile<number> {
    const list = [firstaid];
    const ids = new Pile<number>();
    while (list.length > 0) {
      const aid = list.pop();
      assert(aid !== undefined, 'Expected atom ID from list but got undefined');
      const atom = this.atoms.get(aid);
      assert(atom, `Atom ${aid} not found`);

      if (this.isAtomFromMacromolecule(aid)) {
        continue;
      }

      ids.add(aid);

      atom.neighbors.forEach((nei) => {
        const hb = this.halfBonds.get(nei);
        assert(hb, `HalfBond ${nei} not found`);
        const neiId = hb.end;
        if (!ids.has(neiId)) list.push(neiId);
      });
    }

    return ids;
  }

  findConnectedComponents(discardExistingFragments?: boolean) {
    // NB: this is a hack
    // TODO: need to maintain half-bond and neighbor structure permanently
    if (!this.halfBonds.size) {
      this.initHalfBonds();
      this.initNeighbors();
      this.updateHalfBonds(Array.from(this.atoms.keys()));
      this.sortNeighbors(Array.from(this.atoms.keys()));
    }

    let addedAtoms = new Pile<number>();

    const components: ConnectedComponent[] = [];
    this.atoms.forEach((atom, aid) => {
      if (
        (discardExistingFragments || atom.fragment < 0) &&
        !addedAtoms.has(aid) &&
        !this.isAtomFromMacromolecule(aid)
      ) {
        const component = this.findConnectedComponent(aid);
        components.push(component);
        addedAtoms = addedAtoms.union(component);
      }
    });

    return components;
  }

  markFragment(idSet: Pile<number>, properties?: [StructProperty]) {
    const frag = new Fragment([], undefined, properties);
    const fid = this.frags.add(frag);

    idSet.forEach((aid) => {
      const atom = this.atoms.get(aid);
      assert(atom, `Atom ${aid} not found`);
      if (atom.stereoLabel) frag.updateStereoAtom(this, aid, fid, true);
      atom.fragment = fid;
    });
  }

  clearFragments() {
    this.atoms.forEach((atom) => {
      atom.fragment = -1;
    });
    this.frags.clear();
  }

  markFragments(properties?) {
    const components = this.findConnectedComponents();
    components.forEach((comp) => {
      const [firstAtom] = comp;
      const sgroup = this.getGroupFromAtomId(firstAtom);
      if (sgroup instanceof MonomerMicromolecule) {
        return;
      }
      this.markFragment(comp, properties);
    });
  }

  scale(scale: number) {
    if (scale === 1) return;

    this.atoms.forEach((atom) => {
      atom.pp = atom.pp.scaled(scale);
    });

    this.rxnPluses.forEach((item) => {
      item.pp = item.pp.scaled(scale);
    });

    this.rxnArrows.forEach((item) => {
      item.pos = item.pos.map((p) => p.scaled(scale));
    });

    this.sgroups.forEach((item) => {
      // MonomerMicromolecule centers carry their own transform flow and are
      // scaled separately during mode transitions to avoid double-scaling.
      if (item instanceof MonomerMicromolecule) {
        return;
      }

      item.pp = item.pp?.scaled(scale) ?? null;
    });

    this.texts.forEach((item) => {
      item.pos = item.pos.map((p) => p.scaled(scale));
      item.position = item.position.scaled(scale);
    });

    this.simpleObjects.forEach((simpleObjects) => {
      simpleObjects.pos = simpleObjects.pos.map((p) => p.scaled(scale));
    });

    this.images.forEach((image) => image.rescaleSize(scale));
    this.multitailArrows.forEach((multitailArrow) =>
      multitailArrow.rescaleSize(scale),
    );
    this.frags.forEach((fragment) => {
      if (fragment?.enhancedStereoFlag && fragment?.stereoFlagPosition) {
        fragment.stereoFlagPosition =
          fragment.stereoFlagPosition?.scaled(scale);
      }
    });
  }

  scaleMonomerMicromoleculeSgroups(scale: number) {
    if (scale === 1) return;

    this.sgroups.forEach((item) => {
      if (!(item instanceof MonomerMicromolecule)) {
        return;
      }

      item.pp = item.pp?.scaled(scale) ?? null;
    });
  }

  /**
   * Normalizes coordinates so the median bond length becomes 1 (Ketcher's canvas
   * unit). Applied identically to every input format; rescaleMolecules() in
   * serializers/mol/utils.js follows the same rule for the reaction-merge path.
   *
   * The median rather than the mean: a handful of distorted bonds used to drag the
   * average far from 1, shrinking the whole drawing — shapes, texts and images
   * included — on load. See issue #5275.
   */
  rescale() {
    const median = this.getMedianBondLength();
    if (median <= 0) {
      return;
    }

    const scale = 1 / median;
    // Refuse absurd factors: a median outside [0.01, 100] means degenerate geometry,
    // and normalizing it would distort the drawing more than leaving it alone.
    if (scale < Struct.MIN_RESCALE || scale > Struct.MAX_RESCALE) {
      return;
    }

    this.scale(scale);
  }

  loopHasSelfIntersections(hbs: Array<number>) {
    for (const [i, halfBondId] of hbs.entries()) {
      const hbi = this.halfBonds.get(halfBondId);
      assert(hbi, `HalfBond ${halfBondId} not found`);
      const atomI1 = this.atoms.get(hbi.begin);
      const atomI2 = this.atoms.get(hbi.end);
      assert(atomI1, `Atom ${hbi.begin} not found`);
      assert(atomI2, `Atom ${hbi.end} not found`);
      const ai = atomI1.pp;
      const bi = atomI2.pp;
      const set = new Pile([hbi.begin, hbi.end]);

      for (const hbjId of hbs.slice(i + 2)) {
        const hbj = this.halfBonds.get(hbjId);
        assert(hbj, `HalfBond ${hbjId} not found`);
        if (set.has(hbj.begin) || set.has(hbj.end)) continue; // skip edges sharing an atom

        const atomJ1 = this.atoms.get(hbj.begin);
        const atomJ2 = this.atoms.get(hbj.end);
        assert(atomJ1, `Atom ${hbj.begin} not found`);
        assert(atomJ2, `Atom ${hbj.end} not found`);
        const aj = atomJ1.pp;
        const bj = atomJ2.pp;

        if (Box2Abs.segmentIntersection(ai, bi, aj, bj)) return true;
      }
    }

    return false;
  }

  // partition a cycle into simple cycles
  // TODO: [MK] rewrite the detection algorithm to only find simple ones right away?
  partitionLoop(loop: LoopHalfBondIds) {
    const subloops: LoopHalfBondIds[] = [];
    let continueFlag = true;
    while (continueFlag) {
      const atomToHalfBond: Record<number, number> = {}; // map from every atom in the loop to the index of the first half-bond starting from that atom in the uniqHb array
      continueFlag = false;

      for (const [index, hbid] of loop.entries()) {
        const hb = this.halfBonds.get(hbid);
        assert(hb, `HalfBond ${hbid} not found`);
        const aid1 = hb.begin;
        const aid2 = hb.end;
        if (aid2 in atomToHalfBond) {
          // subloop found
          const s = atomToHalfBond[aid2]; // where the subloop begins
          const subloop = loop.slice(s, index + 1);
          subloops.push(subloop);
          if (index < loop.length) {
            // remove half-bonds corresponding to the subloop
            loop.splice(s, index - s + 1);
          }
          continueFlag = true;
          break;
        }
        atomToHalfBond[aid1] = index;
      }
      if (!continueFlag) subloops.push(loop); // we're done, no more subloops found
    }
    return subloops;
  }

  halfBondAngle(hbid1: number, hbid2: number): number {
    const hba = this.halfBonds.get(hbid1);
    const hbb = this.halfBonds.get(hbid2);
    assert(hba, `HalfBond ${hbid1} not found`);
    assert(hbb, `HalfBond ${hbid2} not found`);
    return Math.atan2(Vec2.cross(hba.dir, hbb.dir), Vec2.dot(hba.dir, hbb.dir));
  }

  loopIsConvex(loop: LoopHalfBondIds): boolean {
    return loop.every((item, k, loopArr) => {
      const angle = this.halfBondAngle(item, loopArr[(k + 1) % loopArr.length]);
      return angle <= 0;
    });
  }

  // check whether a loop is on the inner or outer side of the polygon
  //  by measuring the total angle between bonds
  loopIsInner(loop: LoopHalfBondIds): boolean {
    let totalAngle = 2 * Math.PI;
    loop.forEach((hbida, k, loopArr) => {
      const hbidb = loopArr[(k + 1) % loopArr.length];
      const hbb = this.halfBonds.get(hbidb);
      assert(hbb, `HalfBond ${hbidb} not found`);
      const angle = this.halfBondAngle(hbida, hbidb);
      totalAngle += hbb.contra === hbida ? Math.PI : angle; // back and forth along the same edge
    });
    return Math.abs(totalAngle) < Math.PI;
  }

  findLoops() {
    const newLoops: number[] = [];
    const bondsToMark = new Pile<number>();

    /*
      Starting from each half-bond not known to be in a loop yet,
      follow the 'next' links until the initial half-bond is reached or
      the length of the sequence exceeds the number of half-bonds available.
      In a planar graph, as long as every bond is a part of some "loop" -
      either an outer or an inner one - every iteration either yields a loop
      or doesn't start at all. Thus this has linear complexity in the number
      of bonds for planar graphs.
   */

    let hbIdNext: number;
    let c: number;
    let loop: LoopHalfBondIds;
    this.halfBonds.forEach((hb, hbId) => {
      if (hb.loop !== -1) return;

      for (hbIdNext = hbId, c = 0, loop = []; c <= this.halfBonds.size; ++c) {
        if (c > 0 && hbIdNext === hbId) {
          // loop found
          const subloops = this.partitionLoop(loop);
          subloops.forEach((subloop) => {
            let loopId;
            if (
              this.loopIsInner(subloop) &&
              !this.loopHasSelfIntersections(subloop)
            ) {
              /*
                          loop is internal
                          use lowest half-bond id in the loop as the loop id
                          this ensures that the loop gets the same id if it is discarded and then recreated,
                          which in turn is required to enable redrawing while dragging, as actions store item id's
                       */
              loopId = Math.min(...subloop);
              this.loops.set(
                loopId,
                new Loop(subloop, this, this.loopIsConvex(subloop)),
              );
            } else {
              loopId = -2;
            }

            subloop.forEach((hbid) => {
              const hb = this.halfBonds.get(hbid);
              assert(hb, `HalfBond ${hbid} not found`);
              hb.loop = loopId;
              bondsToMark.add(hb.bid);
            });

            if (loopId >= 0) newLoops.push(loopId);
          });
          break;
        }

        loop.push(hbIdNext);
        const nextHb = this.halfBonds.get(hbIdNext);
        assert(nextHb, `HalfBond ${hbIdNext} not found`);
        hbIdNext = nextHb.next;
      }
    });

    return {
      newLoops,
      bondsToMark: Array.from(bondsToMark),
    };
  }

  calcImplicitHydrogen(aid: number, includeAtomsInCollapsedSgroups = false) {
    if (Atom.isHiddenLeavingGroupAtom(this, aid)) {
      return;
    }

    const atom = this.atoms.get(aid);
    assert(atom, `Atom ${aid} not found`);
    const charge = atom.charge ?? 0;
    const [conn, isAromatic] = this.calcConn(
      atom,
      includeAtomsInCollapsedSgroups,
    );
    let correctConn = conn;
    atom.badConn = false;

    if (isAromatic) {
      if (atom.label === 'C' && charge === 0) {
        if (conn === 3) {
          atom.implicitH = -radicalElectrons(atom.radical);
          return;
        }
        if (conn === 2) {
          atom.implicitH = 1 - radicalElectrons(atom.radical);
          return;
        }
      } else if (
        (atom.label === 'O' && charge === 0) ||
        (atom.label === 'N' && charge === 0 && conn === 3) ||
        (atom.label === 'N' && charge === 1 && conn === 3) ||
        (atom.label === 'S' && charge === 0 && conn === 3) ||
        !atom.implicitH
      ) {
        atom.implicitH = 0;
        return;
      } else if (!atom.hasImplicitH) {
        correctConn++;
      }
    }

    if (correctConn < 0 || atom.isQuery() || atom.attachmentPoints) {
      atom.implicitH = 0;
      return;
    }

    if (atom.explicitValence >= 0) {
      const elem = Elements.get(atom.label);
      atom.implicitH = elem
        ? atom.explicitValence - atom.calcValenceMinusHyd(correctConn)
        : 0;
      if (atom.implicitH < 0) {
        atom.implicitH = 0;
        atom.badConn = true;
      }
    } else {
      atom.calcValence(correctConn);
    }
  }

  setImplicitHydrogen(
    list?: Array<number>,
    includeAtomsInCollapsedSgroups = false,
  ) {
    this.sgroups.forEach((item) => {
      if (item.data.fieldName === 'MRV_IMPLICIT_H') {
        const atom = this.atoms.get(item.atoms[0]);
        assert(atom, `Atom ${item.atoms[0]} not found`);
        atom.hasImplicitH = true;
      }
    });

    if (!list) {
      this.atoms.forEach((_atom, aid) => {
        this.calcImplicitHydrogen(aid, includeAtomsInCollapsedSgroups);
      });
    } else {
      list.forEach((aid) => {
        if (this.atoms.get(aid)) {
          this.calcImplicitHydrogen(aid, includeAtomsInCollapsedSgroups);
        }
      });
    }
  }

  public setStereoLabelsToAtoms() {
    const stereAtomsMap = getStereoAtomsMap(
      this,
      Array.from(this.bonds.values()),
    );

    this.atoms.forEach((atom, id) => {
      if (this?.atomGetNeighbors(id)?.length === 0) {
        atom.stereoLabel = null;
        atom.stereoParity = 0;
      } else {
        const stereoProp = stereAtomsMap.get(id);
        if (stereoProp) {
          atom.stereoLabel = stereoProp.stereoLabel;
          atom.stereoParity = stereoProp.stereoParity;
        }
      }
    });
  }

  atomGetNeighbors(aid: number): Array<Neighbor> | undefined {
    return this.atoms.get(aid)?.neighbors.map((nei) => {
      const hb = this.halfBonds.get(nei);
      assert(hb, `HalfBond ${nei} not found`);
      return {
        aid: hb.end,
        bid: hb.bid,
      };
    });
  }

  getComponents() {
    /* saver */
    const connectedComponents = this.findConnectedComponents(true);
    const barriers: number[] = [];
    let arrowPos: number | null = null;

    this.rxnArrows.forEach((item) => {
      // there's just one arrow
      arrowPos = item.center().x;
    });

    this.rxnPluses.forEach((item) => {
      barriers.push(item.pp.x);
    });

    if (arrowPos !== null) barriers.push(arrowPos);

    barriers.sort((a, b) => a - b);

    const components: Array<ConnectedComponent | undefined> = [];

    connectedComponents.forEach((component) => {
      const bb = this.getCoordBoundingBox(component);
      const c = Vec2.lc2(bb.min, 0.5, bb.max, 0.5);
      let j = 0;

      while (c.x > barriers[j]) ++j;

      const existingComponent = components[j] ?? new Pile<number>();
      components[j] = existingComponent.union(component);
    });

    const reactants: ConnectedComponent[] = [];
    const products: ConnectedComponent[] = [];

    components.forEach((component) => {
      if (!component) {
        return;
      }

      const rxnFragmentType = this.defineRxnFragmentTypeForAtomset(
        component,
        arrowPos ?? 0,
      );

      if (rxnFragmentType === 1) reactants.push(component);
      else products.push(component);
    });

    return {
      reactants,
      products,
    };
  }

  defineRxnFragmentTypeForAtomset(atomset: Pile<number>, arrowpos: number) {
    const bb = this.getCoordBoundingBox(atomset);
    const c = Vec2.lc2(bb.min, 0.5, bb.max, 0.5);
    return c.x < arrowpos ? 1 : 2;
  }

  getBondFragment(bid: number) {
    const aid = this.bonds.get(bid)?.begin;
    return aid && this.atoms.get(aid)?.fragment;
  }

  bindSGroupsToFunctionalGroups() {
    this.sgroups.forEach((sgroup) => {
      if (
        FunctionalGroup.isFunctionalGroup(sgroup) ||
        SGroup.isSuperAtom(sgroup)
      ) {
        this.functionalGroups.add(new FunctionalGroup(sgroup));
      }
    });
  }

  getGroupIdFromAtomId(atomId: number): number | null {
    const firstSgroupId = [...(this.atoms.get(atomId)?.sgs.values() ?? [])][0];

    return isNumber(firstSgroupId) ? firstSgroupId : null;
  }

  getGroupIdFromAtomIdBySgroups(atomId: number): number | null {
    // Search by sgroups is more expensive, but allows to find
    // functional groups for atoms which are not exist in struct already.
    // F.e. if atom already deleted and it needs to find its functional group
    for (const [groupId, sgroup] of Array.from(this.sgroups)) {
      if (sgroup.atoms.includes(atomId)) return groupId;
    }
    return null;
  }

  getGroupFromAtomId(atomId: number | undefined): SGroup | undefined {
    if (!isNumber(atomId)) {
      return undefined;
    }

    const sgroupId = this.getGroupIdFromAtomId(atomId);

    return isNumber(sgroupId) ? this.sgroups?.get(sgroupId) : undefined;
  }

  getGroupFromAtomIdBySgroups(atomId: number | undefined): SGroup | undefined {
    if (!isNumber(atomId)) {
      return undefined;
    }

    const sgroupId = this.getGroupIdFromAtomIdBySgroups(atomId);
    return this.sgroups?.get(sgroupId as number);
  }

  // TODO: simplify if bonds ids ever appear in sgroup
  // ! deprecate
  getGroupIdFromBondId(bondId: number): number | null {
    const bond = this.bonds.get(bondId);
    if (!bond) return null;
    for (const [groupId, sgroup] of Array.from(this.sgroups)) {
      if (
        sgroup.atoms.includes(bond.begin) ||
        sgroup.atoms.includes(bond.end)
      ) {
        return groupId;
      }
    }
    return null;
  }

  getGroupFromBondId(atomId: number): SGroup | undefined {
    const sgroupId = this.getGroupIdFromBondId(atomId);

    if (!isNumber(sgroupId)) {
      return;
    }

    return this.sgroups?.get(sgroupId as number);
  }

  getGroupsIdsFromBondId(bondId: number): number[] {
    const bond = this.bonds.get(bondId);
    if (!bond) return [];

    const groupsIds: number[] = [];

    for (const [groupId, sgroup] of Array.from(this.sgroups)) {
      if (
        sgroup.atoms.includes(bond.begin) ||
        sgroup.atoms.includes(bond.end)
      ) {
        groupsIds.push(groupId);
      }
    }
    return groupsIds;
  }

  getBondIdByHalfBond(halfBondId: number) {
    const halfBond = this.halfBonds.get(halfBondId);
    if (halfBond) {
      return halfBond.bid;
    }
    return undefined;
  }

  /**
   * @returns visibleAtoms = selected atoms
   *                       - atoms in contracted functional groups
   *                       + functional groups's attachment atoms
   */
  getSelectedVisibleAtoms(selection: EditorSelection | null) {
    return (
      selection?.atoms?.filter((atomId) => {
        const atom = this.atoms.get(atomId);
        if (!atom) {
          return false;
        }
        const isAtomNotInContractedGroup =
          !FunctionalGroup.isAtomInContractedFunctionalGroup(
            atom,
            this.sgroups,
            this.functionalGroups,
          );
        if (isAtomNotInContractedGroup) {
          return true;
        }
        const groupId = this.getGroupIdFromAtomId(atomId);
        const sgroup = this.sgroups.get(groupId as number);
        return sgroup?.getAttachmentAtomId() === atomId;
      }) || []
    );
  }

  getRGroupAttachmentPointsByAtomId(atomId: number) {
    const rgroupAttachmentPoints = this.rgroupAttachmentPoints.filter(
      (_id, attachmentPoint) => attachmentPoint.atomId === atomId,
    );
    return [...rgroupAttachmentPoints.keys()];
  }

  isAtomFromMacromolecule(atomId: number) {
    const sgroup = this.getGroupFromAtomId(atomId);
    return sgroup instanceof MonomerMicromolecule;
  }

  isBondFromMacromolecule(bondOrBondId: Bond | number) {
    const bond =
      bondOrBondId instanceof Bond
        ? bondOrBondId
        : this.bonds.get(bondOrBondId);

    assert(bond, 'Bond not found');

    return (
      this.isAtomFromMacromolecule(bond.begin) ||
      this.isAtomFromMacromolecule(bond.end)
    );
  }

  isFunctionalGroupFromMacromolecule(functionalGroupId: number) {
    const functionalGroup = this.functionalGroups.get(functionalGroupId);

    return functionalGroup?.relatedSGroup instanceof MonomerMicromolecule;
  }

  isTargetFromMacromolecule(target?: { id: number; map: string } | null) {
    return (
      target &&
      ((target.map === 'functionalGroups' &&
        this.isFunctionalGroupFromMacromolecule(target.id)) ||
        (target.map === 'atoms' && this.isAtomFromMacromolecule(target.id)) ||
        (target.map === 'bonds' && this.isBondFromMacromolecule(target.id)))
    );
  }

  disableInitiallySelected(): void {
    // Those fields are used only in serialization/deserialization phase
    // so we are disabling them to avoid confusion
    this.atoms.changeInitiallySelectedPropertiesForPool(true);
    this.bonds.changeInitiallySelectedPropertiesForPool(true);
    this.rxnPluses.changeInitiallySelectedPropertiesForPool(true);
    this.rxnArrows.changeInitiallySelectedPropertiesForPool(true);
    this.texts.changeInitiallySelectedPropertiesForPool(true);
  }

  enableInitiallySelected(): void {
    this.atoms.changeInitiallySelectedPropertiesForPool();
    this.bonds.changeInitiallySelectedPropertiesForPool();
    this.rxnPluses.changeInitiallySelectedPropertiesForPool();
    this.rxnArrows.changeInitiallySelectedPropertiesForPool();
    this.texts.changeInitiallySelectedPropertiesForPool();
  }

  public applyMonomersTransformations(scaleFactor = 1) {
    this.scaleMonomerMicromoleculeSgroups(scaleFactor);

    const atomToBonds = new Map<number, number[]>();

    this.bonds.forEach((bond, bondId) => {
      for (const atomId of [bond.begin, bond.end]) {
        const list = atomToBonds.get(atomId) ?? [];
        list.push(bondId);
        atomToBonds.set(atomId, list);
      }
    });

    this.sgroups.forEach((sGroup) => {
      if (!(sGroup instanceof MonomerMicromolecule)) {
        return;
      }

      const center = sGroup.pp;
      if (!center) {
        return;
      }

      const rotateValue = sGroup.monomer.monomerItem.transformation?.rotate;
      if (rotateValue) {
        sGroup.atoms.forEach((atomId) => {
          const atom = this.atoms.get(atomId);
          if (!atom) {
            return;
          }

          atom.pp = atom.pp.add(rotateDelta(atom.pp, center, rotateValue));
        });
      }

      const flipValue = sGroup.monomer.monomerItem.transformation?.flip;
      if (flipValue) {
        sGroup.atoms.forEach((atomId) => {
          const atom = this.atoms.get(atomId);
          if (!atom) {
            return;
          }

          atom.pp = atom.pp.add(flipPointByCenter(atom.pp, center, flipValue));
        });

        const sGroupBonds = new Set<number>(
          sGroup.atoms.flatMap((atomId) => atomToBonds.get(atomId) ?? []),
        );

        sGroupBonds.forEach((bondId) => {
          const bond = this.bonds.get(bondId);
          if (!bond || bond.type !== Bond.PATTERN.TYPE.SINGLE) {
            return;
          }

          if (
            bond.stereo === Bond.PATTERN.STEREO.UP ||
            bond.stereo === Bond.PATTERN.STEREO.DOWN
          ) {
            bond.stereo =
              bond.stereo === Bond.PATTERN.STEREO.UP
                ? Bond.PATTERN.STEREO.DOWN
                : Bond.PATTERN.STEREO.UP;
          }
        });
      }
    });
  }

  public applyStereoBondsToExpandedMonomers() {
    const expandedMonomers: MonomerMicromolecule[] = [];
    this.sgroups.forEach((sgroup) => {
      if (sgroup instanceof MonomerMicromolecule && sgroup.isExpanded()) {
        expandedMonomers.push(sgroup);
      }
    });

    if (expandedMonomers.length < 2) {
      return;
    }

    for (let i = 0; i < expandedMonomers.length; i++) {
      const firstMonomer = expandedMonomers[i];
      const firstMonomerAtoms = new Set(SGroup.getAtoms(this, firstMonomer));
      const firstMonomerAttachmentPoints = firstMonomer.getAttachmentPoints();

      for (let j = i + 1; j < expandedMonomers.length; j++) {
        const secondMonomer = expandedMonomers[j];
        const secondMonomerAtoms = new Set(
          SGroup.getAtoms(this, secondMonomer),
        );
        const secondMonomerAttachmentPoints =
          secondMonomer.getAttachmentPoints();

        this.bonds.forEach((bond, bondId) => {
          const firstMonomerHasBondBegin = firstMonomerAtoms.has(bond.begin);
          const firstMonomerHasBondEnd = firstMonomerAtoms.has(bond.end);
          const secondMonomerHasBondBegin = secondMonomerAtoms.has(bond.begin);
          const secondMonomerHasBondEnd = secondMonomerAtoms.has(bond.end);

          const isBondConnectinBothMonomers =
            (firstMonomerHasBondBegin && secondMonomerHasBondEnd) ||
            (firstMonomerHasBondEnd && secondMonomerHasBondBegin);

          if (!isBondConnectinBothMonomers) {
            return;
          }

          const firstMonomerAtom = firstMonomerHasBondBegin
            ? bond.begin
            : bond.end;
          const secondMonomerAtom = secondMonomerHasBondBegin
            ? bond.begin
            : bond.end;

          const firstMonomerAttachmentPointInConnection =
            firstMonomerAttachmentPoints.find(
              (attachmentPoint) => attachmentPoint.atomId === firstMonomerAtom,
            );
          const secondMonomerAttachmentPointInConnection =
            secondMonomerAttachmentPoints.find(
              (attachmentPoint) => attachmentPoint.atomId === secondMonomerAtom,
            );

          if (
            !firstMonomerAttachmentPointInConnection ||
            !secondMonomerAttachmentPointInConnection
          ) {
            return;
          }

          const firstMonomerAttachmentPointBondStereo =
            getAttachmentPointStereoBond(
              firstMonomer,
              firstMonomerAttachmentPointInConnection,
            );
          const secondMonomerAttachmentPointBondStereo =
            getAttachmentPointStereoBond(
              secondMonomer,
              secondMonomerAttachmentPointInConnection,
            );

          const firstMonomerHasStereoBondOnAttachmentPoint =
            firstMonomerAttachmentPointBondStereo !== null &&
            firstMonomerAttachmentPointBondStereo !== Bond.PATTERN.STEREO.NONE;
          const secondMonomerHasStereoBondOnAttachmentPoint =
            secondMonomerAttachmentPointBondStereo !== null &&
            secondMonomerAttachmentPointBondStereo !== Bond.PATTERN.STEREO.NONE;

          if (
            firstMonomerHasStereoBondOnAttachmentPoint &&
            !secondMonomerHasStereoBondOnAttachmentPoint
          ) {
            if (bond.begin !== firstMonomerAtom) {
              this.flipBondAndSetStereo(
                bondId,
                bond,
                firstMonomerAttachmentPointBondStereo,
              );
            } else {
              bond.stereo = firstMonomerAttachmentPointBondStereo;
            }
          } else if (
            !firstMonomerHasStereoBondOnAttachmentPoint &&
            secondMonomerHasStereoBondOnAttachmentPoint
          ) {
            if (bond.begin !== secondMonomerAtom) {
              this.flipBondAndSetStereo(
                bondId,
                bond,
                secondMonomerAttachmentPointBondStereo,
              );
            } else {
              bond.stereo = secondMonomerAttachmentPointBondStereo;
            }
          } else if (
            firstMonomerHasStereoBondOnAttachmentPoint &&
            secondMonomerHasStereoBondOnAttachmentPoint
          ) {
            bond.stereo = Bond.PATTERN.STEREO.NONE;
          }
        });
      }
    }
  }

  private flipBondAndSetStereo(
    bondId: number,
    bond: Bond,
    stereo: number,
  ): void {
    this.bonds.delete(bondId);

    const newBond = new Bond({
      ...bond,
      begin: bond.end,
      end: bond.begin,
      stereo,
      beginSuperatomAttachmentPointNumber:
        bond.endSuperatomAttachmentPointNumber,
      endSuperatomAttachmentPointNumber:
        bond.beginSuperatomAttachmentPointNumber,
    });

    this.bonds.set(bondId, newBond);

    this.bondInitHalfBonds(bondId);
    const newBondObj = this.bonds.get(bondId);
    if (newBondObj?.hb1 && newBondObj?.hb2) {
      // Populate dir/norm/ang before atomAddNeighbor, which sorts neighbors
      // by hb.ang — inserting with ang=0 (the HalfBond default) would place
      // the half-bond in the wrong position in the neighbor list.
      this.halfBondUpdate(newBondObj.hb1);
      this.halfBondUpdate(newBondObj.hb2);
      this.atomAddNeighbor(newBondObj.hb1);
      this.atomAddNeighbor(newBondObj.hb2);
    }
  }
}
