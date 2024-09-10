import { BaseMicromoleculeEntity } from 'domain/entities/BaseMicromoleculeEntity';
import { Vec2 } from 'domain/entities/vec2';
import { Pool } from 'domain/entities/pool';
import { getNodeWithInvertedYCoord, KetFileNode } from 'domain/serializers';
import { MULTITAIL_ARROW_SERIALIZE_KEY } from 'domain/constants';
import { FixedPrecisionCoordinates } from 'domain/entities/fixedPrecision';

export type Line = [Vec2, Vec2];

export interface MultitailArrowsReferencePositions {
  head: Vec2;
  topTail: Vec2;
  bottomTail: Vec2;
  topSpine: Vec2;
  bottomSpine: Vec2;
  tails: Pool<Vec2>;
}

enum MultitailValidationErrors {
  INCORRECT_SPINE = 'INCORRECT_SPINE',
  INCORRECT_HEAD = 'INCORRECT_HEAD',
  INCORRECT_TAILS = 'INCORRECT_TAILS',
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
  static MIN_TAIL_DISTANCE =
    FixedPrecisionCoordinates.fromFloatingPrecision(0.35);

  static MIN_HEAD_LENGTH = FixedPrecisionCoordinates.fromFloatingPrecision(0.5);
  static MIN_TAIL_LENGTH = FixedPrecisionCoordinates.fromFloatingPrecision(0.4);
  static MIN_TOP_BOTTOM_OFFSET =
    FixedPrecisionCoordinates.fromFloatingPrecision(0.15);

  static MIN_HEIGHT = FixedPrecisionCoordinates.fromFloatingPrecision(0.5);
  static TOP_TAIL_NAME = 'topTail';
  static BOTTOM_TAIL_NAME = 'bottomTail';
  static TAILS_NAME = 'tails';

  static canAddTail(distance: TailDistance['distance']): boolean {
    return (
      distance >=
      MultitailArrow.MIN_TAIL_DISTANCE.multiply(2).getFloatingPrecision()
    );
  }

  static fromTwoPoints(topLeft: Vec2, bottomRight: Vec2) {
    const center = Vec2.centre(topLeft, bottomRight);
    const tailLength = FixedPrecisionCoordinates.fromFloatingPrecision(
      Math.max(
        (bottomRight.x - topLeft.x) / 3,
        MultitailArrow.MIN_TAIL_LENGTH.getFloatingPrecision(),
      ),
    );
    const topSpineX = FixedPrecisionCoordinates.fromFloatingPrecision(
      topLeft.x,
    ).add(tailLength);
    const topSpineY = FixedPrecisionCoordinates.fromFloatingPrecision(
      topLeft.y,
    );
    const height = FixedPrecisionCoordinates.fromFloatingPrecision(
      Math.max(
        bottomRight.y - topLeft.y,
        MultitailArrow.MIN_HEIGHT.getFloatingPrecision(),
      ),
    );
    const headOffsetX = FixedPrecisionCoordinates.fromFloatingPrecision(
      bottomRight.x,
    ).sub(topSpineX);
    const headOffsetY = FixedPrecisionCoordinates.fromFloatingPrecision(
      center.y,
    ).sub(topSpineY);

    return new MultitailArrow(
      topSpineX,
      topSpineY,
      height,
      headOffsetX,
      headOffsetY,
      tailLength,
      new Pool<FixedPrecisionCoordinates>(),
    );
  }

