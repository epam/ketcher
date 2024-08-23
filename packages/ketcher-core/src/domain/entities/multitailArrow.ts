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

  static canAddTail(distance: TailDistance['distance']): boolean {
    return distance >= 2 * MultitailArrow.MIN_TAIL_DISTANCE;
  }

  static fromTwoPoints(topLeft: Vec2, bottomRight: Vec2) {
    const center = Vec2.centre(topLeft, bottomRight);
    const spineX = topLeft.x + (bottomRight.x - topLeft.x) * 0.33;
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
    if (id) {
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

  moveTail(offset: number, id: number, normalize?: true): number;
  moveTail(offset: number, name: 'topTail' | 'bottomTail'): number;

  moveTail(offset: number, second: number | string, normalize?: true): number {
    const minHeight =
      MultitailArrow.MIN_TAIL_DISTANCE * (this.tailsYOffset.size + 1);
    const tailsOffset = Array.from(this.tailsYOffset.values()).sort(
      (a, b) => a - b,
    );
    const lastTail = tailsOffset.at(-1) || 0;
    const firstTail = tailsOffset.at(0) || Infinity;
    const closestTopElement = Math.min(firstTail, this.headOffset.y);
    const closestBottomElement = Math.max(lastTail, this.headOffset.y);

    if (typeof second === 'number') {
      const originalValue = this.tailsYOffset.get(second) as number;
      let updatedHeight = Math.max(
        MultitailArrow.MIN_TOP_BOTTOM_OFFSET,
        Math.min(
          originalValue + offset,
          this.height - MultitailArrow.MIN_TOP_BOTTOM_OFFSET,
        ),
      );
      if (normalize) {
        const tailsWithoutCurrent = Array.from(this.tailsYOffset.entries())
          .filter(([key]) => key !== second)
          .map(([_, value]) => value);
        const tailMinDistance = this.getTailsDistance(tailsWithoutCurrent)
          .filter((item) => MultitailArrow.canAddTail(item.distance))
          .sort(
            (a, b) =>
              Math.abs(a.center - updatedHeight) -
              Math.abs(b.center - updatedHeight),
          )
          .at(0) as TailDistance;
        if (
          Math.abs(tailMinDistance.center - updatedHeight) >
          tailMinDistance.distance / 2 - MultitailArrow.MIN_TAIL_DISTANCE
        ) {
          updatedHeight = tailMinDistance.center;
        }
      }

      const realOffset = updatedHeight - originalValue;
      this.tailsYOffset.set(second, updatedHeight);
      return realOffset;
    } else if (second === 'bottomTail') {
      const updatedHeight = Math.max(
        minHeight,
        this.height + offset,
        closestBottomElement + MultitailArrow.MIN_TAIL_DISTANCE,
      );
      const realOffset = updatedHeight - this.height;
      this.height = updatedHeight;
      return realOffset;
    } else {
      const realOffset = Math.min(
        offset,
        closestTopElement - MultitailArrow.MIN_TAIL_DISTANCE,
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
