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

import {
  AtomMove,
  BondAttr,
  EnhancedFlagMove,
  EnhancedFlagClear,
  RxnArrowMove,
  RxnArrowRotate,
  RxnPlusMove,
  SGroupDataMove,
  TextMove,
} from '../operations';
import { Bond } from 'domain/entities/bond';
import { Fragment } from 'domain/entities/fragment';
import { MonomerMicromolecule } from 'domain/entities/monomerMicromolecule';
import type { Struct } from 'domain/entities/struct';
import { Vec2 } from 'domain/entities/vec2';
import type { ReStruct } from 'application/render';
import { getRelSGroupsBySelection, structSelection } from './utils';
import { Action } from './action';
import type { EditorSelection } from '../editor.types';
import { FlipMonomerOperation } from 'application/editor/operations/monomer/FlipMonomerOperation';
import type { FlipDirection } from '../shared/utils.types';
import { flipPointByCenter, rotateDelta } from '../shared/utils';

export function fromFlip(
  reStruct: ReStruct,
  selection: EditorSelection | null,
  flipDirection: FlipDirection,
  center: Vec2,
) {
  const action = new Action();
  const structToFlip = selection ?? structSelection(reStruct.molecule);

  action.mergeWith(
    fromStructureFlip(reStruct, structToFlip, flipDirection, center),
  );

  if (structToFlip.rxnArrows) {
    action.mergeWith(
      fromRxnArrowFlip(reStruct, structToFlip.rxnArrows, flipDirection, center),
    );
  }

  if (structToFlip.rxnPluses) {
    action.mergeWith(
      fromRxnPlusFlip(reStruct, structToFlip.rxnPluses, flipDirection, center),
    );
  }

  if (structToFlip.texts) {
    action.mergeWith(
      fromTextFlip(reStruct, structToFlip.texts, flipDirection, center),
    );
  }

  if (structToFlip.enhancedFlags) {
    action.mergeWith(
      fromEnhancedFlagsFlip(
        reStruct,
        structToFlip.enhancedFlags,
        flipDirection,
        center,
      ),
    );
  }

  return action;
}

function fromRxnArrowFlip(
  reStruct: ReStruct,
  rxnArrowIds: number[],
  flipDirection: FlipDirection,
  center: Vec2,
) {
  const action = new Action();

  for (const arrowId of rxnArrowIds) {
    const rxnArrow = reStruct.molecule.rxnArrows.get(arrowId);
    if (!rxnArrow) {
      continue;
    }

    const [start, end] = rxnArrow.pos;
    const oxAngle = end.sub(start).oxAngle();
    const oyAngle = oxAngle - Math.PI / 2;
    const rotateAngle =
      flipDirection === 'vertical' ? -2 * oxAngle : -2 * oyAngle;
    action.addOp(new RxnArrowRotate(arrowId, rotateAngle, rxnArrow.center()));

    const difference = flipPointByCenter(
      rxnArrow.center(),
      center,
      flipDirection,
    );
    action.addOp(new RxnArrowMove(arrowId, difference));
  }

  return action.perform(reStruct);
}

function fromRxnPlusFlip(
  reStruct: ReStruct,
  rxnPlusIds: number[],
  flipDirection: FlipDirection,
  center: Vec2,
) {
  const action = new Action();

  for (const plusId of rxnPlusIds) {
    const rxnPlus = reStruct.molecule.rxnPluses.get(plusId);
    if (!rxnPlus) {
      continue;
    }

    const difference = flipPointByCenter(rxnPlus.pp, center, flipDirection);
    action.addOp(new RxnPlusMove(plusId, difference));
  }

  return action.perform(reStruct);
}

function fromTextFlip(
  reStruct: ReStruct,
  textIds: number[],
  flipDirection: FlipDirection,
  center: Vec2,
) {
  const action = new Action();

  for (const textId of textIds) {
    const text = reStruct.molecule.texts.get(textId);
    if (!text) {
      continue;
    }

    // Note: text has two position properties
    //      `position`: the middle left point
    //      `pos`: a box (not bounding box)
    // `TextMove` is to move `position`, so we have to calculate the flipped `position`
    const textMiddleLeft = text.pos[0];
    const textMiddleRight = text.pos[2];
    const textCenter = Vec2.centre(textMiddleLeft, textMiddleRight);

    const difference = flipPointByCenter(textCenter, center, flipDirection);
    action.addOp(new TextMove(textId, difference));
  }

  return action.perform(reStruct);
}

