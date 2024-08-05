import { BaseMicromoleculeEntity } from 'domain/entities/BaseMicromoleculeEntity';
import { Vec2 } from 'domain/entities/vec2';
import { Pool } from 'domain/entities/pool';

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

export class MultitailArrow extends BaseMicromoleculeEntity {
  static fromTwoPoints(topLeft: Vec2, bottomRight: Vec2) {
    const center = Vec2.centre(topLeft, bottomRight);
    const spineTop = new Vec2(center.x, topLeft.y);
    const headOffset = new Vec2(bottomRight.x, center.y).sub(spineTop);
    return new MultitailArrow(
      spineTop,
      bottomRight.y - topLeft.y,
      headOffset,
      center.x - topLeft.x,
      new Pool<number>(),
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
    const spineX = referencePositions.topTailPosition.x;
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
        referencePositions.topTailPosition,
      ],
      bottomTail: [
        referencePositions.bottomTailPosition,
        referencePositions.bottomTailPosition,
      ],
      spine: [
        referencePositions.topSpinePosition,
        referencePositions.bottomSpinePosition,
      ],
      head: [headSpinePosition, referencePositions.headPosition],
      tails,
    };
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
      new Pool<number>(this.tailsYOffset),
    );
  }

  move(offset: Vec2): void {
    this.spineTop = this.spineTop.add(offset);
  }
}
