import { HalfEdge } from 'application/render/view-model/HalfEdge';
import { Bond } from 'domain/entities/CoreBond';
import { KetcherLogger } from 'utilities';
import { Box2Abs, Pile, Vec2 } from 'domain/entities';
import { Atom } from 'domain/entities/CoreAtom';
import { Loop } from 'application/render/view-model/Loop';

export class ViewModel {
  public halfEdges = new Map<number, HalfEdge>();
  public atomsToHalfEdges = new Map<Atom, HalfEdge[]>();
  public bondsToHalfEdges = new Map<Bond, HalfEdge[]>();
  public loops = new Map<number, Loop>();

  private setHalfBondProperties(
    halfEdge: HalfEdge,
    oppositeHalfEdge: HalfEdge,
  ) {
    const coordsDifference = Vec2.diff(
      halfEdge.secondAtom.position,
      halfEdge.firstAtom.position,
    ).normalized();

    halfEdge.oppositeHalfEdge = oppositeHalfEdge;
    halfEdge.direction =
      Vec2.dist(halfEdge.secondAtom.position, halfEdge.firstAtom.position) >
      1e-4
        ? coordsDifference
        : new Vec2(1, 0);
    if (halfEdge.loopId < 0) halfEdge.loopId = -1;
  }

  private setAtomsToHalfEdgesMap(atom: Atom, halfEdge: HalfEdge) {
    const atomHalfEdges = this.atomsToHalfEdges.get(atom);

    if (!atomHalfEdges) {
      this.atomsToHalfEdges.set(atom, [halfEdge]);
    } else {
      atomHalfEdges.push(halfEdge);
    }
  }

  private setBondsToHalfEdgesMap(bond: Bond, halfEdge: HalfEdge) {
    const bondsToHalfEdges = this.bondsToHalfEdges.get(bond);

    if (!bondsToHalfEdges) {
      this.bondsToHalfEdges.set(bond, [halfEdge]);
    } else {
      bondsToHalfEdges.push(halfEdge);
    }
  }

  private initHalfEdge(bond: Bond) {
    const firstHalfEdgeId = 2 * bond.id;
    const secondHalfEdgeId = 2 * bond.id + 1;
    const firstHalfEdge = new HalfEdge(
      firstHalfEdgeId,
      bond.firstAtom,
      bond.secondAtom,
      bond,
    );
    const secondHalfEdge = new HalfEdge(
      secondHalfEdgeId,
      bond.secondAtom,
      bond.firstAtom,
      bond,
    );

    this.halfEdges.set(firstHalfEdgeId, firstHalfEdge);
    this.halfEdges.set(secondHalfEdgeId, secondHalfEdge);
    this.setAtomsToHalfEdgesMap(bond.firstAtom, firstHalfEdge);
    this.setAtomsToHalfEdgesMap(bond.secondAtom, secondHalfEdge);
    this.setBondsToHalfEdgesMap(bond, firstHalfEdge);
    this.setBondsToHalfEdgesMap(bond, secondHalfEdge);
    this.setHalfBondProperties(firstHalfEdge, secondHalfEdge);
    this.setHalfBondProperties(secondHalfEdge, firstHalfEdge);
  }

  private initHalfEdges(bonds: Bond[]) {
    bonds.forEach((bond) => {
      this.initHalfEdge(bond);
    });
  }

  private setHalfEdgesAngle(halfEdge: HalfEdge, nextHalfEdge: HalfEdge) {
    halfEdge.cosToRightNeighborHalfEdge = Vec2.dot(
      halfEdge.direction,
      nextHalfEdge.direction,
    );
    nextHalfEdge.cosToLeftNeighborHalfEdge = Vec2.dot(
      halfEdge.direction,
      nextHalfEdge.direction,
    );

    halfEdge.sinToRightNeighborHalfEdge = Vec2.cross(
      halfEdge.direction,
      nextHalfEdge.direction,
    );
    nextHalfEdge.sinToLeftNeighborHalfEdge = Vec2.cross(
      halfEdge.direction,
      nextHalfEdge.direction,
    );

    nextHalfEdge.leftNeighborHalfEdge = halfEdge;
    halfEdge.rightNeighborHalfEdge = nextHalfEdge;
  }

  private sortAtomsHalfEdges() {
    this.atomsToHalfEdges.forEach((atomHalfEdges, atom) => {
      atomHalfEdges
        .sort((halfEdge1, halfEdge2) => halfEdge1.angle - halfEdge2.angle)
        .forEach((halfEdge, halfEdgeIndex) => {
          const nextHalfEdge =
            atomHalfEdges[(halfEdgeIndex + 1) % atomHalfEdges.length];

          if (!halfEdge.oppositeHalfEdge) {
            KetcherLogger.warn(
              `Failed to sort HalfEdges for atom ${atom.id}. HalfEdge ${halfEdge.id} has no opposite halfEdge`,
            );

            return;
          }

          halfEdge.oppositeHalfEdge.nextHalfEdge = nextHalfEdge;
          this.setHalfEdgesAngle(halfEdge, nextHalfEdge);
        });
    });
  }

