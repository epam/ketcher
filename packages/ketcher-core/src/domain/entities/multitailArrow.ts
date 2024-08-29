import { BaseMicromoleculeEntity } from 'domain/entities/BaseMicromoleculeEntity';
import { Vec2 } from 'domain/entities/vec2';
import { Pool } from 'domain/entities/pool';
import { getNodeWithInvertedYCoord, KetFileNode } from 'domain/serializers';
import { MULTITAIL_ARROW_SERIALIZE_KEY } from 'domain/constants';

export type Line = [Vec2, Vec2];

export interface MultitailArrowsReferencePositions {
  head: Vec2;
  topTail: Vec2;
  bottomTail: Vec2;
  topSpine: Vec2;
  bottomSpine: Vec2;
  tails: Pool<Vec2>;
}

export type MultitailArrowReferencePositionsNames =
  keyof MultitailArrowsReferencePositions;

export interface MultitailArrowsReferenceLines {
  head: Line;
  topTail: Line;
  bottomTail: Line;
  spine: Line;
  tails: Pool<Line>;
}

export type MultitailArrowReferenceLinesNames =
  keyof MultitailArrowsReferenceLines;

export interface KetFileMultitailArrowNode {
  head: {
    position: Vec2;
  };
  spine: {
    pos: [Vec2, Vec2];
  };
  tails: {
    pos: Array<Vec2>;
  };
  zOrder: 0;
}

interface TailDistance {
  distance: number;
  center: number;
}

export class MultitailArrow extends BaseMicromoleculeEntity {
  static MIN_TAIL_DISTANCE = 0.35;
  static MIN_HEAD_LENGTH = 0.5;
  static MIN_TAIL_LENGTH = 0.4;
  static MIN_TOP_BOTTOM_OFFSET = 0.15;
  static MIN_HEIGHT = 0.5;
  static TOP_TAIL_NAME = 'topTail';
  static BOTTOM_TAIL_NAME = 'bottomTail';
  static TAILS_NAME = 'tails';

  static canAddTail(distance: TailDistance['distance']): boolean {
    return distance >= 2 * MultitailArrow.MIN_TAIL_DISTANCE;
  }

  static fromTwoPoints(topLeft: Vec2, bottomRight: Vec2) {
    const center = Vec2.centre(topLeft, bottomRight);
    const spineX = topLeft.x + (bottomRight.x - topLeft.x) / 3;
    const spineTop = new Vec2(spineX, topLeft.y);
    const headOffset = new Vec2(bottomRight.x, center.y).sub(spineTop);
    return new MultitailArrow(
      spineTop,
      bottomRight.y - topLeft.y,
      headOffset,
      spineX - topLeft.x,
      new Pool<number>(),
    );
  }

  static validateKetNode(ketFileData: KetFileMultitailArrowNode): boolean {
    const { head, spine, tails } = ketFileData;
    const [spineStart, spineEnd] = spine.pos;
    if (
      spineStart.x !== spineEnd.x ||
      spineStart.y < spineEnd.y - MultitailArrow.MIN_HEIGHT
    ) {
      return false;
    }
    const headPoint = head.position;
    if (
      headPoint.x < spineStart.x + MultitailArrow.MIN_HEAD_LENGTH ||
      headPoint.y - MultitailArrow.MIN_TOP_BOTTOM_OFFSET < spineEnd.y ||
      headPoint.y + MultitailArrow.MIN_TOP_BOTTOM_OFFSET > spineStart.y
    ) {
      return false;
    }
    const tailsPositions = [...tails.pos].sort((a, b) => b.y - a.y);

    if (
      tailsPositions.at(0)?.y !== spineStart.y ||
      tailsPositions.at(-1)?.y !== spineEnd.y
    ) {
      return false;
    }

    const firstTailX = tails.pos[0].x;
    if (firstTailX > spineStart.x - MultitailArrow.MIN_TAIL_LENGTH) {
      return false;
    }

    return tails.pos.every((tail, index, allTails) => {
      if (
        index > 0 &&
        allTails[index - 1].y < tail.y - MultitailArrow.MIN_TAIL_DISTANCE
      ) {
        return false;
      }

      return (
        tail.x === firstTailX && tail.y >= spineEnd.y && tail.y <= spineStart.y
      );
    });
  }