function fromEnhancedFlagsFlip(
  reStruct: ReStruct,
  enhancedFlagIds: number[],
  _flipDirection: FlipDirection,
  _center: Vec2,
) {
  const action = new Action();

  // Clear stored flag positions so they recalculate based on new atom positions
  for (const flagId of enhancedFlagIds) {
    const frId = flagId;
    const frag = reStruct.molecule.frags.get(frId);
    if (!frag) {
      continue;
    }

    // Clear the position - it will auto-recalculate to top-right of new bounding box
    action.addOp(new EnhancedFlagClear(flagId));
  }

  return action.perform(reStruct);
}

export const flipBonds = (
  bondIds: number[],
  struct: Struct,
  action: Action,
) => {
  for (const bondId of bondIds) {
    const bond = struct.bonds.get(bondId);

    if (!bond) {
      continue;
    }

    if (bond.type !== Bond.PATTERN.TYPE.SINGLE) {
      continue;
    }

    if (bond.stereo === Bond.PATTERN.STEREO.UP) {
      action.addOp(new BondAttr(bondId, 'stereo', Bond.PATTERN.STEREO.DOWN));
      continue;
    }

    if (bond.stereo === Bond.PATTERN.STEREO.DOWN) {
      action.addOp(new BondAttr(bondId, 'stereo', Bond.PATTERN.STEREO.UP));
    }
  }
};

function fromStructureFlip(
  reStruct: ReStruct,
  selection: EditorSelection | null,
  flipDirection: FlipDirection,
  center: Vec2,
) {
  const struct = reStruct.molecule;
  const action = new Action();

  const sGroups = getRelSGroupsBySelection(struct, selection?.atoms ?? []);

  // Monomer sgroups present in the selection, regardless of their
  // expanded/collapsed state.
  const monomerSGroups: MonomerMicromolecule[] = [];
  sGroups.forEach((sg) => {
    if (sg instanceof MonomerMicromolecule) {
      monomerSGroups.push(sg);
    }
  });

  // If at least one monomer in the selection is expanded, every monomer in
  // the selection gets its atoms flipped (reflected) and a
  // `FlipMonomerOperation` assigned. If none are expanded (all collapsed),
  // no monomer gets a transformation, and their atoms are only translated
  // (rigid-body move) so their internal structure keeps its shape, with
  // only the overall position changing to match the flipped monomer shape.
  const hasExpandedMonomer = monomerSGroups.some((sg) => sg.isExpanded());

  const atomIdToMonomerSGroup = new Map<number, MonomerMicromolecule>();
  monomerSGroups.forEach((sg) => {
    sg.atoms.forEach((aid) => atomIdToMonomerSGroup.set(aid, sg));
  });

  for (const atomId of selection?.atoms ?? []) {
    const atom = struct.atoms.get(atomId);
    if (!atom) {
      continue;
    }

    const monomerSGroup = atomIdToMonomerSGroup.get(atomId);

    if (monomerSGroup && !hasExpandedMonomer) {
      // Rigid-body translation: move the atom by the same delta applied to
      // the monomer's contracted position, preserving relative atom
      // positions within the structure.
      if (!monomerSGroup.pp) {
        continue;
      }
      const difference = flipPointByCenter(
        monomerSGroup.pp,
        center,
        flipDirection,
      );
      action.addOp(new AtomMove(atomId, difference));
      continue;
    }

    const difference = flipPointByCenter(atom.pp, center, flipDirection);
    action.addOp(new AtomMove(atomId, difference));
  }

  sGroups.forEach((sGroup) => {
    if (!sGroup.pp) {
      return;
    }
    const difference = flipPointByCenter(sGroup.pp, center, flipDirection);
    action.addOp(new SGroupDataMove(sGroup.id, difference));

    if (hasExpandedMonomer && sGroup instanceof MonomerMicromolecule) {
      action.addOp(
        new FlipMonomerOperation({
          id: sGroup.id,
          value: flipDirection,
        }),
      );
    }
  });

  if (selection?.bonds) {
    flipBonds(selection.bonds, struct, action);
  }

  return action.perform(reStruct);
}

