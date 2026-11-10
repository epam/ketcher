import { SGroup } from 'domain/entities/sgroup';
import type { Struct } from 'domain/entities/struct';
import { Vec2 } from 'domain/entities/vec2';
import { getSGroupBracketPositionState } from './sgroupBracketPositions';

const BRACKET_GAP = new Vec2(0.65, 0.65);
const MAX_BRACKET_WIDTH = 0.25;
const LABEL_GAP = 0.1;

export type SGroupBracketLayout = ReadonlyMap<SGroup, Vec2>;

export function getSGroupAtomSetKey(
  struct: Pick<Struct, 'atoms'>,
  sgroup: SGroup,
): string {
  return SGroup.getAtomSetKey(struct, sgroup);
}

export function getSGroupBracketLayout(
  struct: Pick<Struct, 'atoms' | 'sGroupForest'>,
  groups: Iterable<SGroup>,
  hasVisibleBrackets: (sgroup: SGroup) => boolean,
  measureExtents: (sgroup: SGroup) => Vec2,
): SGroupBracketLayout {
  const groupsByAtoms = new Map<string, SGroup[]>();
  const layout = new Map<SGroup, Vec2>();

  for (const group of groups) {
    if (
      !hasVisibleBrackets(group) ||
      getSGroupBracketPositionState(group) !== 'automatic'
    ) {
      continue;
    }

    const key = getSGroupAtomSetKey(struct, group);
    if (!key) {
      continue;
    }

    const peers = groupsByAtoms.get(key) ?? [];
    peers.push(group);
    groupsByAtoms.set(key, peers);
  }

  groupsByAtoms.forEach((peers) => {
    if (peers.length < 2) {
      return;
    }

    peers.sort((a, b) => {
      const depthDifference =
        struct.sGroupForest.getPathToRoot(b.id).length -
        struct.sGroupForest.getPathToRoot(a.id).length;
      return depthDifference || a.id - b.id;
    });

    let previousPadding: Vec2 | undefined;
    let previousExtents: Vec2 | undefined;
    peers.forEach((group) => {
      const padding = SGroup.getBracketPadding(group);
      const extents = measureExtents(group);
      const effectivePadding =
        previousPadding && previousExtents
          ? new Vec2(
              Math.max(
                padding.x,
                previousPadding.x +
                  Math.max(
                    BRACKET_GAP.x,
                    previousExtents.x + MAX_BRACKET_WIDTH + LABEL_GAP,
                  ),
              ),
              Math.max(
                padding.y,
                previousPadding.y +
                  Math.max(
                    BRACKET_GAP.y,
                    previousExtents.y + extents.y + LABEL_GAP,
                  ),
              ),
            )
          : padding;
      layout.set(group, effectivePadding.sub(padding));
      previousPadding = effectivePadding;
      previousExtents = extents;
    });
  });

  return layout;
}