  static fromKetNode(ketFileNode: KetFileNode<KetFileMultitailArrowNode>) {
    const data = getNodeWithInvertedYCoord(
      ketFileNode.data,
    ) as KetFileMultitailArrowNode;
    const [spineStart, spineEnd] = data.spine.pos;
    const spineTop = new Vec2(spineStart);
    const headOffset = new Vec2(data.head.position).sub(spineStart);
    const tails = data.tails.pos.sort((a, b) => a.y - b.y);
    const tailsLength = spineTop.x - tails[0].x;
    const tailsYOffset = new Pool<number>();
    tails.slice(1, -1).forEach((tail) => {
      tailsYOffset.add(tail.y - spineTop.y);
    });

    const height = spineEnd.y - spineTop.y;

    return new MultitailArrow(
      spineTop,
      height,
      headOffset,
      tailsLength,
      tailsYOffset,
    );
  }

  constructor(
    private spineTop: Vec2,
    private height: number,
    private headOffset: Vec2,
    private tailLength: number,
    private tailsYOffset: Pool<number>,
  ) {
    super();
  }

  getReferencePositions(): MultitailArrowsReferencePositions {
    const tailX = this.spineTop.x - this.tailLength;
    const bottomY = this.spineTop.y + this.height;
    const tails = new Pool<Vec2>();
    this.tailsYOffset.forEach((tailYOffset, key) => {
      tails.set(key, new Vec2(tailX, this.spineTop.y + tailYOffset));
    });

    return {
      head: new Vec2(
        this.spineTop.x + this.headOffset.x,
        this.spineTop.y + this.headOffset.y,
      ),
      topTail: new Vec2(tailX, this.spineTop.y),
      bottomTail: new Vec2(tailX, bottomY),
      topSpine: new Vec2(this.spineTop),
      bottomSpine: new Vec2(this.spineTop.x, bottomY),
      tails,
    };
  }

  getReferencePositionsArray(): Array<Vec2> {
    const { tails, ...positions } = this.getReferencePositions();
    return Object.values(positions).concat(Array.from(tails.values()));
  }

  getReferenceLines(
    referencePositions: MultitailArrowsReferencePositions,
  ): MultitailArrowsReferenceLines {
    const spineX = referencePositions.topSpine.x;
    const headSpinePosition = new Vec2(spineX, referencePositions.head.y);
    const tails = new Pool<Line>();
    referencePositions.tails.forEach((tail, key) => {
      tails.set(key, [tail, new Vec2(spineX, tail.y)]);
    });

    return {
      topTail: [referencePositions.topTail, referencePositions.topSpine],
      bottomTail: [
        referencePositions.bottomTail,
        referencePositions.bottomSpine,
      ],
      spine: [referencePositions.topSpine, referencePositions.bottomSpine],
      head: [headSpinePosition, referencePositions.head],
      tails,
    };
  }

  getTailsDistance(tailsYOffsets: Array<number>): Array<TailDistance> {
    const allTailsOffsets = tailsYOffsets
      .concat([0, this.height])
      .sort((a, b) => a - b);
    return allTailsOffsets.reduce(
      (acc: Array<TailDistance>, item, index, array) => {
        if (index === 0) {
          return acc;
        }
        const distance = item - array[index - 1];
        return acc.concat({ distance, center: item - distance / 2 });
      },
      [],
    );
  }

