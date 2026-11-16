/**
 * Model-level helpers for inserting a library item into an existing polymer
 * bond by drag-drop (issue #7925). Pure geometry and AP resolution live in
 * `insertionHelpers.ts`; this file connects them to drawing entities.
 */

import { Vec2 } from 'domain/entities';
import { Command } from 'domain/entities/Command';
import { BaseMonomer } from 'domain/entities/BaseMonomer';
import { PolymerBond } from 'domain/entities/PolymerBond';
import type { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import { Sugar } from 'domain/entities/Sugar';
import { RNABase } from 'domain/entities/RNABase';
import { KetMonomerClass } from 'domain/constants/monomers';
import {
  AttachmentPointName,
  type MonomerOrAmbiguousType,
  type MonomerItemType,
} from 'domain/types';
import type { IRnaPreset } from 'application/editor/tools/Tool';
import { Coordinates } from 'application/editor/shared/coordinates';
import { PolymerBondSnapToMonomersOperation } from 'application/editor/operations/polymerBond';
import {
  isAmbiguousMonomerLibraryItem,
  isLibraryItemRnaPreset,
} from 'domain/helpers/monomers';
import {
  computeShiftSet,
  getBondDirection,
  getExtendedBondLength,
  isBondInCycle,
  orderBondEnds,
  resolveMonomerInsertion,
  resolvePresetInsertion,
  type GraphEdge,
  type Point,
  type InsertionMonomerKind,
  type MonomerInsertionResolution,
  type PresetInsertionResolution,
} from './insertionHelpers';

export type BondInsertionTarget = {
  bond: PolymerBond;
  /**
  Distance class of the cursor to the bond
  */
  level: 'near' | 'nearest';
  /**
  Closest point of the bond to the cursor, canvas-space pixels
  */
  indicatorPosition: Vec2;
  /**
  Exact cursor-to-bond distance in canvas-space pixels (used for conflict
  resolution when an attachment point is also within range).
  */
  distance: number;
};

function distanceToSegment(
  point: Vec2,
  a: Vec2,
  b: Vec2,
): { distance: number; closest: Vec2 } {
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const lengthSquared = abx * abx + aby * aby;
  const t =
    lengthSquared === 0
      ? 0
      : Math.max(
          0,
          Math.min(
            1,
            ((point.x - a.x) * abx + (point.y - a.y) * aby) / lengthSquared,
          ),
        );
  const closest = new Vec2(a.x + t * abx, a.y + t * aby);
  return {
    distance: Math.hypot(point.x - closest.x, point.y - closest.y),
    closest,
  };
}

/**
 * Finds the polymer bond nearest to the cursor (canvas pixels) within
 * `outerThreshold`. Hydrogen bonds and bonds without a second monomer are
 * ignored. When `straightBondsOnly` is set (snake mode) only horizontal bonds
 * are considered, because turn bonds are not straight lines.
 */
export function findBondInsertionTarget(
  drawingEntitiesManager: DrawingEntitiesManager,
  cursorCanvas: Vec2,
  thresholds: { outer: number; inner: number },
  straightBondsOnly: boolean,
): BondInsertionTarget | null {
  let best: BondInsertionTarget | null = null;
  let bestDistance = thresholds.outer;

  for (const [, bond] of drawingEntitiesManager.polymerBonds) {
    if (!(bond instanceof PolymerBond) || !bond.secondMonomer) continue;
    if (straightBondsOnly && !bond.isHorizontal) continue;

    const a = Coordinates.modelToCanvas(bond.firstMonomer.position);
    const b = Coordinates.modelToCanvas(bond.secondMonomer.position);
    const { distance, closest } = distanceToSegment(cursorCanvas, a, b);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = {
        bond,
        level: distance <= thresholds.inner ? 'nearest' : 'near',
        indicatorPosition: closest,
        distance,
      };
    }
  }
  return best;
}

export type InsertionEnds = {
  left: BaseMonomer;
  right: BaseMonomer;
  leftAp: AttachmentPointName;
  rightAp: AttachmentPointName;
};

/**
 * Orders the bond monomers into left/top and right/bottom and reads the APs
 * the bond uses on each of them. Returns null for an incomplete bond.
 */