  static validateKetNode(
    ketFileData: KetFileMultitailArrowNode,
  ): string | null {
    const { head, spine, tails } = ketFileData;
    const [spineStart, spineEnd] = spine.pos;
    const spineStartX = FixedPrecisionCoordinates.fromFloatingPrecision(
      spineStart.x,
    );
    const spineStartY = FixedPrecisionCoordinates.fromFloatingPrecision(
      spineStart.y,
    );
    const spineEndX = FixedPrecisionCoordinates.fromFloatingPrecision(
      spineEnd.x,
    );
    const spineEndY = FixedPrecisionCoordinates.fromFloatingPrecision(
      spineEnd.y,
    );
    const headX = FixedPrecisionCoordinates.fromFloatingPrecision(
      head.position.x,
    );
    const headY = FixedPrecisionCoordinates.fromFloatingPrecision(
      head.position.y,
    );
    const tailsFixedPrecision = tails.pos
      .map((tail) => ({
        x: FixedPrecisionCoordinates.fromFloatingPrecision(tail.x),
        y: FixedPrecisionCoordinates.fromFloatingPrecision(tail.y),
      }))
      .sort((a, b) => b.y.value - a.y.value);

    if (
      spineStartX.value !== spineEndX.value ||
      spineStartY.value < spineEndY.sub(MultitailArrow.MIN_HEIGHT).value
    ) {
      return MultitailValidationErrors.INCORRECT_SPINE;
    }
    if (
      headX.value < spineStartX.add(MultitailArrow.MIN_HEAD_LENGTH).value ||
      headY.sub(MultitailArrow.MIN_TOP_BOTTOM_OFFSET).value < spineEndY.value ||
      headY.add(MultitailArrow.MIN_TOP_BOTTOM_OFFSET).value > spineStartY.value
    ) {
      return MultitailValidationErrors.INCORRECT_HEAD;
    }
    if (
      tailsFixedPrecision.at(0)?.y.value !== spineStartY.value ||
      tailsFixedPrecision.at(-1)?.y.value !== spineEndY.value
    ) {
      return MultitailValidationErrors.INCORRECT_TAILS;
    }

    const firstTailX = tailsFixedPrecision[0].x;
    if (
      firstTailX.value > spineStartX.sub(MultitailArrow.MIN_TAIL_LENGTH).value
    ) {
      return MultitailValidationErrors.INCORRECT_TAILS;
    }

    const result = tailsFixedPrecision.every((tail, index, allTails) => {
      if (
        index > 0 &&
        allTails[index - 1].y.value <
          tail.y.add(MultitailArrow.MIN_TAIL_DISTANCE).value
      ) {
        return false;
      }

      return (
        tail.x.value === firstTailX.value &&
        tail.y.value >= spineEndY.value &&
        tail.y.value <= spineStartY.value
      );
    });

    return !result ? MultitailValidationErrors.INCORRECT_TAILS : null;
  }

  static fromKetNode(ketFileNode: KetFileNode<KetFileMultitailArrowNode>) {
    const data = getNodeWithInvertedYCoord(
      ketFileNode.data,
    ) as KetFileMultitailArrowNode;
    const [spineStart, spineEnd] = data.spine.pos;
    const head = data.head.position;
    const spineTopX = FixedPrecisionCoordinates.fromFloatingPrecision(
      spineStart.x,
    );
    const spineTopY = FixedPrecisionCoordinates.fromFloatingPrecision(
      spineStart.y,
    );
    const height = FixedPrecisionCoordinates.fromFloatingPrecision(
      spineEnd.y,
    ).sub(spineTopY);
    const headOffsetX = FixedPrecisionCoordinates.fromFloatingPrecision(
      head.x,
    ).sub(spineTopX);
    const headOffsetY = FixedPrecisionCoordinates.fromFloatingPrecision(
      head.y,
    ).sub(spineTopY);

    const tailsYOffset = new Pool<FixedPrecisionCoordinates>();
    const tails = data.tails.pos.sort((a, b) => a.y - b.y);
    const tailsLength = spineTopX.sub(
      FixedPrecisionCoordinates.fromFloatingPrecision(tails[0].x),
    );
    tails.slice(1, -1).forEach((tail) => {
      tailsYOffset.add(
        FixedPrecisionCoordinates.fromFloatingPrecision(tail.y).sub(spineTopY),
      );
    });

    return new MultitailArrow(
      spineTopX,
      spineTopY,
      height,
      headOffsetX,
      headOffsetY,
      tailsLength,
      tailsYOffset,
    );
  }

