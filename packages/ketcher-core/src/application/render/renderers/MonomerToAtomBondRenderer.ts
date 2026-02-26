import { AtomRenderer } from 'application/render/renderers/AtomRenderer';
import { BaseRenderer } from 'application/render/renderers/BaseRenderer';
import { D3SvgElementSelection } from 'application/render/types';
import { Scale } from 'domain/helpers';
import { MonomerToAtomBond } from 'domain/entities/MonomerToAtomBond';
import { Box2Abs } from 'domain/entities/box2Abs';
import { Vec2 } from 'domain/entities/vec2';
import util from '../util';

export class MonomerToAtomBondRenderer extends BaseRenderer {
  private selectionElement:
    | D3SvgElementSelection<SVGLineElement, void>
    | undefined;

  constructor(public monomerToAtomBond: MonomerToAtomBond) {
    super(monomerToAtomBond);
    this.monomerToAtomBond.setRenderer(this);
  }

  private get scaledPosition() {
    const startPositionInPixels = Scale.modelToCanvas(
      this.monomerToAtomBond.startPosition,
      this.editorSettings,
    );

    const endPositionInPixels = Scale.modelToCanvas(
      this.monomerToAtomBond.endPosition,
      this.editorSettings,
    );

    // If the atom's label is not visible,
    // return the start and end positions without further adjustments.
    if (
      this.monomerToAtomBond.atom.baseRenderer instanceof AtomRenderer &&
      !this.monomerToAtomBond.atom.baseRenderer.isLabelVisible
    ) {
      return {
        startPosition: startPositionInPixels,
        endPosition: endPositionInPixels,
      };
    }

    const atomRenderer = this.monomerToAtomBond.atom
      .baseRenderer as AtomRenderer;
    const atomRootBoundingClientRect = atomRenderer.rootBoundingClientRect; // Use public getter

    if (atomRootBoundingClientRect) {
      // Convert DOMRect to Box2Abs relative to atom's center
      const atomVisualBBox = new Box2Abs(
        new Vec2(
          atomRootBoundingClientRect.x - atomRenderer.scaledPosition.x,
          atomRootBoundingClientRect.y - atomRenderer.scaledPosition.y,
        ),
        new Vec2(
          atomRootBoundingClientRect.x -
            atomRenderer.scaledPosition.x +
            atomRootBoundingClientRect.width,
          atomRootBoundingClientRect.y -
            atomRenderer.scaledPosition.y +
            atomRootBoundingClientRect.height,
        ),
      );

      let combinedVisualBBox: Box2Abs;

      // If the label is visible, use labelBoundingBox for a more precise bounding box.
      // Otherwise, use the overall bounding box of the atom's visual representation.
      if (atomRenderer.isLabelVisible && atomRenderer.labelBoundingBox) {
        const labelBBox = atomRenderer.labelBoundingBox;
        combinedVisualBBox = new Box2Abs(
          new Vec2(labelBBox.x, labelBBox.y),
          new Vec2(
            labelBBox.x + labelBBox.width,
            labelBBox.y + labelBBox.height,
          ),
        );
      } else {
        // Fallback: use the bounding box of the entire atom element (circle or rectangle for selection)
        // Adjust for being relative to (0,0) (atom's center)
        combinedVisualBBox = new Box2Abs(
          new Vec2(atomVisualBBox.p0.x, atomVisualBBox.p0.y),
          new Vec2(atomVisualBBox.p1.x, atomVisualBBox.p1.y),
        );
      }

      // Calculate direction vector from start to end (bond direction)
      const directionX = endPositionInPixels.x - startPositionInPixels.x;
      const directionY = endPositionInPixels.y - startPositionInPixels.y;
      const distance = Math.sqrt(
        directionX * directionX + directionY * directionY,
      );

      // Normalize the direction vector
      const normalizedDirectionX = directionX / distance;
      const normalizedDirectionY = directionY / distance;
      const bondDirection = new Vec2(
        normalizedDirectionX,
        normalizedDirectionY,
      );

      // Ray direction for shiftRayBox: from atom's center *away* from bond's origin
      const rayDirection = bondDirection.negated();

      // Calculate the shift needed to avoid overlap with the combined visual bounding box
      const shift = util.shiftRayBox(
        new Vec2(0, 0),
        rayDirection,
        combinedVisualBBox,
      );

      // Adjust end position to stop at the atom's visual edge, with an additional offset for the hover effect
      endPositionInPixels.x =
        endPositionInPixels.x + rayDirection.x * (shift + 6);
      endPositionInPixels.y =
        endPositionInPixels.y + rayDirection.y * (shift + 6);
    }

    return {
      startPosition: startPositionInPixels,
      endPosition: endPositionInPixels,
    };
  }

  show() {
    // If atom's baseRenderer or its bounding rect is not ready, retry after 10ms
    // TODO refactor this with a more proper solution without checking atom renderer here
    const atomRenderer = this.monomerToAtomBond.atom.baseRenderer;
    if (!atomRenderer?.rootBoundingClientRect) {
      setTimeout(() => {
        // Check if this renderer is still the active renderer for this bond
        if (this.monomerToAtomBond.renderer === this) {
          this.show();
        }
      }, 10);
      return;
    }

    this.rootElement =
      this.rootElement ||
      (this.canvas
        .insert('g', `.monomer`)
        .data([this])
        .attr('data-testid', 'bond')
        .attr('data-type', 'covalent')
        .attr('data-bondid', this.monomerToAtomBond.id)
        .attr('data-frommonomerid', this.monomerToAtomBond.monomer.id)
        .attr('data-toatomid', this.monomerToAtomBond.atom.id)
        .attr(
          'data-fromconnectionpoint',
          this.monomerToAtomBond.monomer.getAttachmentPointByBond(
            this.monomerToAtomBond,
          ) ?? '',
        )
        .attr(
          'transform',
          `translate(${this.scaledPosition.startPosition.x}, ${this.scaledPosition.startPosition.y})`,
        ) as never as D3SvgElementSelection<SVGGElement, void>);

    this.rootElement
      ?.append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr(
        'x2',
        this.scaledPosition.endPosition.x - this.scaledPosition.startPosition.x,
      )
      .attr(
        'y2',
        this.scaledPosition.endPosition.y - this.scaledPosition.startPosition.y,
      )
      .attr('stroke', '#333333')
      .attr('stroke-width', 1);
    this.appendHover();
  }

  protected appendHover(): D3SvgElementSelection<SVGUseElement, void> | void {
    this.rootElement
      ?.append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr(
        'x2',
        this.scaledPosition.endPosition.x - this.scaledPosition.startPosition.x,
      )
      .attr(
        'y2',
        this.scaledPosition.endPosition.y - this.scaledPosition.startPosition.y,
      )
      .attr('stroke', 'transparent')
      .attr('stroke-width', 10);
  }

  protected appendHoverAreaElement(): void {}

  public drawSelection() {
    if (!this.rootElement) {
      return;
    }
    if (this.monomerToAtomBond.selected) {
      this.appendSelection();
    } else {
      this.removeSelection();
    }
  }

  public appendSelection(): void {
    this.selectionElement = this.rootElement
      ?.insert('line', ':first-child')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr(
        'x2',
        this.scaledPosition.endPosition.x - this.scaledPosition.startPosition.x,
      )
      .attr(
        'y2',
        this.scaledPosition.endPosition.y - this.scaledPosition.startPosition.y,
      )
      .attr('stroke', '#57ff8f')
      .attr('stroke-width', 10);
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

  public moveSelection(): void {}
}
