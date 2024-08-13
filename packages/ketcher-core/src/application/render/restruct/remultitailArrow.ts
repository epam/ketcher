import ReObject from './reobject';
import { Line, MultitailArrow } from 'domain/entities/multitailArrow';
import { MULTITAIL_ARROW_KEY } from 'domain/constants/multitailArrow';
import { ReStruct } from 'application/render';
import { RenderOptions } from 'application/render/render.types';
import { PathBuilder } from 'application/render/pathBuilder';
import { Scale } from 'domain/helpers';
import { Box2Abs, Pool, Vec2 } from 'domain/entities';
import util from 'application/render/util';

interface ClosestReferencePosition {
  distance: number;
  ref: { name: string; offset: Vec2 } | null;
}

export class ReMultitailArrow extends ReObject {
  static isSelectable(): boolean {
    return true;
  }

  constructor(public multitailArrow: MultitailArrow) {
    super(MULTITAIL_ARROW_KEY);
  }

  getReferencePositions(renderOptions: RenderOptions) {
    const positions = this.multitailArrow.getReferencePositions();
    const tails = new Pool<Vec2>();
    positions.tails.forEach((item, key) => {
      tails.set(key, Scale.modelToCanvas(item, renderOptions));
    });

    return {
      headPosition: Scale.modelToCanvas(positions.headPosition, renderOptions),
      topTailPosition: Scale.modelToCanvas(
        positions.topTailPosition,
        renderOptions,
      ),
      bottomTailPosition: Scale.modelToCanvas(
        positions.bottomTailPosition,
        renderOptions,
      ),
      topSpinePosition: Scale.modelToCanvas(
        positions.topSpinePosition,
        renderOptions,
      ),
      bottomSpinePosition: Scale.modelToCanvas(
        positions.bottomSpinePosition,
        renderOptions,
      ),
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
    const {
      topTailPosition,
      topSpinePosition,
      bottomSpinePosition,
      headPosition,
      tails,
    } = this.getReferencePositions(renderOptions);
    const topTailOffsetX = topSpinePosition.sub(topTailPosition).x;
    const arrowStart = new Vec2(topSpinePosition.x, headPosition.y);
    const arrowLength = headPosition.x - arrowStart.x;

    pathBuilder.addMultitailArrowBase(
      topSpinePosition.y,
      bottomSpinePosition.y,
      topSpinePosition.x,
      topTailOffsetX,
    );
    headPathBuilder.addFilledTriangleArrowPathParts(arrowStart, arrowLength);
    tails.forEach((tail) => {
      pathBuilder.addLine(tail, { x: topSpinePosition.x, y: tail.y });
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

  calculateDistanceToPoint(
    point: Vec2,
    renderOptions: RenderOptions,
  ): ClosestReferencePosition {
    const referencePositions = this.getReferencePositions(renderOptions);
    const referenceLines = this.getReferenceLines(
      renderOptions,
      referencePositions,
    );
    const { tails, ...rest } = referenceLines;
    const tailsLines: Array<[string, Line]> = Array.from(tails.entries()).map(
      ([key, value]) => [`tails-${key}`, value],
    );
    const lines: Array<[string, Line]> =
      Object.entries(rest).concat(tailsLines);

    const res = lines.reduce(
      (acc, [name, value]): ClosestReferencePosition => {
        const distance = point.calculateDistanceToLine(value);
        return distance < acc.distance
          ? { distance, ref: { name, offset: new Vec2(0, 0) } }
          : acc;
      },
      { distance: Infinity, ref: null } as ClosestReferencePosition,
    );

    return res;
  }
}
