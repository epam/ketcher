import { BaseRenderer } from 'application/render/renderers/BaseRenderer';
import { D3SvgElementSelection } from 'application/render/types';
import { Scale } from 'domain/helpers';
import { RxnArrow } from 'domain/entities/CoreRxnArrow';
import { RxnArrowMode, Vec2 } from 'domain/entities';
import { OpenAngleArrowRenderer } from 'application/render/renderers/RxnArrowPathRenderer/OpenAngleArrowRenderer';
import { SVGPathAttributes } from 'application/render/renderers/BondPathRenderer/constants';
import { FilledTriangleArrowRenderer } from 'application/render/renderers/RxnArrowPathRenderer/FilledTriangleArrowRenderer';
import { FilledBowArrowRenderer } from 'application/render/renderers/RxnArrowPathRenderer/FilledBowArrowRenderer';
import { DashedOpenAngleArrowRenderer } from 'application/render/renderers/RxnArrowPathRenderer/DashedOpenAngleArrowRenderer';
import { FailedArrowRenderer } from 'application/render/renderers/RxnArrowPathRenderer/FailedArrowRenderer';
import { RetrosyntheticArrowRenderer } from 'application/render/renderers/RxnArrowPathRenderer/RetrosyntheticArrowRenderer';
import { BothEndsFilledArrowRenderer } from 'application/render/renderers/RxnArrowPathRenderer/BothEndsFilledArrowRenderer';
import { EquilibriumFilledHalfBowArrowRenderer } from 'application/render/renderers/RxnArrowPathRenderer/EquilibriumFilledHalfBowArrowRenderer';
import { EquilibriumFilledTriangleArrowRenderer } from 'application/render/renderers/RxnArrowPathRenderer/EquilibriumFilledTriangleArrowRenderer';
import { EquilibriumOpenAngleArrowRenderer } from 'application/render/renderers/RxnArrowPathRenderer/EquilibriumOpenAngleArrowRenderer';
import { UnbalancedEquilibriumFilledHalfBowArrowRenderer } from 'application/render/renderers/RxnArrowPathRenderer/UnbalancedEquilibriumFilledHalfBowArrowRenderer';
import { UnbalancedEquilibriumOpenHalfAngleArrowRenderer } from 'application/render/renderers/RxnArrowPathRenderer/UnbalancedEquilibriumOpenHalfAngleArrowRenderer';
import { UnbalancedEquilibriumFilledHalfTriangleArrowRenderer } from 'application/render/renderers/RxnArrowPathRenderer/UnbalancedEquilibriumFilledHalfTriangleArrowRenderer';
import { EllipticalArcFilledBowArrowRenderer } from 'application/render/renderers/RxnArrowPathRenderer/EllipticalArcFilledBowArrowRenderer';
import { provideEditorSettings } from 'application/editor';
import { EllipticalArcFilledTriangleArrowRenderer } from 'application/render/renderers/RxnArrowPathRenderer/EllipticalArcFilledTriangleArrowRenderer';
import { EllipticalArcOpenAngleArrowRenderer } from 'application/render/renderers/RxnArrowPathRenderer/EllipticalArcOpenAngleArrowRenderer';
import { EllipticalArcOpenHalfAngleArrowRenderer } from 'application/render/renderers/RxnArrowPathRenderer/EllipticalArcOpenHalfAngleArrowRenderer';
import { KetcherLogger, tfx } from 'utilities';
import { UnbalancedEquilibriumLargeFilledHalfBowArrowRenderer } from 'application/render/renderers/RxnArrowPathRenderer/UnbalancedEquilibriumLargeFilledHalfBowArrowRenderer';
import svgPath from 'svgpath';

const ARROW_STROKE_WIDTH = 2;

export class RxnArrowRenderer extends BaseRenderer {
  private selectionElement:
    | D3SvgElementSelection<SVGPathElement, void>
    | undefined;

  constructor(public arrow: RxnArrow) {
    super(arrow);
    this.arrow.setRenderer(this);
  }

  private get scaledPosition() {
    const startPositionInPixels = Scale.modelToCanvas(
      this.arrow.startPosition,
      this.editorSettings,
    );

    const endPositionInPixels = Scale.modelToCanvas(
      this.arrow.endPosition,
      this.editorSettings,
    );

    return {
      startPosition: startPositionInPixels,
      endPosition: endPositionInPixels,
    };
  }

  public getArrowParams() {
    const { startPosition, endPosition } = this.scaledPosition;

    const length = Math.hypot(
      endPosition.x - startPosition.x,
      endPosition.y - startPosition.y,
    );
    const angle = Vec2.radiansToDegrees(
      Vec2.oxAngleForVector(
        new Vec2(startPosition.x, startPosition.y),
        new Vec2(endPosition.x, endPosition.y),
      ),
    );

    return { length, angle };
  }