  static fromFloatingPointCoordinates(
    spineTop: Vec2,
    height: number,
    headOffset: Vec2,
    tailLength: number,
    tailsYOffset: Pool<number>,
  ) {
    const tailsYOffsetFixedPrecision = tailsYOffset.clone();
    tailsYOffsetFixedPrecision.forEach((item, key, map) => {
      const pool = map as unknown as Pool<FixedPrecisionCoordinates>;
      pool.set(key, FixedPrecisionCoordinates.fromFloatingPrecision(item));
    });
    return new MultitailArrow(
      FixedPrecisionCoordinates.fromFloatingPrecision(spineTop.x),
      FixedPrecisionCoordinates.fromFloatingPrecision(spineTop.y),
      FixedPrecisionCoordinates.fromFloatingPrecision(height),
      FixedPrecisionCoordinates.fromFloatingPrecision(headOffset.x),
      FixedPrecisionCoordinates.fromFloatingPrecision(headOffset.y),
      FixedPrecisionCoordinates.fromFloatingPrecision(tailLength),
      tailsYOffsetFixedPrecision as unknown as Pool<FixedPrecisionCoordinates>,
    );
  }

  constructor(
    private spineTopX: FixedPrecisionCoordinates,
    private spineTopY: FixedPrecisionCoordinates,
    private height: FixedPrecisionCoordinates,
    private headOffsetX: FixedPrecisionCoordinates,
    private headOffsetY: FixedPrecisionCoordinates,
    private tailLength: FixedPrecisionCoordinates,
    private tailsYOffset: Pool<FixedPrecisionCoordinates>,
  ) {
    super();
  }

