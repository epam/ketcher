import { BaseRenderer } from 'application/render';
import { Atom } from 'domain/entities/CoreAtom';
import { Coordinates } from 'application/editor/shared/coordinates';
import { Bond } from 'domain/entities/CoreBond';
import { D3SvgElementSelection } from 'application/render/types';
import { Scale } from 'domain/helpers';
import { Vec2 } from 'domain/entities';
import { getBondLineShift } from 'application/render/restruct/rebond';
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
      .insert('line', `.monomer`)
      .attr('x1', this.scaledPosition.startPosition.x)
      .attr('y1', this.scaledPosition.startPosition.y)
      .attr('x2', this.scaledPosition.endPosition.x)
      .attr('y2', this.scaledPosition.endPosition.y)
      .attr('stroke', '#333333')
      .attr('stroke-width', 1);
  }

  protected appendHover(
    hoverArea,
  ): D3SvgElementSelection<SVGUseElement, void> | void {
    return undefined;
  }

  protected appendHoverAreaElement(): void {}

  drawSelection(): void {}

  moveSelection(): void {}

  protected removeHover(): void {}
}