  getTailsMaxDistance(): TailDistance {
    return this.getTailsDistance(Array.from(this.tailsYOffset.values())).reduce(
      (acc: TailDistance, item) => {
        return item.distance > acc.distance ? item : acc;
      },
      { distance: 0, center: 0 },
    );
  }

  addTail(id?: number): number {
    const { center, distance } = this.getTailsMaxDistance();
    if (!MultitailArrow.canAddTail(distance)) {
      throw new Error('Cannot add tail because no minimal distance found');
    }
    if (typeof id === 'number') {
      this.tailsYOffset.set(id, center);
      return id;
    } else {
      return this.tailsYOffset.add(center);
    }
  }

  removeTail(id: number) {
    this.tailsYOffset.delete(id);
  }

  center(): Vec2 {
    return Vec2.centre(
      new Vec2(this.spineTop.x - this.tailLength, this.spineTop.y),
      new Vec2(
        this.spineTop.x + this.headOffset.x,
        this.spineTop.y + this.height,
      ),
    );
  }

  clone(): MultitailArrow {
    return new MultitailArrow(
      new Vec2(this.spineTop),
      this.height,
      new Vec2(this.headOffset),
      this.tailLength,
      this.tailsYOffset.clone(),
    );
  }

  rescaleSize(scale: number) {
    this.spineTop = this.spineTop.scaled(scale);
    this.headOffset = this.headOffset.scaled(scale);
    this.height = this.height * scale;
    this.tailLength = this.tailLength * scale;
    this.tailsYOffset.forEach((item, index) => {
      this.tailsYOffset.set(index, item * scale);
    });
  }

  resizeHead(offset: number): number {
    const headOffsetX = Math.max(
      this.headOffset.x + offset,
      MultitailArrow.MIN_HEAD_LENGTH,
    );
    const realOffset = headOffsetX - this.headOffset.x;
    this.headOffset = new Vec2(headOffsetX, this.headOffset.y);
    return realOffset;
  }

  moveHead(offset: number): number {
    const headOffsetY = Math.min(
      Math.max(
        MultitailArrow.MIN_TOP_BOTTOM_OFFSET,
        this.headOffset.y + offset,
      ),
      this.height - MultitailArrow.MIN_TOP_BOTTOM_OFFSET,
    );
    const realOffset = headOffsetY - this.headOffset.y;
    this.headOffset = new Vec2(this.headOffset.x, headOffsetY);
    return realOffset;
  }

  resizeTails(offset: number): number {
    const updatedLength = Math.max(
      this.tailLength - offset,
      MultitailArrow.MIN_TAIL_LENGTH,
    );
    const realOffset = this.tailLength - updatedLength;
    this.tailLength = updatedLength;
    return realOffset;
  }

  normalizeTailPosition(
    proposedPosition: number,
    tailId: number,
  ): number | null {
    const tailsWithoutCurrent = Array.from(this.tailsYOffset.entries())
      .filter(([key]) => key !== tailId)
      .map(([_, value]) => value);
    const tailMinDistance = this.getTailsDistance(tailsWithoutCurrent)
      .filter((item) => MultitailArrow.canAddTail(item.distance))
      .sort(
        (a, b) =>
          Math.abs(a.center - proposedPosition) -
          Math.abs(b.center - proposedPosition),
      )
      .at(0);
    if (!tailMinDistance) {
      return null;
    }
    const maxDistanceFromCenter =
      tailMinDistance.distance / 2 - MultitailArrow.MIN_TAIL_DISTANCE;
    if (
      Math.abs(tailMinDistance.center - proposedPosition) >=
      tailMinDistance.distance / 2 - MultitailArrow.MIN_TAIL_DISTANCE
    ) {
      const distanceFromCenter =
        tailMinDistance.center > proposedPosition
          ? -maxDistanceFromCenter
          : maxDistanceFromCenter;
      return tailMinDistance.center + distanceFromCenter;
    }
    return proposedPosition;
  }

