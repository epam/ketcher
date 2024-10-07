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
  AtomAdd,
  BondAdd,
  FragmentAdd,
  FragmentAddStereoAtom,
  RGroupFragment,
  RxnArrowAdd,
  RxnPlusAdd,
  SimpleObjectAdd,
  TextCreate,
  CalcImplicitH,
  FragmentSetProperties,
  BondAttr,
  AtomAttr,
  ImageUpsert,
  MultitailArrowUpsert,
} from '../operations';
import { fromRGroupAttrs, fromUpdateIfThen } from './rgroup';

import { Action } from './action';
import { MultitailArrow, SGroup, Struct, Vec2 } from 'domain/entities';
import { fromSgroupAddition } from './sgroup';
import { fromRGroupAttachmentPointAddition } from './rgroupAttachmentPoint';
import { MonomerMicromolecule } from 'domain/entities/monomerMicromolecule';
import { Image } from 'domain/entities/image';

type CreatedItems = {
  atoms: number[];
  bonds: number[];
  rxnArrows: number[];
  rxnPluses: number[];
  texts: number[];
  images: number[];
  simpleObjects: number[];
  multitailArrows: number[];
};

export function fromPaste(
  restruct,
  pstruct,
  point,
  angle = 0,
  isPreview = false,
): [Action, { atoms: number[]; bonds: number[] }, CreatedItems] {
  const xy0 = getStructCenter(pstruct);
  const offset = Vec2.diff(point, xy0);

  const action = new Action();

  const aidMap = new Map();
  const fridMap = new Map();

  const pasteItems = {
    // only atoms and bonds now
    atoms: [] as number[],
    bonds: [] as number[],
  };

  const items: CreatedItems = {
    atoms: [],
    bonds: [],
    rxnArrows: [],
    rxnPluses: [],
    texts: [],
    images: [],
    simpleObjects: [],
    multitailArrows: [],
  };

  pstruct.atoms.forEach((atom, aid) => {
    if (!fridMap.has(atom.fragment) && !pstruct.isAtomFromMacromolecule(aid)) {
      fridMap.set(
        atom.fragment,
        (
          action.addOp(
            new FragmentAdd(null, atom.fragment.properties).perform(restruct),
          ) as FragmentAdd
        ).frid,
      );
    }

    const tmpAtom = Object.assign(atom.clone(), {
      fragment: fridMap.get(atom.fragment),
    });
    const operation = new AtomAdd(
      tmpAtom,
      Vec2.diff(atom.pp, xy0).rotate(angle).add(point),
    ).perform(restruct) as AtomAdd;
    action.addOp(operation);
    aidMap.set(aid, operation.data.aid);

    pasteItems.atoms.push(operation.data.aid);
    items.atoms.push(operation.data.aid);

    action.mergeWith(
      fromRGroupAttachmentPointAddition(
        restruct,
        tmpAtom.attachmentPoints,
        operation.data.aid,
      ),
    );
  });

  pstruct.frags.forEach((frag, frid) => {
    if (!frag) return;
    if (frag.properties) {
      action.addOp(
        new FragmentSetProperties(fridMap.get(frid), frag.properties).perform(
          restruct,
        ),
      );
    }
    frag.stereoAtoms.forEach((aid) =>
      action.addOp(
        new FragmentAddStereoAtom(fridMap.get(frid), aidMap.get(aid)).perform(
          restruct,
        ),
      ),
    );
  });

  pstruct.bonds.forEach((bond) => {
    const operation = new BondAdd(
      aidMap.get(bond.begin),
      aidMap.get(bond.end),
      bond,
      false,
    ).perform(restruct) as BondAdd;
    action.addOp(operation);

    pasteItems.bonds.push(operation.data.bid);
    items.bonds.push(operation.data.bid);
    new BondAttr(operation.data.bid, 'isPreview', isPreview, false).perform(
      restruct,
    );
  });

  pstruct.sgroups.forEach((sg: SGroup) => {
    const newsgid = restruct.molecule.sgroups.newId();
    const sgAtoms = sg.atoms.map((aid) => aidMap.get(aid));
    const attachmentPoints = sg.cloneAttachmentPoints(aidMap);
    if (
      sg.isNotContractible(pstruct) &&
      !(sg instanceof MonomerMicromolecule)
    ) {
      sg.setAttr('expanded', true);
    }
    const sgAction = fromSgroupAddition(
      restruct,
      sg.type,
      sgAtoms,
      sg.data,
      newsgid,
      attachmentPoints,
      sg.pp ? sg.pp.add(offset) : null,
      sg.type === 'SUP' ? sg.isExpanded() : null,
      sg.data.name,
      sg,
    );
    sgAction.operations.reverse().forEach((oper) => {
      action.addOp(oper);
    });
  });

  pasteItems.atoms.forEach((aid) => {
    action.addOp(new CalcImplicitH([aid]).perform(restruct));
    new AtomAttr(aid, 'isPreview', isPreview).perform(restruct);
  });

  pstruct.rxnArrows.forEach((rxnArrow) => {
    const operation = new RxnArrowAdd(
      rxnArrow.pos.map((p) => p.add(offset)),
      rxnArrow.mode,
    ).perform(restruct);
    action.addOp(operation);
    items.rxnArrows.push(operation.data.id);
  });

  pstruct.rxnPluses.forEach((plus) => {
    const operation = new RxnPlusAdd(plus.pp.add(offset)).perform(restruct);
    action.addOp(operation);
    items.rxnPluses.push(operation.data.plid);
  });

  pstruct.simpleObjects.forEach((simpleObject) => {
    const operation = new SimpleObjectAdd(
      simpleObject.pos.map((p) => p.add(offset)),
      simpleObject.mode,
    ).perform(restruct);
    action.addOp(operation);
    items.simpleObjects.push(operation.data.id);
  });

  pstruct.texts.forEach((text) => {
    const operation = new TextCreate(
      text.content,
      text.position.add(offset),
      text.pos.map((p) => p.add(offset)),
    ).perform(restruct);
    action.addOp(operation);
    items.texts.push(operation.data.id);
  });

  pstruct.images.forEach((image: Image) => {
    const clonedImage = image.clone();
    clonedImage.addPositionOffset(offset);
    const operation = new ImageUpsert(clonedImage).perform(restruct);
    action.addOp(operation);
    items.images.push(operation.data.id);
  });

  pstruct.multitailArrows.forEach((multitailArrow: MultitailArrow) => {
    const clonedMultitailArrow = multitailArrow.clone();
    clonedMultitailArrow.move(offset);
    const operation = new MultitailArrowUpsert(clonedMultitailArrow).perform(
      restruct,
    );
    action.addOp(operation);
    items.multitailArrows.push(operation.data.id);
  });

  pstruct.rgroups.forEach((rg, rgid) => {
    rg.frags.forEach((__frag, frid) => {
      action.addOp(
        new RGroupFragment(rgid, fridMap.get(frid)).perform(restruct),
      );
    });
    const ifThen = pstruct.rgroups.get(rgid).ifthen;
    const newRgId = pstruct.rgroups.get(ifThen) ? ifThen : 0;
    action
      .mergeWith(fromRGroupAttrs(restruct, rgid, rg.getAttrs()))
      .mergeWith(fromUpdateIfThen(restruct, newRgId, rg.ifthen));
  });

  action.operations.reverse();
  return [action, pasteItems, items];
}

