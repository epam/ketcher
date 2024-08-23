import ReObject from './reobject';
import { Line, MultitailArrow } from 'domain/entities/multitailArrow';
import { MULTITAIL_ARROW_KEY } from 'domain/constants/multitailArrow';
import { ReStruct } from 'application/render';
import { RenderOptions } from 'application/render/render.types';
import { PathBuilder } from 'application/render/pathBuilder';
import { Scale } from 'domain/helpers';
import { Box2Abs, Pool, Vec2 } from 'domain/entities';
import util from 'application/render/util';

export enum MultitailArrowRefName {
  HEAD = 'head',
  TAILS = 'tails',
  TOP_TAIL = 'topTail',
  BOTTOM_TAIL = 'bottomTail',
  SPINE = 'spine',
}

export interface MultitailArrowReferencePosition {
  name: MultitailArrowRefName;
  offset: Vec2;
  isLine: boolean;
  tailId: number | null;
}

export interface MultitailArrowClosestReferencePosition {
  distance: number;
  ref: MultitailArrowReferencePosition | null;
}

export class ReMultitailArrow extends ReObject {
  static TAILS_NAME = 'tails';

  static isSelectable(): boolean {
    return true;
  }

  static getTailIdFromRefName(name: string): number | null {
    if (name.startsWith(MultitailArrowRefName.TAILS)) {
      return parseInt(name.replace(`${MultitailArrowRefName.TAILS}-`, ''));
    }
    return null;
  }

  constructor(public multitailArrow: MultitailArrow) {
    super(MULTITAIL_ARROW_KEY);
  }

  getReferencePositions(
    renderOptions: RenderOptions,
  ): ReturnType<MultitailArrow['getReferencePositions']> {
    const positions = this.multitailArrow.getReferencePositions();
    const tails = new Pool<Vec2>();
    positions.tails.forEach((item, key) => {
      tails.set(key, Scale.modelToCanvas(item, renderOptions));
    });

    return {
      head: Scale.modelToCanvas(positions.head, renderOptions),
      topTail: Scale.modelToCanvas(positions.topTail, renderOptions),
      bottomTail: Scale.modelToCanvas(positions.bottomTail, renderOptions),
      topSpine: Scale.modelToCanvas(positions.topSpine, renderOptions),
      bottomSpine: Scale.modelToCanvas(positions.bottomSpine, renderOptions),
      tails,
    };
  }

  getReferenceLines(
    renderOptions: RenderOptions,
    referencePositions = this.getReferencePositions(renderOptions),
  ) {
    return this.multitailArrow.getReferenceLines(referencePositions);
  }

  // Will be implemented in the next task
  drawHover() {}

  makeSelectionPlate() {}

  show(reStruct: ReStruct, renderOptions: RenderOptions) {
    reStruct.clearVisel(this.visel);
    const pathBuilder = new PathBuilder();
    const headPathBuilder = new PathBuilder();
    const { topTail, topSpine, bottomSpine, head, tails } =
      this.getReferencePositions(renderOptions);
    const topTailOffsetX = topSpine.sub(topTail).x;
    const arrowStart = new Vec2(topSpine.x, head.y);
    const arrowLength = head.x - arrowStart.x;

    pathBuilder.addMultitailArrowBase(
      topSpine.y,
      bottomSpine.y,
      topSpine.x,
      topTailOffsetX,
    );
    headPathBuilder.addFilledTriangleArrowPathParts(arrowStart, arrowLength);
    tails.forEach((tail) => {
      pathBuilder.addLine(tail, { x: topSpine.x, y: tail.y });
    });

    const path = reStruct.render.paper.path(pathBuilder.build());
    const header = reStruct.render.paper.path(headPathBuilder.build());
    path.attr(renderOptions.multitailArrow);
    header.attr({
      ...renderOptions.multitailArrow,
      fill: '#000',
    });
    this.visel.add(path, Box2Abs.fromRelBox(util.relBox(path.getBBox())));
    this.visel.add(header, Box2Abs.fromRelBox(util.relBox(header.getBBox())));
  }

  private calculateDistanceToNamedEntity(
    point: Vec2,
    entities: Array<[string, Vec2]>,
    isLine: false,
  ): MultitailArrowClosestReferencePosition;

  private calculateDistanceToNamedEntity(
    point: Vec2,
    entities: Array<[string, Line]>,
    isLine: true,
  ): MultitailArrowClosestReferencePosition;

  private calculateDistanceToNamedEntity(
    point: Vec2,
    entities: Array<[string, Vec2 | Line]>,
    isLine: boolean,
  ): MultitailArrowClosestReferencePosition {
    return entities.reduce(
      (acc, [name, value]) => {
        const distance = isLine
          ? point.calculateDistanceToLine(value as Line)
          : Vec2.dist(point, value as Vec2);
        const tailId = ReMultitailArrow.getTailIdFromRefName(name);
        let refName: MultitailArrowRefName;
        if (typeof tailId === 'number') {
          refName = MultitailArrowRefName.TAILS;
        } else if (
          [
            MultitailArrowRefName.HEAD,
            MultitailArrowRefName.BOTTOM_TAIL,
            MultitailArrowRefName.TOP_TAIL,
          ].includes(name as MultitailArrowRefName)
        ) {
          refName = name as MultitailArrowRefName;
        } else {
          refName = MultitailArrowRefName.SPINE;
        }

        return distance < acc.distance
          ? {
              distance,
              ref: {
                name: refName,
                offset: new Vec2(0, 0),
                isLine,
                tailId,
              },
            }
          : acc;
      },
      {
        distance: Infinity,
        ref: null,
      } as MultitailArrowClosestReferencePosition,
    );
  }

  private tailArrayFromPool<T>(tails: Pool<T>): Array<[string, T]> {
    return Array.from(tails.entries()).map(([key, value]) => [
      `${ReMultitailArrow.TAILS_NAME}-${key}`,
      value,
    ]);
  }

  calculateDistanceToPoint(
    point: Vec2,
    renderOptions: RenderOptions,
    maxDistanceToPoint: number,
  ): MultitailArrowClosestReferencePosition {
    const referencePositions = this.getReferencePositions(renderOptions);
    const referenceLines = this.getReferenceLines(
      renderOptions,
      referencePositions,
    );
    const { tails, ...rest } = referenceLines;
    const lines: Array<[string, Line]> = Object.entries(rest).concat(
      this.tailArrayFromPool(tails),
    );

    const lineRes = this.calculateDistanceToNamedEntity(point, lines, true);

    if (lineRes.distance < maxDistanceToPoint) {
      const {
        topSpine: _t,
        bottomSpine: _b,
        tails: tailsPoints,
        ...validReferencePositions
      } = referencePositions;

      const points: Array<[string, Vec2]> = Object.entries(
        validReferencePositions,
      ).concat(this.tailArrayFromPool(tailsPoints));

      const pointsRes = this.calculateDistanceToNamedEntity(
        point,
        points,
        false,
      );
      if (
        pointsRes.distance < maxDistanceToPoint / 2 ||
        (pointsRes.distance < maxDistanceToPoint &&
          pointsRes.distance <= lineRes.distance)
      ) {
        return pointsRes;
      }
    }

    return lineRes;
  }
}
