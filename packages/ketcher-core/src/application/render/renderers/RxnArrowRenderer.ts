import { BaseRenderer } from 'application/render/renderers/BaseRenderer';
import type { D3SvgElementSelection } from 'application/render/types';
import { Scale } from 'domain/helpers';
import type { RxnArrow } from 'domain/entities/CoreRxnArrow';
import { RxnArrowMode } from 'domain/entities/rxnArrow';
import { Vec2 } from 'domain/entities/vec2';
import { SELECTION_COLOR } from 'application/render/renderers/constants';
import { OpenAngleArrowRenderer } from 'application/render/renderers/RxnArrowPathRenderer/OpenAngleArrowRenderer';
import type { SVGPathAttributes } from 'application/render/renderers/BondPathRenderer/constants';
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
import { provideEditorSettings } from 'application/editor/editorSettings';
import { EllipticalArcFilledTriangleArrowRenderer } from 'application/render/renderers/RxnArrowPathRenderer/EllipticalArcFilledTriangleArrowRenderer';
import { EllipticalArcOpenAngleArrowRenderer } from 'application/render/renderers/RxnArrowPathRenderer/EllipticalArcOpenAngleArrowRenderer';
import { EllipticalArcOpenHalfAngleArrowRenderer } from 'application/render/renderers/RxnArrowPathRenderer/EllipticalArcOpenHalfAngleArrowRenderer';
import { KetcherLogger, toFixed } from 'utilities';
import { UnbalancedEquilibriumLargeFilledHalfBowArrowRenderer } from 'application/render/renderers/RxnArrowPathRenderer/UnbalancedEquilibriumLargeFilledHalfBowArrowRenderer';
import svgPath from 'svgpath';

const ARROW_STROKE_WIDTH = 2;
const END_HANDLE_HIT_RADIUS_MULTIPLIER = 2;

export class RxnArrowRenderer extends BaseRenderer {
  private selectionElement:
    | D3SvgElementSelection<SVGPathElement, void>
    | undefined;

  private endHandleGroups: D3SvgElementSelection<SVGGElement, void>[] = [];

  private arrowPathElements: D3SvgElementSelection<SVGPathElement, void>[] = [];

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
      `M${toFixed(start.x - wOffset)},${toFixed(start.y)}` +
      `L${toFixed(start.x - wOffset)},${toFixed(start.y - hOffset)}` +
      `L${toFixed(endX + wOffset)},${toFixed(start.y - hOffset)}` +
      `L${toFixed(endX + wOffset)},${toFixed(
        start.y + (!height ? hOffset : 0),
      )}` +
      `L${toFixed(start.x - wOffset)},${toFixed(
        start.y + (!height ? hOffset : 0),
      )}Z`;

