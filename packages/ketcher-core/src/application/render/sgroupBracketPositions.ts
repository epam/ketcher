import type { Box2Abs } from 'domain/entities/box2Abs';
import { SGroup, type SGroupBracketPosition } from 'domain/entities/sgroup';
import type { Struct } from 'domain/entities/struct';
import { Vec2 } from 'domain/entities/vec2';
import { assert } from 'utilities';
import { getSGroupBracketEndpoints } from './sgroupBracketPath';

export interface PositionedSGroupBracket {
  center: Vec2;
  direction: Vec2;
  angleDirection: Vec2;
  width: number;
  height: number;
}

export interface PositionedSGroupBrackets {
  opening: PositionedSGroupBracket;
  closing: PositionedSGroupBracket;
}

type BracketPositions = {
  opening: SGroupBracketPosition;
  closing: SGroupBracketPosition;
};

function getBracketPositions(sgroup: SGroup): BracketPositions | undefined {
  const opening = sgroup.data.brackets?.opening.position;
  const closing = sgroup.data.brackets?.closing.position;
  assert(
    Boolean(opening) === Boolean(closing),
    `S-group ${sgroup.id} has an incomplete bracket position set`,
  );
  return opening && closing ? { opening, closing } : undefined;
}

function isPoint(position: SGroupBracketPosition): boolean {
  return (
    position.start.x === position.end.x && position.start.y === position.end.y
  );
}

export function getSGroupBracketPositionState(
  sgroup: SGroup,
): 'automatic' | 'positioned' | 'suppressed' {
  const positions = getBracketPositions(sgroup);
  if (!positions) {
    return 'automatic';
  }
  return isPoint(positions.opening) || isPoint(positions.closing)
    ? 'suppressed'
    : 'positioned';
}

function getBracketParameters(
  position: SGroupBracketPosition,
  otherPosition: SGroupBracketPosition,
  groupCenter: Vec2,
  width: number,
  side: 'opening' | 'closing',
): PositionedSGroupBracket {
  const start = new Vec2(position.start);
  const end = new Vec2(position.end);
  const startIsLower =
    start.y > end.y || (start.y === end.y && start.x < end.x);
  const lower = startIsLower ? start : end;
  const upper = startIsLower ? end : start;
  const length = Vec2.dist(start, end);
  assert(length > 0, 'Cannot render a zero-length S-group bracket');
  const direction = lower.sub(upper).scaled(1 / length);
  const normal = direction.turnLeft();
  const center = Vec2.centre(start, end);
  const otherCenter = Vec2.centre(
    new Vec2(otherPosition.start),
    new Vec2(otherPosition.end),
  );
  const towardGroup = Vec2.dot(normal, groupCenter.sub(center));
  const towardOther = Vec2.dot(normal, otherCenter.sub(center));
  const sign =
    Math.sign(towardGroup || towardOther) || (side === 'opening' ? -1 : 1);
  return {
    center,
    direction,
    angleDirection: normal.scaled(-sign),
    width,
    height: length,
  };
}

export function getPositionedSGroupBrackets(
  sgroup: SGroup,
  struct: Pick<Struct, 'atoms'>,
  width: number,
): PositionedSGroupBrackets {
  const positions = getBracketPositions(sgroup);
  assert(
    positions && !isPoint(positions.opening) && !isPoint(positions.closing),
    `S-group ${sgroup.id} has no drawable bracket positions`,
  );
  const atomIds = SGroup.getAtoms(struct, sgroup);
  assert(atomIds.length > 0, `S-group ${sgroup.id} has no atoms`);
  const groupCenter = atomIds
    .reduce((center, atomId) => {
      const atom = struct.atoms.get(atomId);
      assert(atom, `Atom ${atomId} is missing from S-group ${sgroup.id}`);
      return center.add(atom.pp);
    }, new Vec2())
    .scaled(1 / atomIds.length);
  return {
    opening: getBracketParameters(
      positions.opening,
      positions.closing,
      groupCenter,
      width,
      'opening',
    ),
    closing: getBracketParameters(
      positions.closing,
      positions.opening,
      groupCenter,
      width,
      'closing',
    ),
  };
}

export function includePositionedSGroupBrackets(
  box: Box2Abs,
  brackets: PositionedSGroupBrackets,
): Box2Abs {
  return [brackets.opening, brackets.closing].reduce((bounds, bracket) => {
    const endpoints = getSGroupBracketEndpoints({
      center: bracket.center,
      bracketDirection: bracket.direction,
      bracketAngleDirection: bracket.angleDirection,
      width: bracket.width,
      height: bracket.height,
    });
    return bounds
      .include(endpoints.point0)
      .include(endpoints.point1)
      .include(endpoints.arc0)
      .include(endpoints.arc1);
  }, box);
}