  private generateArrowPath() {
    const { length, angle } = this.getArrowParams();
    const startPosition = new Vec2(0, 0);
    const macroModeScale = provideEditorSettings().macroModeScale;
    const height = (this.arrow.height ?? 0) * macroModeScale;

    let paths: SVGPathAttributes[] = [];

    switch (this.arrow.type) {
      case RxnArrowMode.OpenAngle:
        paths = OpenAngleArrowRenderer.preparePaths(
          startPosition,
          length,
          angle,
        );
        break;
      case RxnArrowMode.FilledTriangle:
        paths = FilledTriangleArrowRenderer.preparePaths(
          startPosition,
          length,
          angle,
        );
        break;
      case RxnArrowMode.FilledBow:
        paths = FilledBowArrowRenderer.preparePaths(
          startPosition,
          length,
          angle,
        );
        break;
      case RxnArrowMode.DashedOpenAngle:
        paths = DashedOpenAngleArrowRenderer.preparePaths(
          startPosition,
          length,
          angle,
        );
        break;
      case RxnArrowMode.Failed:
        paths = FailedArrowRenderer.preparePaths(startPosition, length, angle);
        break;
      case RxnArrowMode.Retrosynthetic:
        paths = RetrosyntheticArrowRenderer.preparePaths(
          startPosition,
          length,
          angle,
        );
        break;
      case RxnArrowMode.BothEndsFilledTriangle:
        paths = BothEndsFilledArrowRenderer.preparePaths(
          startPosition,
          length,
          angle,
        );
        break;
      case RxnArrowMode.EquilibriumFilledHalfBow:
        paths = EquilibriumFilledHalfBowArrowRenderer.preparePaths(
          startPosition,
          length,
          angle,
        );
        break;
      case RxnArrowMode.EquilibriumFilledTriangle:
        paths = EquilibriumFilledTriangleArrowRenderer.preparePaths(
          startPosition,
          length,
          angle,
        );
        break;
      case RxnArrowMode.EquilibriumOpenAngle:
        paths = EquilibriumOpenAngleArrowRenderer.preparePaths(
          startPosition,
          length,
          angle,
        );
        break;
      case RxnArrowMode.UnbalancedEquilibriumFilledHalfBow:
        paths = UnbalancedEquilibriumFilledHalfBowArrowRenderer.preparePaths(
          startPosition,
          length,
          angle,
        );
        break;
      case RxnArrowMode.UnbalancedEquilibriumOpenHalfAngle:
        paths = UnbalancedEquilibriumOpenHalfAngleArrowRenderer.preparePaths(
          startPosition,
          length,
          angle,
        );
        break;
      case RxnArrowMode.UnbalancedEquilibriumLargeFilledHalfBow:
        paths =
          UnbalancedEquilibriumLargeFilledHalfBowArrowRenderer.preparePaths(
            startPosition,
            length,
            angle,
          );
        break;
      case RxnArrowMode.UnbalancedEquilibriumFilledHalfTriangle:
        paths =
          UnbalancedEquilibriumFilledHalfTriangleArrowRenderer.preparePaths(
            startPosition,
            length,
            angle,
          );
        break;
      case RxnArrowMode.EllipticalArcFilledBow:
        paths = EllipticalArcFilledBowArrowRenderer.preparePaths(
          startPosition,
          length,
          angle,
          height,
        );
        break;
      case RxnArrowMode.EllipticalArcFilledTriangle:
        paths = EllipticalArcFilledTriangleArrowRenderer.preparePaths(
          startPosition,
          length,
          angle,
          height,
        );
        break;
      case RxnArrowMode.EllipticalArcOpenAngle:
        paths = EllipticalArcOpenAngleArrowRenderer.preparePaths(
          startPosition,
          length,
          angle,
          height,
        );
        break;
      case RxnArrowMode.EllipticalArcOpenHalfAngle:
        paths = EllipticalArcOpenHalfAngleArrowRenderer.preparePaths(
          startPosition,
          length,
          angle,
          height,
        );
        break;

      default:
        KetcherLogger.error('Unknown RxnArrow arrow type: ', this.arrow.type);
        break;
    }

    return paths;
  }

  private getSelectionContour(startPosition?: Vec2): string {
    const macroModeScale = provideEditorSettings().macroModeScale;
    const { length, angle } = this.getArrowParams();
    const height = (this.arrow.height ?? 0) * macroModeScale;
    const start = startPosition ?? new Vec2(0, 0);
    const endX = start.x + length;
    const normalizedHeight = height === 0 ? undefined : height;
    const [wOffset, hOffset] = [5, normalizedHeight ?? 8];

    const path =
      `M${tfx(start.x - wOffset)},${tfx(start.y)}` +
      `L${tfx(start.x - wOffset)},${tfx(start.y - hOffset)}` +
      `L${tfx(endX + wOffset)},${tfx(start.y - hOffset)}` +
      `L${tfx(endX + wOffset)},${tfx(start.y + (!height ? hOffset : 0))}` +
      `L${tfx(start.x - wOffset)},${tfx(start.y + (!height ? hOffset : 0))}Z`;

    return svgPath(path).rotate(angle, start.x, start.y).toString();
  }

  public show() {
    this.rootElement = this.canvas
      .insert('g', `.monomer`)
      .data([this])
      .attr(
        'transform',
        `translate(${this.scaledPosition.startPosition.x}, ${this.scaledPosition.startPosition.y})`,
      ) as never as D3SvgElementSelection<SVGGElement, void>;

    const paths = this.generateArrowPath();

    paths.forEach(({ d, attrs }) => {
      const path = this.rootElement
        ?.append('path')
        .attr('d', d)
        .attr('data-testid', this.arrow.type + '-arrow')
        .attr('fill', 'none')
        .attr('stroke', '#000')
        .attr('stroke-width', ARROW_STROKE_WIDTH)
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round');

      Object.entries(attrs).forEach(([key, value]) => {
        path?.attr(key, value);
      });
    });

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
    const selectionPathDAttr = this.getSelectionContour(
      this.scaledPosition.startPosition,
    );

    this.selectionElement = this.canvas
      ?.insert('path', ':first-child')
      .attr('d', selectionPathDAttr)
      .attr('fill', '#57ff8f')
      .attr('stroke', '#57ff8f')
      .attr('class', 'dynamic-element');
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