export function fromRotate(restruct, selection, center, angle: number) {
  const struct = restruct.molecule;

  const action = new Action();

  if (!selection) {
    selection = structSelection(struct);
  }

  if (selection.atoms) {
    const sgroups = getRelSGroupsBySelection(struct, selection.atoms);

    // Monomer sgroups present in the selection, regardless of their
    // expanded/collapsed state.
    const monomerSGroups: MonomerMicromolecule[] = [];
    sgroups.forEach((sg) => {
      if (sg instanceof MonomerMicromolecule) {
        monomerSGroups.push(sg);
      }
    });

    // If at least one monomer in the selection is expanded, every monomer
    // gets its atoms rotated individually about the common center. If none
    // are expanded (all collapsed), no monomer's atoms are rotated
    // individually - instead they are translated as a rigid body (by the
    // same delta applied to the monomer's contracted position), so their
    // internal structure keeps its shape and only the overall position
    // changes to match the rotated monomer position.
    const hasExpandedMonomer = monomerSGroups.some((sg) => sg.isExpanded());

    const atomIdToMonomerSGroup = new Map<number, MonomerMicromolecule>();
    monomerSGroups.forEach((sg) => {
      sg.atoms.forEach((aid) => atomIdToMonomerSGroup.set(aid, sg));
    });

    for (const aid of selection.atoms) {
      const atom = struct.atoms.get(aid);
      if (!atom) continue;

      const monomerSGroup = atomIdToMonomerSGroup.get(aid);

      if (monomerSGroup && !hasExpandedMonomer) {
        if (!monomerSGroup.pp) continue;

        action.addOp(
          new AtomMove(aid, rotateDelta(monomerSGroup.pp, center, angle)),
        );
        continue;
      }

      action.addOp(new AtomMove(aid, rotateDelta(atom.pp, center, angle)));
    }

    if (!selection.sgroupData) {
      sgroups.forEach((sg) => {
        if (!sg.pp) {
          return;
        }

        action.addOp(
          new SGroupDataMove(sg.id, rotateDelta(sg.pp, center, angle)),
        );
      });
    }
  }

  if (selection.rxnArrows) {
    for (const arrowId of selection.rxnArrows) {
      action.addOp(new RxnArrowRotate(arrowId, angle, center));
    }
  }

  if (selection.rxnPluses) {
    for (const pid of selection.rxnPluses) {
      const plus = struct.rxnPluses.get(pid);
      if (!plus) continue;

      action.addOp(new RxnPlusMove(pid, rotateDelta(plus.pp, center, angle)));
    }
  }

  if (selection.texts) {
    for (const textId of selection.texts) {
      const text = struct.texts.get(textId);
      if (!text) continue;

      action.addOp(
        new TextMove(textId, rotateDelta(text.position, center, angle)),
      );
    }
  }

  if (selection.sgroupData) {
    for (const did of selection.sgroupData) {
      const data = struct.sgroups.get(did);
      if (!data?.pp) continue;

      action.addOp(
        new SGroupDataMove(did, rotateDelta(data.pp, center, angle)),
      );
    }
  }

  if (selection.enhancedFlags) {
    for (const flagId of selection.enhancedFlags) {
      const frId = flagId;
      const frag = restruct.molecule.frags.get(frId);
      if (!frag) continue;

      action.addOp(
        new EnhancedFlagMove(
          flagId,
          rotateDelta(
            frag.stereoFlagPosition ||
              Fragment.getDefaultStereoFlagPosition(restruct.molecule, frId),
            center,
            angle,
          ),
        ),
      );
    }
  }

  return action.perform(restruct);
}
