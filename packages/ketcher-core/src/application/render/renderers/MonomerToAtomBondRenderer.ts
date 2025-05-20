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

    return {
      startPosition: startPositionInPixels,
      endPosition: endPositionInPixels,
    };
  }

  show() {
    const atomRenderer = this.monomerToAtomBond.atom.renderer;
    const labelBBox = atomRenderer?.getLabelBBoxInCanvas?.();

    if (labelBBox) {
      const startX = this.scaledPosition.startPosition.x;
      const startY = this.scaledPosition.startPosition.y;
      const centerX = labelBBox.x + labelBBox.width / 2;
      const centerY = labelBBox.y + labelBBox.height / 2;
      const radius = Math.min(labelBBox.width, labelBBox.height) / 2 + 3;
      const dx = centerX - startX;
      const dy = centerY - startY;
      const len = Math.sqrt(dx * dx + dy * dy);

      if (len === 0) {
        this.endX = dx;
        this.endY = dy;
      } else {
        this.endX = dx - (dx / len) * radius;
        this.endY = dy - (dy / len) * radius;
      }
    } else {
      // fallback to atom center
      this.endX =
        this.scaledPosition.endPosition.x - this.scaledPosition.startPosition.x;
      this.endY =
        this.scaledPosition.endPosition.y - this.scaledPosition.startPosition.y;
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
      .attr('x2', this.endX)
      .attr('y2', this.endY)
      .attr('stroke', '#333333')
      .attr('stroke-width', 1);

    this.appendHover();
  }

  protected appendHover(): D3SvgElementSelection<SVGUseElement, void> | void {
    this.rootElement
      ?.append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', this.endX)
      .attr('y2', this.endY)
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
      .attr('x2', this.endX)
      .attr('y2', this.endY)
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