  private partitionLoop(halfEdgesInLoop: HalfEdge[]) {
    const subloops: Array<HalfEdge[]> = [];
    let continueFlag = true;

    while (continueFlag) {
      const atomToHalfBond = {}; // map from every atom in the loop to the index of the first half-bond starting from that atom in the uniqHb array
      continueFlag = false;

      for (let l = 0; l < halfEdgesInLoop.length; ++l) {
        const halfEdge = halfEdgesInLoop[l];
        const firstAtomId = halfEdge.firstAtom.id;
        const secondAtomId = halfEdge.secondAtom.id;
        if (secondAtomId in atomToHalfBond) {
          // subloop found
          const s = atomToHalfBond[secondAtomId]; // where the subloop begins
          const subloop = halfEdgesInLoop.slice(s, l + 1);
          subloops.push(subloop);
          if (l < halfEdgesInLoop.length) {
            // remove half-bonds corresponding to the subloop
            halfEdgesInLoop.splice(s, l - s + 1);
          }
          continueFlag = true;
          break;
        }
        atomToHalfBond[firstAtomId] = l;
      }
      if (!continueFlag) subloops.push(halfEdgesInLoop); // we're done, no more subloops found
    }
    return subloops;
  }

  private getAngleBetweenHalfEdges(
    firstHalfEdge: HalfEdge,
    secondHalfEdge: HalfEdge,
  ): number {
    return Math.atan2(
      Vec2.cross(firstHalfEdge.direction, secondHalfEdge.direction),
      Vec2.dot(firstHalfEdge.direction, secondHalfEdge.direction),
    );
  }

  private loopIsInner(halfEdgesInLoop: HalfEdge[]): boolean {
    let totalAngle = 2 * Math.PI;
    halfEdgesInLoop.forEach((halfEdge, i, loopArr) => {
      const nextHalfEdge = loopArr[(i + 1) % loopArr.length];
      const angle = this.getAngleBetweenHalfEdges(halfEdge, nextHalfEdge);
      totalAngle +=
        nextHalfEdge.oppositeHalfEdge === halfEdge ? Math.PI : angle; // back and forth along the same edge
    });
    return Math.abs(totalAngle) < Math.PI;
  }

  private loopHasSelfIntersections(halfEdges: Array<HalfEdge>) {
    for (let i = 0; i < halfEdges.length; ++i) {
      const halfEdge = halfEdges[i];
      const set = new Pile([halfEdge.firstAtom, halfEdge.secondAtom]);

      for (let j = i + 2; j < halfEdges.length; ++j) {
        const nextNextHalfEdge = halfEdges[j];
        if (
          set.has(nextNextHalfEdge.firstAtom) ||
          set.has(nextNextHalfEdge.secondAtom)
        )
          continue; // skip edges sharing an atom

        if (
          Box2Abs.segmentIntersection(
            halfEdge.firstAtom.position,
            halfEdge.secondAtom.position,
            nextNextHalfEdge.firstAtom.position,
            nextNextHalfEdge.secondAtom.position,
          )
        )
          return true;
      }
    }

    return false;
  }

  private loopIsConvex(loop: HalfEdge[]): boolean {
    return loop.every((halfEdge, k, loopArr) => {
      const angle = this.getAngleBetweenHalfEdges(
        halfEdge,
        loopArr[(k + 1) % loopArr.length],
      );
      return angle <= 0;
    });
  }

  private findLoops() {
    const newLoops: Array<number[]> = [];
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

    let currentHalfEdge;
    let index = 0;
    let halfEdgesInPotentialLoop: HalfEdge[] = [];

    this.halfEdges.forEach((halfEdge) => {
      if (halfEdge.loopId !== -1) return;

      for (
        currentHalfEdge = halfEdge, index = 0, halfEdgesInPotentialLoop = [];
        index <= this.halfEdges.size;
        currentHalfEdge = currentHalfEdge.nextHalfEdge, ++index
      ) {
        if (!(index > 0 && currentHalfEdge === halfEdge)) {
          halfEdgesInPotentialLoop.push(currentHalfEdge);
          continue; // eslint-disable-line no-continue
        }

        // loop found
        const subloops = this.partitionLoop(halfEdgesInPotentialLoop);
        subloops.forEach((halfEdgesInSubLoop) => {
          let loopId;
          if (
            this.loopIsInner(halfEdgesInSubLoop) &&
            !this.loopHasSelfIntersections(halfEdgesInSubLoop)
          ) {
            /*
                        loop is internal
                        use lowest half-bond id in the loop as the loop id
                        this ensures that the loop gets the same id if it is discarded and then recreated,
                        which in turn is required to enable redrawing while dragging, as actions store item id's
                     */
            loopId = Math.min(
              ...halfEdgesInSubLoop.map((halfEdge) => halfEdge.id),
            );
            this.loops.set(
              loopId,
              new Loop(
                halfEdgesInSubLoop,
                this.loopIsConvex(halfEdgesInSubLoop),
              ),
            );
          } else {
            loopId = -2;
          }

          halfEdgesInSubLoop.forEach((halfEdge) => {
            halfEdge.loopId = loopId;
            bondsToMark.add(halfEdge.bond.id);
          });

          if (loopId >= 0) newLoops.push(loopId);
        });
        break;
      }
    });

    return {
      newLoops,
      bondsToMark: Array.from(bondsToMark),
    };
  }

  private clearState() {
    this.halfEdges.clear();
    this.loops.clear();
    this.atomsToHalfEdges.clear();
    this.bondsToHalfEdges.clear();
  }

  public initialize(bonds: Bond[]) {
    this.clearState();
    this.initHalfEdges(bonds);
    this.sortAtomsHalfEdges();
    this.findLoops();
  }
}
