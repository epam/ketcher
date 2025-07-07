import { BaseRenderer } from 'application/render/renderers/BaseRenderer';
import { D3SvgElementSelection } from 'application/render/types';
import { Pool, Vec2 } from 'domain/entities';
import { Coordinates, provideEditorSettings } from 'application/editor';
import { MultitailArrow } from 'domain/entities/CoreMultitailArrow';
import { PathBuilder } from 'application/render/pathBuilder';
import { ARROW_HEAD_LENGHT, ARROW_HEAD_WIDTH } from 'application/render/draw';
import { ReMultitailArrow } from 'application/render';

const ARROW_STROKE_WIDTH = 2;

export class MultitailArrowRenderer extends BaseRenderer {
  private selectionElement:
    | D3SvgElementSelection<SVGPathElement, void>
    | undefined;

  constructor(public arrow: MultitailArrow) {
    super(arrow);
    this.arrow.setRenderer(this);
  }

  public override get selectionPoints() {
    return this.getReferencePositionsArray();
  }

  getReferencePositionsArray(): Array<Vec2> {
    const { tails, ...positions } = this.getReferencePositions();
    return Object.values(positions).concat(Array.from(tails.values()));
  }

  private getReferencePositions(): ReturnType<
    MultitailArrow['getReferencePositions']
  > {
    const positions = this.arrow.getReferencePositions();
    const tails = new Pool<Vec2>();
    positions.tails.forEach((item, key) => {
      tails.set(key, Coordinates.modelToCanvas(item));
    });

    return {
      head: Coordinates.modelToCanvas(positions.head),
      topTail: Coordinates.modelToCanvas(positions.topTail),
      bottomTail: Coordinates.modelToCanvas(positions.bottomTail),
      topSpine: Coordinates.modelToCanvas(positions.topSpine),
      bottomSpine: Coordinates.modelToCanvas(positions.bottomSpine),
      tails,
    };
  }

  private getArrowPaths() {
    const macroModeScale = provideEditorSettings().macroModeScale;
    const pathBuilder = new PathBuilder();
    const headPathBuilder = new PathBuilder();
    const { topTail, topSpine, bottomSpine, head, tails } =
      this.getReferencePositions();
    const topTailOffsetX = topSpine.sub(topTail).x;
    const arrowStart = new Vec2(topSpine.x, head.y);
    const arrowLength = head.x - arrowStart.x;
    const arrowHeadLength = ARROW_HEAD_LENGHT * macroModeScale;
    const arrowHeadWidth = ARROW_HEAD_WIDTH * macroModeScale;

    pathBuilder.addMultitailArrowBase(
      topSpine.y,
      bottomSpine.y,
      topSpine.x,
      topTailOffsetX,
    );
    headPathBuilder.addFilledTriangleArrowPathParts(
      arrowStart,
      arrowLength,
      arrowHeadLength,
      arrowHeadWidth,
    );
    tails.forEach((tail) => {
      pathBuilder.addLine(tail, { x: topSpine.x, y: tail.y });
    });

    return {
      arrowBody: pathBuilder.build(),
      arrowHead: headPathBuilder.build(),
    };
  }