export function getInsertionEnds(bond: PolymerBond): InsertionEnds | null {
  const { firstMonomer, secondMonomer } = bond;
  if (!secondMonomer) return null;
  const firstAp = firstMonomer.getAttachmentPointByBond(bond);
  const secondAp = secondMonomer.getAttachmentPointByBond(bond);
  if (!firstAp || !secondAp) return null;

  const [leftPos] = orderBondEnds(
    firstMonomer.position,
    secondMonomer.position,
  );
  if (leftPos === firstMonomer.position) {
    return {
      left: firstMonomer,
      right: secondMonomer,
      leftAp: firstAp,
      rightAp: secondAp,
    };
  }
  return {
    left: secondMonomer,
    right: firstMonomer,
    leftAp: secondAp,
    rightAp: firstAp,
  };
}

export function getMonomerInsertionKind(
  monomer: BaseMonomer,
): InsertionMonomerKind {
  if (monomer instanceof Sugar) return 'sugar';
  if (monomer instanceof RNABase) return 'base';
  return 'other';
}

function getItemInsertionKind(
  item: MonomerOrAmbiguousType,
): InsertionMonomerKind {
  if (isAmbiguousMonomerLibraryItem(item)) return 'other';
  const monomerClass = item.props?.MonomerClass;
  if (monomerClass === KetMonomerClass.Sugar) return 'sugar';
  if (monomerClass === KetMonomerClass.Base) return 'base';
  return 'other';
}

function getItemAttachmentPoints(
  item: MonomerOrAmbiguousType,
): AttachmentPointName[] {
  if (isAmbiguousMonomerLibraryItem(item)) {
    return item.monomers[0]?.listOfAttachmentPoints ?? [];
  }
  const definition = (item as MonomerItemType).attachmentPoints;
  if (definition && definition.length > 0) {
    return BaseMonomer.getAttachmentPointDictFromMonomerDefinition(definition)
      .attachmentPointsList;
  }
  return [AttachmentPointName.R1, AttachmentPointName.R2];
}

export type ItemInsertionResolution =
  MonomerInsertionResolution | PresetInsertionResolution;

/**
 * Resolves the attachment points the dropped item uses for the two new bonds.
 */
export function resolveItemInsertion(
  item: IRnaPreset | MonomerOrAmbiguousType,
  ends: InsertionEnds,
): ItemInsertionResolution {
  const left = {
    kind: getMonomerInsertionKind(ends.left),
    ap: ends.leftAp,
  };
  const right = {
    kind: getMonomerInsertionKind(ends.right),
    ap: ends.rightAp,
  };

  if (isLibraryItemRnaPreset(item)) {
    return resolvePresetInsertion({
      left,
      right,
      hasPhosphate: Boolean(item.phosphate),
      phosphatePosition: item.phosphatePosition ?? 'right',
    });
  }

  return resolveMonomerInsertion({
    left,
    right,
    newMonomer: {
      kind: getItemInsertionKind(item),
      attachmentPoints: getItemAttachmentPoints(item),
    },
  });
}

function collectNodes(drawingEntitiesManager: DrawingEntitiesManager) {
  return [...drawingEntitiesManager.monomers.values()].map((monomer) => ({
    id: monomer.id,
    position: monomer.position,
  }));
}

export function collectPolymerBondEdges(
  drawingEntitiesManager: DrawingEntitiesManager,
): GraphEdge[] {
  const edges: GraphEdge[] = [];
  drawingEntitiesManager.polymerBonds.forEach((polymerBond) => {
    if (polymerBond instanceof PolymerBond && polymerBond.secondMonomer) {
      edges.push([polymerBond.firstMonomer.id, polymerBond.secondMonomer.id]);
    }
  });
  return edges;
}

export type FlexInsertionLayout = {
  /**
  Model-space midpoint of the extended bond
  */
  middle: Vec2;
  /**
  Unit vector along the bond (left/top → right/bottom)
  */
  direction: Point;
  /**
  Extra bond length added by the insertion (≥ 0)
  */
  delta: number;
  /**
  Monomers that must move by `direction * delta`
  */
  shiftedMonomers: BaseMonomer[];
};

