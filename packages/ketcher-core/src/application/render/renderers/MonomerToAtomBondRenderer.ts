import { BaseRenderer } from 'application/render/renderers/BaseRenderer';
import { D3SvgElementSelection } from 'application/render/types';
import { Scale } from 'domain/helpers';
import { MonomerToAtomBond } from 'domain/entities/MonomerToAtomBond';

export class MonomerToAtomBondRenderer extends BaseRenderer {
  private selectionElement:
    | D3SvgElementSelection<SVGLineElement, void>
    | undefined;

  private endX = 0;
  private endY = 0;

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

    const atomRect =
      this.monomerToAtomBond.atom.baseRenderer?.rootBoundingClientRect;
    if (atomRect) {
      // Get the atom rectangle dimensions
      const atomWidth = atomRect.width;
      const atomHeight = atomRect.height;

      // Estimate the atom radius (approximating the atom as a circle)
      const atomRadius = Math.min(atomWidth, atomHeight) / 2;

      // Calculate direction vector from start to end
      const directionX = endPositionInPixels.x - startPositionInPixels.x;
      const directionY = endPositionInPixels.y - startPositionInPixels.y;
      const distance = Math.sqrt(
        directionX * directionX + directionY * directionY,
      );

      // Normalize the direction vector
      const normalizedDirectionX = directionX / distance;
      const normalizedDirectionY = directionY / distance;

      // Adjust end position to stop at the atom edge
      endPositionInPixels.x =
        endPositionInPixels.x - normalizedDirectionX * atomRadius;
      endPositionInPixels.y =
        endPositionInPixels.y - normalizedDirectionY * atomRadius;
    } else {
      // need to align start end position to give proper position on canvas reload
    }

    return {
      startPosition: startPositionInPixels,
      endPosition: endPositionInPixels,
    };
  }

  show() {
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