  moveTail(offset: number, id: number, normalize?: true): number;
  moveTail(
    offset: number,
    name:
      | typeof MultitailArrow.TOP_TAIL_NAME
      | typeof MultitailArrow.BOTTOM_TAIL_NAME,
  ): number;

  moveTail(offset: number, second: number | string, normalize?: true): number {
    const minHeight = Math.max(
      MultitailArrow.MIN_TAIL_DISTANCE * (this.tailsYOffset.size + 1),
      MultitailArrow.MIN_HEIGHT,
    );
    const tailsOffset = Array.from(this.tailsYOffset.values()).sort(
      (a, b) => a - b,
    );
    const lastTail = tailsOffset.at(-1) || 0;
    const firstTail = tailsOffset.at(0) || Infinity;
    const closestTopLimit = Math.min(
      firstTail - MultitailArrow.MIN_TAIL_DISTANCE,
      this.headOffset.y - MultitailArrow.MIN_TOP_BOTTOM_OFFSET,
    );
    const closestBottomLimit = Math.max(
      lastTail + MultitailArrow.MIN_TAIL_DISTANCE,
      this.headOffset.y + MultitailArrow.MIN_TOP_BOTTOM_OFFSET,
    );

    if (typeof second === 'number') {
      const originalValue = this.tailsYOffset.get(second) as number;
      let updatedHeight = Math.max(
        MultitailArrow.MIN_TAIL_DISTANCE,
        Math.min(
          originalValue + offset,
          this.height - MultitailArrow.MIN_TAIL_DISTANCE,
        ),
      );
      if (normalize) {
        const result = this.normalizeTailPosition(updatedHeight, second);
        if (result === null) {
          return 0;
        }
        updatedHeight = result;
      }

      const realOffset = updatedHeight - originalValue;
      this.tailsYOffset.set(second, updatedHeight);
      return realOffset;
    } else if (second === MultitailArrow.BOTTOM_TAIL_NAME) {
      const updatedHeight = Math.max(
        minHeight,
        this.height + offset,
        closestBottomLimit,
      );
      const realOffset = updatedHeight - this.height;
      this.height = updatedHeight;
      return realOffset;
    } else {
      const realOffset = Math.min(
        offset,
        closestTopLimit,
        this.height - minHeight,
      );
      if (realOffset !== 0) {
        const vectorOffset = new Vec2(0, realOffset);
        this.spineTop = this.spineTop.add(vectorOffset);
        this.headOffset = this.headOffset.sub(vectorOffset);
        this.height -= realOffset;
        const updatedTails = this.tailsYOffset.clone();
        updatedTails.forEach((item, key) => {
          updatedTails.set(key, item - realOffset);
        });
        this.tailsYOffset = updatedTails;
      }
      return realOffset;
    }
  }

  move(offset: Vec2): void {
    this.spineTop = this.spineTop.add(offset);
  }

  toKetNode(): KetFileNode<KetFileMultitailArrowNode> {
    const head = this.spineTop.add(this.headOffset);
    const bottomY = this.spineTop.y + this.height;
    const spine: [Vec2, Vec2] = [
      this.spineTop,
      new Vec2(this.spineTop.x, bottomY),
    ];
    const tailX = this.spineTop.x - this.tailLength;
    const nonBorderTails = Array.from(this.tailsYOffset.values()).map(
      (yOffset) => this.spineTop.y + yOffset,
    );
    const convertTail = (y: number) => new Vec2(tailX, y);
    const tails = [this.spineTop.y]
      .concat(nonBorderTails)
      .concat(bottomY)
      .map(convertTail);

    return {
      type: MULTITAIL_ARROW_SERIALIZE_KEY,
      center: this.center(),
      selected: this.getInitiallySelected(),
      data: getNodeWithInvertedYCoord({
        head: {
          position: head,
        },
        spine: {
          pos: spine,
        },
        tails: {
          pos: tails,
        },
        zOrder: 0,
      }),
    };
  }
}
