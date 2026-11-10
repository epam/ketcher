import { cloneDeep } from 'lodash';
import type { RenderersManager } from 'application/render/renderers/RenderersManager';
import type { DrawingEntity } from 'domain/entities/DrawingEntity';
import type { Operation } from 'domain/entities/Operation';
import {
  SGroup,
  type SGroupBrackets,
  withoutSGroupBracketPositions,
} from 'domain/entities/sgroup';
import type { Struct } from 'domain/entities/struct';
import { assert } from 'utilities';
import { getSGroupBracketContext } from './sgroupBracketPositions';

interface BracketPositionSnapshot {
  struct: Struct;
  groupId: number;
  brackets: SGroupBrackets;
  atomPositions: Map<number, { x: number; y: number }>;
}

function setBracketPositions(
  snapshots: BracketPositionSnapshot[],
  restore: boolean,
) {
  for (const { struct, groupId, brackets } of snapshots) {
    const group = struct.sgroups.get(groupId);
    assert(group, `S-group ${groupId} is missing while updating brackets`);
    group.data.brackets = restore
      ? cloneDeep(brackets)
      : withoutSGroupBracketPositions(brackets);
  }
}

class RestoreUnchangedBracketPositionsOperation implements Operation {
  constructor(private readonly snapshots: BracketPositionSnapshot[]) {}

  execute() {
    setBracketPositions(this.snapshots, true);
  }

  invert() {
    setBracketPositions(this.snapshots, false);
  }

  executeAfterAllOperations(renderersManager: RenderersManager) {
    renderersManager.rerenderSGroups();
  }

  invertAfterAllOperations(renderersManager: RenderersManager) {
    this.executeAfterAllOperations(renderersManager);
  }
}

export class SGroupBracketPositionHistoryOperation implements Operation {
  private readonly snapshots: BracketPositionSnapshot[] = [];
  private changed: BracketPositionSnapshot[] = [];
  private unchanged: BracketPositionSnapshot[] = [];

  constructor(drawingEntities: Iterable<DrawingEntity>) {
    const seen = new Map<Struct, Set<number>>();
    for (const drawingEntity of drawingEntities) {
      const context = getSGroupBracketContext(drawingEntity);
      if (!context) {
        continue;
      }

      const groupIds = seen.get(context.struct) ?? new Set<number>();
      seen.set(context.struct, groupIds);
      for (const group of context.groups) {
        const brackets = group.data.brackets;
        if (
          groupIds.has(group.id) ||
          (!brackets?.opening.position && !brackets?.closing.position)
        ) {
          continue;
        }

        groupIds.add(group.id);
        const atomPositions = new Map<number, { x: number; y: number }>();
        for (const atomId of SGroup.getAtoms(context.struct, group)) {
          const atom = context.struct.atoms.get(atomId);
          assert(atom, `Atom ${atomId} is missing from S-group ${group.id}`);
          atomPositions.set(atomId, { x: atom.pp.x, y: atom.pp.y });
        }
        this.snapshots.push({
          struct: context.struct,
          groupId: group.id,
          brackets: cloneDeep(brackets),
          atomPositions,
        });
      }
    }
  }

  finish() {
    this.changed = [];
    this.unchanged = [];
    for (const snapshot of this.snapshots) {
      const { struct, groupId, atomPositions } = snapshot;
      const group = struct.sgroups.get(groupId);
      assert(group, `S-group ${groupId} is missing while finishing a gesture`);
      const atomIds = SGroup.getAtoms(struct, group);
      const hasChanged =
        atomIds.length !== atomPositions.size ||
        atomIds.some((atomId) => {
          const before = atomPositions.get(atomId);
          const atom = struct.atoms.get(atomId);
          return (
            !before || !atom || atom.pp.x !== before.x || atom.pp.y !== before.y
          );
        });

      if (hasChanged) {
        this.changed.push(snapshot);
      } else if (
        !group.data.brackets?.opening.position ||
        !group.data.brackets?.closing.position
      ) {
        this.unchanged.push(snapshot);
      }
    }
  }

  get hasChanges() {
    return this.changed.length > 0;
  }

  getUnchangedRestoration(): Operation | undefined {
    return this.unchanged.length
      ? new RestoreUnchangedBracketPositionsOperation(this.unchanged)
      : undefined;
  }

  execute() {
    setBracketPositions(this.changed, false);
  }

  invert() {
    setBracketPositions(this.changed, true);
  }

  executeAfterAllOperations(renderersManager: RenderersManager) {
    renderersManager.rerenderSGroups();
  }

  invertAfterAllOperations(renderersManager: RenderersManager) {
    this.executeAfterAllOperations(renderersManager);
  }
}
