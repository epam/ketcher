import { BaseRenderer } from 'application/render';
import { D3SvgElementSelection } from 'application/render/types';
import { Scale } from 'domain/helpers';
import { MonomerToAtomBond } from 'domain/entities/MonomerToAtomBond';

export class MonomerToAtomBondRenderer extends BaseRenderer {
  constructor(public monomerToAtomBond: MonomerToAtomBond) {
    super(monomerToAtomBond);
    this.monomerToAtomBond.setRenderer(this);
  }

  private get scaledPosition() {
    // we need to convert monomer coordinates(stored in angstroms) to pixels.
    // it needs to be done in view layer of application (like renderers)
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
    this.rootElement = this.canvas
      .insert('g', `.monomer`)
      .attr(
        'transform',
        `translate(${this.scaledPosition.startPosition.x}, ${this.scaledPosition.startPosition.y})`,
      );

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
  }

  protected appendHover(): D3SvgElementSelection<SVGUseElement, void> | void {
    return undefined;
  }

  protected appendHoverAreaElement(): void {}

  drawSelection(): void {}

  public move() {
    if (!this.rootElement) {
      return;
    }

    this.remove();
    this.show();
  }

  protected removeHover(): void {}

  public moveSelection(): void {}
}