  getReferencePositions(): MultitailArrowsReferencePositions {
    const tailX = this.spineTopX.sub(this.tailLength);
    const bottomY = this.spineTopY.add(this.height);
    const tails = new Pool<Vec2>();
    this.tailsYOffset.forEach((tailYOffset, key) => {
      tails.set(
        key,
        new Vec2(
          tailX.getFloatingPrecision(),
          this.spineTopY.add(tailYOffset).getFloatingPrecision(),
        ),
      );
    });

    return {
      head: new Vec2(
        this.spineTopX.add(this.headOffsetX).getFloatingPrecision(),
        this.spineTopY.add(this.headOffsetY).getFloatingPrecision(),
      ),
      topTail: new Vec2(
        tailX.getFloatingPrecision(),
        this.spineTopY.getFloatingPrecision(),
      ),
      bottomTail: new Vec2(
        tailX.getFloatingPrecision(),
        bottomY.getFloatingPrecision(),
      ),
      topSpine: new Vec2(
        this.spineTopX.getFloatingPrecision(),
        this.spineTopY.getFloatingPrecision(),
      ),
      bottomSpine: new Vec2(
        this.spineTopX.getFloatingPrecision(),
        bottomY.getFloatingPrecision(),
      ),
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

  getTailsDistance(
    tailsYOffsets: Array<FixedPrecisionCoordinates>,
  ): Array<TailDistance> {
    const allTailsOffsets = tailsYOffsets
      .concat([new FixedPrecisionCoordinates(0), this.height])
      .sort((a, b) => a.sub(b).getFloatingPrecision());
    return allTailsOffsets.reduce(
      (acc: Array<TailDistance>, item, index, array) => {
        if (index === 0) {
          return acc;
        }
        const distance = item.sub(array[index - 1]);
        const centerFloatingPoint = item.sub(distance.divide(2));
        return acc.concat({
          distance: distance.getFloatingPrecision(),
          center: centerFloatingPoint.getFloatingPrecision(),
        });
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
    const centerFixedPrecision =
      FixedPrecisionCoordinates.fromFloatingPrecision(center);
    if (typeof id === 'number') {
      this.tailsYOffset.set(id, centerFixedPrecision);
      return id;
    } else {
      return this.tailsYOffset.add(centerFixedPrecision);
    }
  }

  removeTail(id: number) {
    this.tailsYOffset.delete(id);
  }

  center(): Vec2 {
    return Vec2.centre(
      new Vec2(
        this.spineTopX.sub(this.tailLength).getFloatingPrecision(),
        this.spineTopY.getFloatingPrecision(),
      ),
      new Vec2(
        this.spineTopX.add(this.headOffsetX).getFloatingPrecision(),
        this.spineTopY.add(this.height).getFloatingPrecision(),
      ),
    );
  }

  clone(): MultitailArrow {
    return new MultitailArrow(
      this.spineTopX,
      this.spineTopY,
      this.height,
      this.headOffsetX,
      this.headOffsetY,
      this.tailLength,
      this.tailsYOffset,
    );
  }

  rescaleSize(scale: number) {
    this.spineTopX = this.spineTopX.multiply(scale);
    this.spineTopY = this.spineTopY.multiply(scale);
    this.headOffsetX = this.headOffsetX.multiply(scale);
    this.headOffsetY = this.headOffsetY.multiply(scale);
    this.height = this.height.multiply(scale);
    this.tailLength = this.tailLength.multiply(scale);
    this.tailsYOffset.forEach((item, index) => {
      this.tailsYOffset.set(index, item.multiply(scale));
    });
  }

  resizeHead(offset: number): number {
    const fixedPrecisionOffset =
      FixedPrecisionCoordinates.fromFloatingPrecision(offset);
    const headOffsetX = new FixedPrecisionCoordinates(
      Math.max(
        this.headOffsetX.add(fixedPrecisionOffset).value,
        MultitailArrow.MIN_HEAD_LENGTH.value,
      ),
    );
    const realOffset = headOffsetX.sub(this.headOffsetX);
    this.headOffsetX = headOffsetX;
    return realOffset.getFloatingPrecision();
  }

  moveHead(offset: number): number {
    const fixedPrecisionOffset =
      FixedPrecisionCoordinates.fromFloatingPrecision(offset);
    const headOffsetY = new FixedPrecisionCoordinates(
      Math.min(
        Math.max(
          MultitailArrow.MIN_TOP_BOTTOM_OFFSET.value,
          this.headOffsetY.add(fixedPrecisionOffset).value,
        ),
        this.height.sub(MultitailArrow.MIN_TOP_BOTTOM_OFFSET).value,
      ),
    );
    const realOffset = headOffsetY.sub(this.headOffsetY);
    this.headOffsetY = headOffsetY;
    return realOffset.getFloatingPrecision();
  }

  resizeTails(offset: number): number {
    const fixedPrecisionOffset =
      FixedPrecisionCoordinates.fromFloatingPrecision(offset);
    const updatedLength = new FixedPrecisionCoordinates(
      Math.max(
        this.tailLength.sub(fixedPrecisionOffset).value,
        MultitailArrow.MIN_TAIL_LENGTH.value,
      ),
    );
    const realOffset = this.tailLength.sub(updatedLength);
    this.tailLength = updatedLength;
    return realOffset.getFloatingPrecision();
  }

  normalizeTailPosition(
    proposedPosition: FixedPrecisionCoordinates,
    tailId: number,
  ): FixedPrecisionCoordinates {
    const proposedPositionFloatingPrecision =
      proposedPosition.getFloatingPrecision();
    const tailsWithoutCurrent = Array.from(this.tailsYOffset.entries())
      .filter(([key]) => key !== tailId)
      .map(([_, value]) => value);
    const tailMinDistance = this.getTailsDistance(tailsWithoutCurrent)
      .filter((item) => MultitailArrow.canAddTail(item.distance))
      .sort(
        (a, b) =>
          Math.abs(a.center - proposedPositionFloatingPrecision) -
          Math.abs(b.center - proposedPositionFloatingPrecision),
      )
      .at(0) as TailDistance;
    const positionCenter = FixedPrecisionCoordinates.fromFloatingPrecision(
      tailMinDistance.center,
    );
    const positionDistance = FixedPrecisionCoordinates.fromFloatingPrecision(
      tailMinDistance.distance,
    );
    const maxDistanceFromCenter = positionDistance
      .divide(2)
      .sub(MultitailArrow.MIN_TAIL_DISTANCE);
    if (
      Math.abs(positionCenter.sub(proposedPosition).value) >=
      maxDistanceFromCenter.value
    ) {
      const distanceFromCenter =
        positionCenter.value > proposedPosition.value
          ? maxDistanceFromCenter.multiply(-1)
          : maxDistanceFromCenter;
      return positionCenter.add(distanceFromCenter);
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
    const offsetFixedPrecision =
      FixedPrecisionCoordinates.fromFloatingPrecision(offset);
    const minHeight = new FixedPrecisionCoordinates(
      Math.max(
        MultitailArrow.MIN_TAIL_DISTANCE.multiply(this.tailsYOffset.size + 1)
          .value,
        MultitailArrow.MIN_HEIGHT.value,
      ),
    );
    const tailsOffset = Array.from(this.tailsYOffset.values()).sort(
      (a, b) => a.value - b.value,
    );
    const lastTail = tailsOffset.at(-1) || new FixedPrecisionCoordinates(0);
    const firstTail =
      tailsOffset.at(0) || new FixedPrecisionCoordinates(Infinity);
    const closestTopLimit = new FixedPrecisionCoordinates(
      Math.min(
        firstTail.sub(MultitailArrow.MIN_TAIL_DISTANCE).value,
        this.headOffsetY.sub(MultitailArrow.MIN_TOP_BOTTOM_OFFSET).value,
      ),
    );
    const closestBottomLimit = new FixedPrecisionCoordinates(
      Math.max(
        lastTail.add(MultitailArrow.MIN_TAIL_DISTANCE).value,
        this.headOffsetY.add(MultitailArrow.MIN_TOP_BOTTOM_OFFSET).value,
      ),
    );

    if (typeof second === 'number') {
      const originalValue = this.tailsYOffset.get(
        second,
      ) as FixedPrecisionCoordinates;
      let updatedHeight = new FixedPrecisionCoordinates(
        Math.max(
          MultitailArrow.MIN_TAIL_DISTANCE.value,
          Math.min(
            originalValue.add(offsetFixedPrecision).value,
            this.height.sub(MultitailArrow.MIN_TAIL_DISTANCE).value,
          ),
        ),
      );
      if (normalize) {
        updatedHeight = this.normalizeTailPosition(updatedHeight, second);
      }

      const realOffset = updatedHeight.sub(originalValue);
      this.tailsYOffset.set(second, updatedHeight);
      return realOffset.getFloatingPrecision();
    } else if (second === MultitailArrow.BOTTOM_TAIL_NAME) {
      const updatedHeight = new FixedPrecisionCoordinates(
        Math.max(
          minHeight.value,
          this.height.add(offsetFixedPrecision).value,
          closestBottomLimit.value,
        ),
      );
      const realOffset = updatedHeight.sub(this.height);
      this.height = updatedHeight;
      return realOffset.getFloatingPrecision();
    } else {
      const realOffset = new FixedPrecisionCoordinates(
        Math.min(
          offsetFixedPrecision.value,
          closestTopLimit.value,
          this.height.sub(minHeight).value,
        ),
      );
      if (realOffset.value !== 0) {
        this.spineTopY = this.spineTopY.add(realOffset);
        this.headOffsetY = this.headOffsetY.sub(realOffset);
        this.height = this.height.sub(realOffset);
        const updatedTails = this.tailsYOffset.clone();
        updatedTails.forEach((item, key) => {
          updatedTails.set(key, item.sub(realOffset));
        });
        this.tailsYOffset = updatedTails;
      }
      return realOffset.getFloatingPrecision();
    }
  }

  move(offset: Vec2): void {
    this.spineTopX = this.spineTopX.add(
      FixedPrecisionCoordinates.fromFloatingPrecision(offset.x),
    );
    this.spineTopY = this.spineTopY.add(
      FixedPrecisionCoordinates.fromFloatingPrecision(offset.y),
    );
  }

  toKetNode(): KetFileNode<KetFileMultitailArrowNode> {
    const head = new Vec2(
      this.spineTopX.add(this.headOffsetX).getFloatingPrecision(),
      this.spineTopY.add(this.headOffsetY).getFloatingPrecision(),
    );
    const bottomY = this.spineTopY.add(this.height);
    const spine: [Vec2, Vec2] = [
      new Vec2(
        this.spineTopX.getFloatingPrecision(),
        this.spineTopY.getFloatingPrecision(),
      ),
      new Vec2(
        this.spineTopX.getFloatingPrecision(),
        bottomY.getFloatingPrecision(),
      ),
    ];
    const tailX = this.spineTopX.sub(this.tailLength);
    const nonBorderTails = Array.from(this.tailsYOffset.values()).map(
      (yOffset) => this.spineTopY.add(yOffset),
    );
    const convertTail = (y: FixedPrecisionCoordinates) =>
      new Vec2(tailX.getFloatingPrecision(), y.getFloatingPrecision());
    const tails = [this.spineTopY]
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