/**
 * Computes where the inserted item goes in Flex mode and which monomers make
 * room for it (reqs. 7.2–7.4, 7.6).
 */
export function computeFlexInsertionLayout(
  drawingEntitiesManager: DrawingEntitiesManager,
  ends: InsertionEnds,
  hasPhosphate: boolean,
): FlexInsertionLayout {
  const from = ends.left.position;
  const to = ends.right.position;
  const length = Math.hypot(to.x - from.x, to.y - from.y);
  const direction = getBondDirection(from, to);
  const extendedLength = getExtendedBondLength(length, from, to, hasPhosphate);
  const delta = Math.max(0, extendedLength - length);

  const nodes = collectNodes(drawingEntitiesManager);
  const edges = collectPolymerBondEdges(drawingEntitiesManager);

  const shiftedIds =
    delta > 0
      ? computeShiftSet({
          bond: [ends.left.id, ends.right.id],
          leftTopId: ends.left.id,
          rightBottomId: ends.right.id,
          nodes,
          edges,
        })
      : new Set<number>();

  return {
    middle: new Vec2(
      from.x + (direction.x * extendedLength) / 2,
      from.y + (direction.y * extendedLength) / 2,
    ),
    direction,
    delta,
    shiftedMonomers: [...shiftedIds]
      .map((id) => drawingEntitiesManager.monomers.get(id))
      .filter((monomer): monomer is BaseMonomer => Boolean(monomer)),
  };
}

/**
 * Moves the shifted monomers along the bond by the extension delta and
 * re-snaps their bonds. Part of the insertion command, so undo is atomic.
 */
export function buildShiftCommand(
  drawingEntitiesManager: DrawingEntitiesManager,
  layout: FlexInsertionLayout,
): Command {
  const command = new Command();
  const snapped = new Set<PolymerBond>();
  layout.shiftedMonomers.forEach((monomer) => {
    command.merge(
      drawingEntitiesManager.moveMonomer(
        monomer,
        new Vec2(
          monomer.position.x + layout.direction.x * layout.delta,
          monomer.position.y + layout.direction.y * layout.delta,
        ),
      ),
    );
    monomer.polymerBonds.forEach((polymerBond) => snapped.add(polymerBond));
  });
  snapped.forEach((polymerBond) =>
    command.addOperation(new PolymerBondSnapToMonomersOperation(polymerBond)),
  );
  return command;
}

/**
 * Req. 8: after a phosphate-containing preset replaced a monomer inside a
 * circular structure, the bond between the new phosphate and its external
 * neighbour is extended to 2C (see `getPhosphatePresetRequiredBondLength`) and
 * the monomers past the perpendicular line are shifted to keep the angles.
 * Returns an empty command when the structure is not circular or the bond is
 * already long enough.
 */
export function buildCircularReplacementExtension(
  drawingEntitiesManager: DrawingEntitiesManager,
  phosphate: BaseMonomer,
  sugar: BaseMonomer,
): Command {
  const externalBond = phosphate.polymerBonds.find(
    (bond) => bond.getAnotherMonomer(phosphate) !== sugar,
  );
  const neighbour = externalBond?.getAnotherMonomer(phosphate);
  if (!externalBond || !neighbour) return new Command();

  const edges = collectPolymerBondEdges(drawingEntitiesManager);
  if (!isBondInCycle([phosphate.id, neighbour.id], edges)) return new Command();

  const from = phosphate.position;
  const to = neighbour.position;
  const length = Math.hypot(to.x - from.x, to.y - from.y);
  const delta = getExtendedBondLength(length, from, to, true) - length;
  if (delta <= 0) return new Command();

  const shiftedIds = computeShiftSet({
    bond: [phosphate.id, neighbour.id],
    leftTopId: phosphate.id,
    rightBottomId: neighbour.id,
    nodes: collectNodes(drawingEntitiesManager),
    edges,
  });
  return buildShiftCommand(drawingEntitiesManager, {
    middle: from,
    direction: getBondDirection(from, to),
    delta,
    shiftedMonomers: [...shiftedIds]
      .map((id) => drawingEntitiesManager.monomers.get(id))
      .filter((monomer): monomer is BaseMonomer => Boolean(monomer)),
  });
}
