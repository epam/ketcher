import { BaseRenderer } from 'application/render';
import { Atom } from 'domain/entities/CoreAtom';
import { Coordinates } from 'application/editor/shared/coordinates';
import { Bond } from 'domain/entities/CoreBond';
import { D3SvgElementSelection } from 'application/render/types';
import { Scale } from 'domain/helpers';
import { Vec2 } from 'domain/entities';
import { getBondLineShift } from 'application/render/restruct/rebond';

export class BondRenderer extends BaseRenderer {
  constructor(public bond: Bond) {
    super(bond);
  }

  private get scaledPosition() {
    // we need to convert monomer coordinates(stored in angstroms) to pixels.
    // it needs to be done in view layer of application (like renderers)
    const startPositionInPixels = Scale.modelToCanvas(
      this.bond.startPosition,
      this.editorSettings,
    );

    const endPositionInPixels = Scale.modelToCanvas(
      this.bond.endPosition,
      this.editorSettings,
    );

    return {
      startPosition: startPositionInPixels,
      endPosition: endPositionInPixels,
    };
  }

  show() {
    if (this.bond.type === 2) {
      console.log('Macro');
      const linesOffset = 6 / 2;
      const shift = -1;
      const angle = Vec2.angle(
        this.scaledPosition.startPosition,
        this.scaledPosition.endPosition,
      );
      const angleInRadians = (angle * Math.PI) / 180;
      const s1 = linesOffset + shift * linesOffset;
      const s2 = -linesOffset + shift * linesOffset;
      const isLeftShorterThanRight = Math.cos(angleInRadians) < 0;
      const directionVector = Vec2.diff(
        this.scaledPosition.endPosition,
        this.scaledPosition.startPosition,
      ).normalized();

      const normalVector = directionVector.turnLeft();
      let leftLineStartPosition = this.scaledPosition.startPosition.addScaled(
        normalVector,
        s1,
      );
      let leftLineEndPosition = this.scaledPosition.endPosition.addScaled(
        normalVector,
        s1,
      );
      let rightLineStartPosition = this.scaledPosition.startPosition.addScaled(
        normalVector,
        s2,
      );
      let rightLineEndPosition = this.scaledPosition.endPosition.addScaled(
        normalVector,
        s2,
      );

      // leftLineStartPosition = leftLineStartPosition.addScaled(
      //   directionVector,
      //   3 * getBondLineShift(Math.cos(angle), Math.sin(angle)),
      // );
      //
      // leftLineEndPosition = leftLineEndPosition.addScaled(
      //   directionVector,
      //   -3 * getBondLineShift(Math.cos(angle), Math.sin(angle)),
      // );
      console.log('Start', Math.cos(angle), Math.sin(angle));
      rightLineStartPosition = rightLineStartPosition.addScaled(
        directionVector,
        3 * getBondLineShift(Math.cos(angle), Math.sin(angle)),
      );
      console.log('End', Math.cos(angle), Math.sin(angle));

      rightLineEndPosition = rightLineEndPosition.addScaled(
        directionVector,
        -3 * getBondLineShift(Math.cos(angle), Math.sin(angle)),
      );

      this.canvas
        .append('line')
        .attr('x1', leftLineStartPosition.x)
        .attr('y1', leftLineStartPosition.y)
        .attr('x2', leftLineEndPosition.x)
        .attr('y2', leftLineEndPosition.y)
        .attr('stroke', 'black')
        .attr('stroke-width', '2px');
      this.canvas
        .append('line')
        .attr('x1', rightLineStartPosition.x)
        .attr('y1', rightLineStartPosition.y)
        .attr('x2', rightLineEndPosition.x)
        .attr('y2', rightLineEndPosition.y)
        .attr('stroke', 'black')
        .attr('stroke-width', '2px');
    } else {
      this.canvas
        .append('line')
        .attr('x1', this.scaledPosition.startPosition.x)
        .attr('y1', this.scaledPosition.startPosition.y)
        .attr('x2', this.scaledPosition.endPosition.x)
        .attr('y2', this.scaledPosition.endPosition.y)
        .attr('stroke', 'black')
        .attr('stroke-width', '2px');
    }
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
