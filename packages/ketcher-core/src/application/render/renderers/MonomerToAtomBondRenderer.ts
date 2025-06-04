import { AtomRenderer } from 'application/render/renderers/AtomRenderer';
import { BaseRenderer } from 'application/render/renderers/BaseRenderer';
import { D3SvgElementSelection } from 'application/render/types';
import { Scale } from 'domain/helpers';
import { MonomerToAtomBond } from 'domain/entities/MonomerToAtomBond';

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
    const atomRect =
      this.monomerToAtomBond.atom.baseRenderer?.rootBoundingClientRect;
    const monomerRect =
      this.monomerToAtomBond.monomer.renderer?.rootBoundingClientRect;

    if (atomRect && monomerRect) {
      const atomWidth = atomRect.width;
      const atomHeight = atomRect.height;

      // Estimate the atom radius (approximating the atom as a circle)
      let atomRadius = Math.min(atomWidth, atomHeight) / 2;

      // Calculate direction vector from start to end
      const directionX = endPositionInPixels.x - startPositionInPixels.x;
      const directionY = endPositionInPixels.y - startPositionInPixels.y;
      const distance = Math.sqrt(
        directionX * directionX + directionY * directionY,
      );

      // Bond adjustment according to atom size
      let xAdjustment = 0;
      let radiusAdjustment = 0;

      if (atomWidth > 30) {
        xAdjustment = atomRect.x < monomerRect.x ? 10 : -10;
        radiusAdjustment = 3;
      } else if (atomWidth > 20) {
        xAdjustment = atomRect.x < monomerRect.x ? 8 : -8;
        radiusAdjustment = 2;
      }

      endPositionInPixels.x += xAdjustment;
      atomRadius += radiusAdjustment;

      // Normalize the direction vector
      const normalizedDirectionX = directionX / distance;
      const normalizedDirectionY = directionY / distance;

      // Adjust end position to stop at the atom edge
      endPositionInPixels.x =
        endPositionInPixels.x - normalizedDirectionX * atomRadius;
      endPositionInPixels.y =
        endPositionInPixels.y - normalizedDirectionY * atomRadius;
    }

    return {
      startPosition: startPositionInPixels,
      endPosition: endPositionInPixels,
    };
  }

  show() {
    // If atom's baseRenderer or its bounding rect is not ready, retry after 10ms
    const atomRenderer = this.monomerToAtomBond.atom.baseRenderer;
    if (!atomRenderer || !atomRenderer.rootBoundingClientRect) {
      setTimeout(() => this.show(), 10);
      return;
    }

    this.rootElement = this.canvas
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
        ) || '',
      )
      .attr(
        'transform',
        `translate(${this.scaledPosition.startPosition.x}, ${this.scaledPosition.startPosition.y})`,
      ) as never as D3SvgElementSelection<SVGGElement, void>;

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
