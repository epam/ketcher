import { Vec2 } from 'domain/entities';
import { Atom } from 'domain/entities/CoreAtom';
import { Bond } from 'domain/entities/CoreBond';

export class HalfEdge {
  public direction: Vec2;
  public loopId: number;
  // eslint-disable-next-line no-use-before-define
  public oppositeHalfEdge: HalfEdge | undefined;
  // eslint-disable-next-line no-use-before-define
  public nextHalfEdge: HalfEdge | undefined;
  public sinToLeftNeighborHalfEdge: number;
  public cosToLeftNeighborHalfEdge: number;
  // eslint-disable-next-line no-use-before-define
  public leftNeighborHalfEdge: HalfEdge | undefined;
  public sinToRightNeighborHalfEdge: number;
  public cosToRightNeighborHalfEdge: number;
  // eslint-disable-next-line no-use-before-define
  public rightNeighborHalfEdge: HalfEdge | undefined;

  constructor(
    public id: number,
    public firstAtom: Atom,
    public secondAtom: Atom,
    public bond: Bond,
  ) {
    this.direction = new Vec2();
    this.loopId = -1; // left loop id if the half-bond is in a loop, otherwise -1
    this.sinToLeftNeighborHalfEdge = 0;
    this.cosToLeftNeighborHalfEdge = 0;
    this.sinToRightNeighborHalfEdge = 0;
    this.cosToRightNeighborHalfEdge = 0;
  }

  public get leftNormal() {
    return this.direction.turnLeft();
  }

  public get angle() {
    // angle to (1,0), used for sorting the bonds
    return this.direction.oxAngle();
  }

  public get position() {
    return this.firstAtom.position || new Vec2(0, 0);
  }
}
