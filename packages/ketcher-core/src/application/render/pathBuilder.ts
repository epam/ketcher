import { tfx } from 'utilities';
import { Vec2 } from 'domain/entities';

interface Point2D {
  x: number;
  y: number;
}

export class PathBuilder {
  static generatePoint(point: Point2D): string {
    return `${tfx(point.x)},${tfx(point.y)}`;
  }

  private pathParts: Array<string>;

  constructor(initialPath?: string) {
    this.pathParts = [];
    if (initialPath) {
      this.pathParts.push(initialPath);
    }
  }

  addMovement(to: Point2D): PathBuilder {
    this.pathParts.push(`M${PathBuilder.generatePoint(to)}`);
    return this;
  }

  addLine(to: Point2D, from?: Point2D): PathBuilder {
    if (from) {
      this.addMovement(from);
    }
    this.pathParts.push(`L${PathBuilder.generatePoint(to)}`);
    return this;
  }

  addClosedLine(to: Point2D, from?: Point2D): PathBuilder {
    this.addLine(to, from);
    const index = this.pathParts.length - 1;
    this.pathParts[index] = this.pathParts[index].concat('Z');
    return this;
  }

  addQuadraticBezierCurve(control: Point2D, to: Point2D): PathBuilder {
    this.pathParts.push(
      `Q${PathBuilder.generatePoint(control)} ${PathBuilder.generatePoint(to)}`,
    );
    return this;
  }

  addPathParts(pathParts: Array<string>): PathBuilder {
    this.pathParts = this.pathParts.concat(pathParts);
    return this;
  }

  addOpenArrowPathParts(
    start: Vec2,
    arrowLength: number,
    tipXOffset = 7,
    tipYOffset = 5,
  ): PathBuilder {
    const endX = start.x + arrowLength;
    const end = new Vec2(endX, start.y);
    const tipX = endX - tipXOffset;

    return this.addLine(end, start)
      .addLine({ x: tipX, y: end.y - tipYOffset })
      .addLine({ x: tipX, y: end.y + tipYOffset }, end);
  }

  addFilledTriangleArrowPathParts(
    start: Vec2,
    arrowLength: number,
    triangleLength = 8,
    triangleWidth = 4,
  ): PathBuilder {
    const endX = start.x + arrowLength;
    const end = new Vec2(endX, start.y);
    const triangleBottom = new Vec2(endX - triangleLength, end.y);
    const tipX = endX - triangleLength;

    return this.addLine(start, triangleBottom)
      .addLine({ x: tipX, y: end.y - triangleWidth }, end)
      .addClosedLine({ x: tipX, y: end.y + triangleWidth });
  }

  addMultitailArrowBase(
    topY: number,
    bottomY: number,
    spineX: number,
    tailLength: number,
    cubicBezierOffset = 6,
  ): PathBuilder {
    const tailX = spineX - tailLength;
    const tailStart = spineX - cubicBezierOffset;

    return this.addMovement({ x: tailX, y: topY })
      .addLine({ x: tailStart, y: topY })
      .addQuadraticBezierCurve(
        { x: spineX, y: topY },
        { x: spineX, y: topY + cubicBezierOffset },
      )
      .addLine({ x: spineX, y: bottomY - cubicBezierOffset })
      .addQuadraticBezierCurve(
        { x: spineX, y: bottomY },
        { x: tailStart, y: bottomY },
      )
      .addLine({ x: tailX, y: bottomY });
  }

  build(): string {
    return this.pathParts.join(' ');
  }
}