    return svgPath(path).rotate(angle, start.x, start.y).toString();
  }

  public show() {
    this.arrowPathElements = [];

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
        .attr('data-testid', 'rxn-arrow')
        .attr('data-arrowtype', this.arrow.type + '-arrow')
        .attr('fill', 'none')
        .attr('stroke', '#000')
        .attr('stroke-width', ARROW_STROKE_WIDTH)
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round');

      if (typeof this.arrow.arrowId === 'number') {
        path?.attr('data-arrow-id', String(this.arrow.arrowId));
      }

      Object.entries(attrs).forEach(([key, value]) => {
        path?.attr(key, value);
      });

      if (path) {
        this.arrowPathElements.push(path);
      }
    });

    this.appendHoverAreaElement();
    this.drawSelection();
    this.drawEndHandles();
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

    this.drawEndHandles();
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
    this.drawEndHandles();
  }

  private getEndHandleLocalPositions(): [Vec2, Vec2] {
    const endOffset = Vec2.diff(
      this.scaledPosition.endPosition,
      this.scaledPosition.startPosition,
    );

    return [new Vec2(0, 0), endOffset];
  }

  private getEndHandleRadius() {
    return provideEditorSettings().macroModeScale / 8;
  }

  private updateEndHandles() {
    if (!this.rootElement) {
      return;
    }

    const shouldShowHandles = Boolean(this.arrow.selected || this.hoverElement);
    if (!shouldShowHandles) {
      this.removeEndHandles();
      return;
    }

    const positions = this.getEndHandleLocalPositions();

    if (this.endHandleGroups.length === 2) {
      this.endHandleGroups.forEach((group, endIndex) => {
        const position = positions[endIndex];
        group.selectAll('circle').attr('cx', position.x).attr('cy', position.y);
      });
      return;
    }

    this.drawEndHandles();
  }

  public drawEndHandles() {
    this.removeEndHandles();

    if (!this.rootElement || (!this.arrow.selected && !this.hoverElement)) {
      return;
    }

    const handleRadius = this.getEndHandleRadius();
    const hitRadius = handleRadius * END_HANDLE_HIT_RADIUS_MULTIPLIER;
    const [startPosition, endPosition] = this.getEndHandleLocalPositions();

    [startPosition, endPosition].forEach((position, endIndex) => {
      const handleData = {
        rxnArrowRenderer: this,
        endIndex: endIndex as 0 | 1,
      };

      const handleGroup = this.rootElement
        ?.append('g')
        .attr('class', 'dynamic-element');

      handleGroup
        ?.append('circle')
        .data([handleData])
        .attr('cx', position.x)
        .attr('cy', position.y)
        .attr('r', hitRadius)
        .attr('fill', 'transparent')
        .attr('stroke', 'none')
        .attr('pointer-events', 'all');

      handleGroup
        ?.append('circle')
        .data([handleData])
        .attr('cx', position.x)
        .attr('cy', position.y)
        .attr('r', handleRadius)
        .attr('fill', SELECTION_COLOR)
        .attr('stroke', SELECTION_COLOR)
        .attr('pointer-events', 'all');

      if (handleGroup) {
        this.endHandleGroups.push(handleGroup);
      }
    });
  }

  public removeEndHandles() {
    this.endHandleGroups.forEach((element) => {
      element.remove();
    });
    this.endHandleGroups = [];
  }

  public appendSelection(): void {
    const selectionPathDAttr = this.getSelectionContour(
      this.scaledPosition.startPosition,
    );

    this.selectionElement = this.canvas
      ?.insert('path', ':first-child')
      .attr('d', selectionPathDAttr)
      .attr('fill', SELECTION_COLOR)
      .attr('stroke', SELECTION_COLOR)
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

    const paths = this.generateArrowPath();
    if (paths.length !== this.arrowPathElements.length) {
      this.remove();
      this.show();
      return;
    }

    this.rootElement.attr(
      'transform',
      `translate(${this.scaledPosition.startPosition.x}, ${this.scaledPosition.startPosition.y})`,
    );

    paths.forEach(({ d, attrs }, index) => {
      const pathElement = this.arrowPathElements[index];
      pathElement.attr('d', d);
      Object.entries(attrs).forEach(([key, value]) => {
        pathElement.attr(key, value);
      });
    });

    const contourD = this.getSelectionContour();
    this.hoverAreaElement?.attr('d', contourD);
    this.hoverElement?.attr('d', contourD);

    if (this.selectionElement) {
      this.selectionElement.attr(
        'd',
        this.getSelectionContour(this.scaledPosition.startPosition),
      );
    }

    this.updateEndHandles();
  }

  protected removeHover(): void {
    this.hoverElement?.remove();
    this.hoverElement = undefined;
    // Keep end handles visible while the arrow stays selected;
    // drawEndHandles() removes them when neither selected nor hovered.
    this.drawEndHandles();
  }

  public remove() {
    super.remove();
    this.arrowPathElements = [];
    this.removeHover();
    this.removeSelection();
    this.removeEndHandles();
  }

  public moveSelection(): void {
    // intentional no-op: this renderer type does not support selection movement
  }
}

export type RxnArrowEndHandleData = {
  rxnArrowRenderer: RxnArrowRenderer;
  endIndex: 0 | 1;
};

export function isRxnArrowEndHandle(
  data: unknown,
): data is RxnArrowEndHandleData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'rxnArrowRenderer' in data &&
    'endIndex' in data
  );
}