function getStructCenter(struct: Struct): Vec2 {
  const isOnlyOneSGroup = struct.sgroups.size === 1;
  if (isOnlyOneSGroup) {
    const onlyOneStructsSgroupId = struct.sgroups.keys().next().value;
    const sgroup = struct.sgroups.get(onlyOneStructsSgroupId) as SGroup;
    if (sgroup.isContracted()) {
      return sgroup.getContractedPosition(struct).position;
    }
  }
  if (struct.atoms.size > 0) {
    let xmin = 1e50;
    let ymin = xmin;
    let xmax = -xmin;
    let ymax = -ymin;

    struct.atoms.forEach((atom) => {
      xmin = Math.min(xmin, atom.pp.x);
      ymin = Math.min(ymin, atom.pp.y);
      xmax = Math.max(xmax, atom.pp.x);
      ymax = Math.max(ymax, atom.pp.y);
    });
    return new Vec2((xmin + xmax) / 2, (ymin + ymax) / 2); // TODO: check
  }
  // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
  if (struct.rxnArrows.size > 0) return struct.rxnArrows.get(0)!.center();
  // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
  if (struct.rxnPluses.size > 0) return struct.rxnPluses.get(0)!.pp;
  if (struct.simpleObjects.size > 0)
    // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
    return struct.simpleObjects.get(0)!.center();
  // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
  if (struct.texts.size > 0) return struct.texts.get(0)!.position;
  // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
  if (struct.images.size > 0) return struct.images.get(0)!.center();
  if (struct.multitailArrows.size > 0)
    // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
    return struct.multitailArrows.get(0)!.center();

  return new Vec2(0, 0);
}
