import { cloneDeep } from 'lodash';
import {
  type SGroup,
  type SGroupBrackets,
  withoutSGroupBracketPositions,
} from 'domain/entities/sgroup';
import type { Struct } from 'domain/entities/struct';
import type { DrawingEntity } from 'domain/entities/DrawingEntity';
import { Atom } from 'domain/entities/CoreAtom';
import { BaseMonomer } from 'domain/entities/BaseMonomer';
import { assert, isMonomerSgroupWithAttachmentPoints } from 'utilities';

export function getSGroupBracketContext(
  drawingEntity: DrawingEntity,
): { struct: Struct; groups: SGroup[] } | undefined {
  if (drawingEntity instanceof Atom) {
    const struct = drawingEntity.monomer.monomerItem.struct;
    return {
      struct,
      groups: [...struct.sgroups.values()].filter(
        (group) =>
          group.allAtoms ||
          group.atoms.includes(drawingEntity.atomIdInMicroMode),
      ),
    };
  }

  if (
    drawingEntity instanceof BaseMonomer &&
    drawingEntity.monomerItem.props.isMicromoleculeFragment &&
    isMonomerSgroupWithAttachmentPoints(drawingEntity)
  ) {
    const struct = drawingEntity.monomerItem.struct;
    return { struct, groups: [...struct.sgroups.values()] };
  }
  return undefined;
}

export class SGroupBracketPositionChanges {
  private readonly previousBrackets = new Map<number, SGroupBrackets>();
  private positionsRemoved = false;

  constructor(groups: Iterable<SGroup>) {
    for (const group of groups) {
      const brackets = group.data.brackets;
      if (brackets?.opening.position || brackets?.closing.position) {
        this.previousBrackets.set(group.id, cloneDeep(brackets));
      }
    }
  }

  toggle(struct: Struct): void {
    this.previousBrackets.forEach((previous, id) => {
      const group = struct.sgroups.get(id);
      assert(
        group,
        `S-group ${id} is missing while restoring bracket positions`,
      );
      group.data.brackets = this.positionsRemoved
        ? cloneDeep(previous)
        : withoutSGroupBracketPositions(previous);
    });
    this.positionsRemoved = !this.positionsRemoved;
  }
}