  private getSelectionContour() {
    const macroModeScale = provideEditorSettings().macroModeScale;
    const offset = ReMultitailArrow.FRAME_OFFSET * macroModeScale;
    const { topSpine, bottomSpine, topTail, bottomTail, head, tails } =
      this.getReferencePositions();
    const builder = new PathBuilder();
    const tailsPoints = Array.from(tails.values()).sort((a, b) => a.y - b.y);

    const start = topSpine.add(new Vec2(offset, offset));

    builder
      .addMovement(start)
      .addLine(
        topSpine.add(
          new Vec2(offset, -offset + ReMultitailArrow.CUBIC_BEZIER_OFFSET),
        ),
      )
      .addQuadraticBezierCurve(
        topSpine.add(new Vec2(offset, -offset)),
        topSpine.add(
          new Vec2(offset - ReMultitailArrow.CUBIC_BEZIER_OFFSET, -offset),
        ),
      );
    ReMultitailArrow.drawSingleLineHover(
      builder,
      offset,
      topSpine,
      topTail,
      -1,
      -1,
    );
    tailsPoints.forEach((tailPoint) => {
      ReMultitailArrow.drawSingleLineHover(
        builder,
        offset,
        new Vec2(topSpine.x, tailPoint.y),
        tailPoint,
        -1,
        -1,
      );
    });
    ReMultitailArrow.drawSingleLineHover(
      builder,
      offset,
      bottomSpine,
      bottomTail,
      -1,
      -1,
    );
    builder
      .addLine(
        bottomSpine.add(
          new Vec2(offset - ReMultitailArrow.CUBIC_BEZIER_OFFSET, offset),
        ),
      )
      .addQuadraticBezierCurve(
        bottomSpine.add(new Vec2(offset, offset)),
        bottomSpine.add(
          new Vec2(offset, offset - ReMultitailArrow.CUBIC_BEZIER_OFFSET),
        ),
      );
    ReMultitailArrow.drawSingleLineHover(
      builder,
      offset,
      new Vec2(topSpine.x, head.y),
      head,
      1,
      1,
    );
    builder.addLine(start);

    return builder.build();
  }

  public show() {
    this.rootElement = this.canvas
      .insert('g', `.monomer`)
      .data([this])
      .attr('data-testid', 'multitail-arrow') as never as D3SvgElementSelection<
      SVGGElement,
      void
    >;

    const arrowPaths = this.getArrowPaths();

    this.rootElement
      .append('path')
      .attr('stroke', '#000')
      .attr('stroke-width', ARROW_STROKE_WIDTH)
      .attr('fill', 'none')
      .attr('d', arrowPaths.arrowBody);

    this.rootElement
      .append('path')
      .attr('d', arrowPaths.arrowHead)
      .attr('stroke', '#000')
      .attr('stroke-width', ARROW_STROKE_WIDTH)
      .attr('fill', '#000');

    this.appendHoverAreaElement();
    this.drawSelection();
  }

  protected appendHover(): D3SvgElementSelection<SVGUseElement, void> | void {
    const selectionPathDAttr = this.getSelectionContour();

    this.hoverElement = this.rootElement
      ?.insert('path', ':first-child')
      .attr('d', selectionPathDAttr)
      .attr('fill', 'none')
      .attr('stroke', '#0097A8')
      .attr('stroke-width', 1.2)
      .attr('class', 'dynamic-element');
  }

  protected appendHoverAreaElement(): void {
    const selectionPathDAttr = this.getSelectionContour();

    this.hoverAreaElement = this.rootElement
      ?.append('path')
      .attr('d', selectionPathDAttr)
      .attr('fill', 'none')
      .attr('stroke', 'none')
      .attr('pointer-events', 'all')
      .attr('class', 'dynamic-element');

    this.hoverAreaElement
      ?.on('mouseover', () => {
        this.appendHover();
      })
      .on('mouseout', () => {
        this.removeHover();
      });

    this.hoverAreaElement?.data([this]);
  }

  public drawSelection() {
    if (!this.rootElement) {
      return;
    }
    if (this.arrow.selected) {
      this.appendSelection();
    } else {
      this.removeSelection();
    }
  }

  public appendSelection(): void {
    const selectionPathDAttr = this.getSelectionContour();

    this.selectionElement = this.canvas
      ?.insert('path', ':first-child')
      .attr('stroke', '#57ff8f')
      .attr('fill', '#57ff8f')
      .attr('d', selectionPathDAttr);
  }

  public removeSelection() {
    this.selectionElement?.remove();
    this.selectionElement = undefined;
  }

  public move() {
    if (!this.rootElement) {
      return;
    }

    this.remove();
    this.show();
  }

  protected removeHover(): void {
    this.hoverElement?.remove();
    this.hoverElement = undefined;
  }

  public remove() {
    super.remove();
    this.removeHover();
    this.removeSelection();
  }

  public moveSelection(): void {}
}
