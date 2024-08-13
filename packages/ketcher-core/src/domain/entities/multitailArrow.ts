import { BaseMicromoleculeEntity } from 'domain/entities/BaseMicromoleculeEntity';
import { Vec2 } from 'domain/entities/vec2';
import { Pool } from 'domain/entities/pool';
import { getNodeWithInvertedYCoord, KetFileNode } from 'domain/serializers';
import { MULTITAIL_ARROW_SERIALIZE_KEY } from 'domain/constants';

export type Line = [Vec2, Vec2];

export interface MultitailArrowsReferencePositions {
  headPosition: Vec2;
  topTailPosition: Vec2;
  bottomTailPosition: Vec2;
  topSpinePosition: Vec2;
  bottomSpinePosition: Vec2;
  tails: Pool<Vec2>;
}

export interface MultitailArrowsReferenceLines {
  topTail: Line;
  bottomTail: Line;
  spine: Line;
  head: Line;
  tails: Pool<Line>;
}

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
  static MIN_TAIL_DISTANCE = 0.7;

  static canAddTail(distance: TailDistance['distance']): boolean {
    return distance >= MultitailArrow.MIN_TAIL_DISTANCE;
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
      headPosition: new Vec2(
        this.spineTop.x + this.headOffset.x,
        this.spineTop.y + this.headOffset.y,
      ),
      topTailPosition: new Vec2(tailX, this.spineTop.y),
      bottomTailPosition: new Vec2(tailX, bottomY),
      topSpinePosition: new Vec2(this.spineTop),
      bottomSpinePosition: new Vec2(this.spineTop.x, bottomY),
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
    const spineX = referencePositions.topSpinePosition.x;
    const headSpinePosition = new Vec2(
      spineX,
      referencePositions.headPosition.y,
    );
    const tails = new Pool<Line>();
    referencePositions.tails.forEach((tail, key) => {
      tails.set(key, [tail, new Vec2(spineX, tail.y)]);
    });

    return {
      topTail: [
        referencePositions.topTailPosition,
        referencePositions.topSpinePosition,
      ],
      bottomTail: [
        referencePositions.bottomTailPosition,
        referencePositions.bottomSpinePosition,
      ],
      spine: [
        referencePositions.topSpinePosition,
        referencePositions.bottomSpinePosition,
      ],
      head: [headSpinePosition, referencePositions.headPosition],
      tails,
    };
  }

  getTailsMaxDistance(): TailDistance {
    const allTailsOffsets = Array.from(this.tailsYOffset.values())
      .concat([0, this.height])
      .sort((a, b) => a - b);
    return allTailsOffsets.reduce(
      (acc: TailDistance, item, index, array): TailDistance => {
        if (index === 0) {
          return acc;
        }
        const distance = item - array[index - 1];
        return distance > acc.distance
          ? { distance, center: item - distance / 2 }
          : acc;
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
