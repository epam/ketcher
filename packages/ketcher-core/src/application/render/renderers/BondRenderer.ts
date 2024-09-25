import { BaseRenderer } from 'application/render';
import { Atom } from 'domain/entities/CoreAtom';
import { Coordinates } from 'application/editor/shared/coordinates';
import { Bond } from 'domain/entities/CoreBond';
import { D3SvgElementSelection } from 'application/render/types';
import { Scale } from 'domain/helpers';
import { Struct, Vec2 } from 'domain/entities';
import ReBond, { getBondLineShift } from 'application/render/restruct/rebond';
import { CoreEditor } from 'application/editor';
import { HalfEdge } from 'application/render/view-model/HalfEdge';
import { ViewModel } from 'application/render/view-model/ViewModel';
import { KetcherLogger } from 'utilities';

export class BondRenderer extends BaseRenderer {
  constructor(public bond: Bond) {
    super(bond);
    bond.setRenderer(this);
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

  private getDoubleBondShiftForChain(
    firstHalfEdge?: HalfEdge,
    secondHalfEdge?: HalfEdge,
  ): number {
    if (!firstHalfEdge || !secondHalfEdge) return 0;
    const nLeft =
      (firstHalfEdge.sinToLeftNeighborHalfEdge > 0.3 ? 1 : 0) +
      (secondHalfEdge.sinToRightNeighborHalfEdge > 0.3 ? 1 : 0);
    const nRight =
      (secondHalfEdge.sinToLeftNeighborHalfEdge > 0.3 ? 1 : 0) +
      (firstHalfEdge.sinToRightNeighborHalfEdge > 0.3 ? 1 : 0);
    if (nLeft > nRight) return -1;
    if (nLeft < nRight) return 1;
    if (
      (firstHalfEdge.sinToLeftNeighborHalfEdge > 0.3 ? 1 : 0) +
        (firstHalfEdge.sinToRightNeighborHalfEdge > 0.3 ? 1 : 0) ===
      1
    )
      return 1;
    return 0;
  }

  private getDoubleBondShiftForLoop(
    loop1HalfEdgesAmount: number,
    loop2HalfEdgesAmount: number,
    loop1DoubleBondsAmount: number,
    loop2DoubleBondsAmount: number,
  ): number {
    const BENZENE_RING_BONDS_AMOUNT = 6;

    if (
      loop1HalfEdgesAmount === BENZENE_RING_BONDS_AMOUNT &&
      loop2HalfEdgesAmount !== BENZENE_RING_BONDS_AMOUNT &&
      (loop1DoubleBondsAmount > 1 || loop2DoubleBondsAmount === 1)
    )
      return -1;
    if (
      loop2HalfEdgesAmount === BENZENE_RING_BONDS_AMOUNT &&
      loop1HalfEdgesAmount !== BENZENE_RING_BONDS_AMOUNT &&
      (loop2DoubleBondsAmount > 1 || loop1DoubleBondsAmount === 1)
    )
      return 1;
    if (
      loop2HalfEdgesAmount * loop1DoubleBondsAmount >
      loop1HalfEdgesAmount * loop2DoubleBondsAmount
    )
      return -1;
    if (
      loop2HalfEdgesAmount * loop1DoubleBondsAmount <
      loop1HalfEdgesAmount * loop2DoubleBondsAmount
    )
      return 1;
    if (loop2HalfEdgesAmount > loop1HalfEdgesAmount) return -1;
    return 1;
  }

  private getDoubleBondShift(
    viewModel: ViewModel,
    firstHalfEdge?: HalfEdge,
    secondHalfEdge?: HalfEdge,
  ) {
    if (!firstHalfEdge || !secondHalfEdge) {
      return this.getDoubleBondShiftForChain(firstHalfEdge, secondHalfEdge);
    }

    const loop1Id = firstHalfEdge.loopId || -1;
    const loop2Id = secondHalfEdge.loopId || -1;
    const loop1 = viewModel.loops.get(loop1Id);
    const loop2 = viewModel.loops.get(loop2Id);

    if (loop1 && loop2) {
      return this.getDoubleBondShiftForLoop(
        loop1.halfEdges.length,
        loop2.halfEdges.length,
        loop1.doubleBondsAmount,
        loop2.doubleBondsAmount,
      );
    } else if (loop1) {
      return -1;
    } else if (loop2) {
      return 1;
    } else {
      return this.getDoubleBondShiftForChain(firstHalfEdge, secondHalfEdge);
    }
  }

  private shiftPositionIfAtomLabelVisible(
    position: Vec2,
    atom: Atom,
    halfEdge: HalfEdge,
  ) {
    if (atom.renderer?.isLabelVisible) {
      return position.addScaled(
        halfEdge.direction,
        2 * 3 + this.bond.firstAtom.label.length * 8,
        // 2 is the width of the bond line
      );
    }

    return position;
  }

  show() {
    const editor = CoreEditor.provideEditorInstance();
    const viewModel = editor.viewModel;
    const halfEdges = viewModel.bondsToHalfEdges.get(this.bond);
    const firstHalfEdge = halfEdges?.[0];
    const secondHalfEdge = halfEdges?.[1];
    const bondSpace = 6;
    const linesOffset = bondSpace / 2;
    const LINE_WIDTH = 2;
    const stereoBondWidth = 6;

    if (!firstHalfEdge || !secondHalfEdge) {
      KetcherLogger.warn(
        'Failed to draw double bond. There is no no half edges.',
      );

      return;
    }

    if (this.bond.type === 2) {
      let bondStartPosition = Coordinates.modelToCanvas(firstHalfEdge.position);
      let bondEndPosition = Coordinates.modelToCanvas(secondHalfEdge.position);
      bondStartPosition = this.shiftPositionIfAtomLabelVisible(
        bondStartPosition,
        this.bond.firstAtom,
        firstHalfEdge,
      );
      bondEndPosition = this.shiftPositionIfAtomLabelVisible(
        bondEndPosition,
        this.bond.secondAtom,
        secondHalfEdge,
      );
      const shift = this.getDoubleBondShift(
        viewModel,
        firstHalfEdge,
        secondHalfEdge,
      );
      const firstLinePartShift = linesOffset + shift * linesOffset;
      const secondLinePartShift = -linesOffset + shift * linesOffset;

      let firstLineStartPosition = bondStartPosition.addScaled(
        firstHalfEdge.leftNormal,
        firstLinePartShift,
      );
      let firstLineEndPosition = bondEndPosition.addScaled(
        firstHalfEdge.leftNormal,
        firstLinePartShift,
      );
      let secondLineStartPosition = bondStartPosition.addScaled(
        firstHalfEdge.leftNormal,
        secondLinePartShift,
      );
      let secondLineEndPosition = bondEndPosition.addScaled(
        firstHalfEdge.leftNormal,
        secondLinePartShift,
      );

      if (shift > 0) {
        firstLineStartPosition = firstLineStartPosition.addScaled(
          firstHalfEdge.direction,
          bondSpace *
            getBondLineShift(
              firstHalfEdge.cosToRightNeighborHalfEdge,
              firstHalfEdge.sinToRightNeighborHalfEdge,
            ),
        );

        firstLineEndPosition = firstLineEndPosition.addScaled(
          firstHalfEdge.direction,
          -bondSpace *
            getBondLineShift(
              secondHalfEdge.cosToLeftNeighborHalfEdge,
              secondHalfEdge.sinToLeftNeighborHalfEdge,
            ),
        );
      } else if (shift < 0) {
        secondLineStartPosition = secondLineStartPosition.addScaled(
          firstHalfEdge.direction,
          bondSpace *
            getBondLineShift(
              firstHalfEdge.cosToLeftNeighborHalfEdge,
              firstHalfEdge.sinToLeftNeighborHalfEdge,
            ),
        );

        secondLineEndPosition = secondLineEndPosition.addScaled(
          firstHalfEdge.direction,
          -bondSpace *
            getBondLineShift(
              secondHalfEdge.cosToRightNeighborHalfEdge,
              secondHalfEdge.sinToRightNeighborHalfEdge,
            ),
        );
      }

      this.canvas
        .append('line')
        .attr('x1', firstLineStartPosition.x)
        .attr('y1', firstLineStartPosition.y)
        .attr('x2', firstLineEndPosition.x)
        .attr('y2', firstLineEndPosition.y)
        .attr('stroke', 'black')
        .attr('stroke-width', '2px');
      this.canvas
        .append('line')
        .attr('x1', secondLineStartPosition.x)
        .attr('y1', secondLineStartPosition.y)
        .attr('x2', secondLineEndPosition.x)
        .attr('y2', secondLineEndPosition.y)
        .attr('stroke', 'black')
        .attr('stroke-width', '2px');
    } else if (this.bond.type === 1) {
      if (this.bond.stereo === 1) {
        let bondStartPosition = Coordinates.modelToCanvas(
          firstHalfEdge.position,
        );
        let bondEndPosition = Coordinates.modelToCanvas(
          secondHalfEdge.position,
        );
        bondStartPosition = this.shiftPositionIfAtomLabelVisible(
          bondStartPosition,
          this.bond.firstAtom,
          firstHalfEdge,
        );
        bondEndPosition = this.shiftPositionIfAtomLabelVisible(
          bondEndPosition,
          this.bond.secondAtom,
          secondHalfEdge,
        );
        const halfOfBondEndWidth = 0.7 * stereoBondWidth;
        const bondEndFirstPoint = bondEndPosition.addScaled(
          firstHalfEdge.leftNormal,
          halfOfBondEndWidth,
        );
        const bondEndSecondPoint = bondEndPosition.addScaled(
          firstHalfEdge.leftNormal,
          -halfOfBondEndWidth,
        );

        this.canvas
          .append('path')
          .attr(
            'd',
            `
          M${bondStartPosition.x},${bondStartPosition.y}
          L${bondEndFirstPoint.x},${bondEndFirstPoint.y}
          L${bondEndSecondPoint.x},${bondEndSecondPoint.y}
          Z
          `,
          )
          .attr('stroke', '#000')
          .attr('stroke-width', 2)
          .attr('stroke-linecap', 'round')
          .attr('stroke-linejoin', 'round');
      } else if (this.bond.stereo === 6) {
        let bondStartPosition = Coordinates.modelToCanvas(
          firstHalfEdge.position,
        );
        let bondEndPosition = Coordinates.modelToCanvas(
          secondHalfEdge.position,
        );

        bondStartPosition = this.shiftPositionIfAtomLabelVisible(
          bondStartPosition,
          this.bond.firstAtom,
          firstHalfEdge,
        );
        bondEndPosition = this.shiftPositionIfAtomLabelVisible(
          bondEndPosition,
          this.bond.secondAtom,
          secondHalfEdge,
        );

        const direction = bondEndPosition.sub(bondStartPosition);
        const bondLength = direction.length() + 0.2;
        const normalizedDirection = direction.normalized();
        const offsetBetweenLines = 1.2 * LINE_WIDTH;
        const numberOfLines =
          Math.max(
            Math.floor(
              (bondLength - LINE_WIDTH) / (LINE_WIDTH + offsetBetweenLines),
            ),
            0,
          ) + 2;
        const step = bondLength / (numberOfLines - 1);
        const halfOfBondEndWidth = 0.7 * stereoBondWidth;

        let path = '';
        let p;
        let q;
        let r;

        for (let i = 0; i < numberOfLines; ++i) {
          r = bondStartPosition.addScaled(normalizedDirection, step * i);
          p = r.addScaled(
            firstHalfEdge.leftNormal,
            (halfOfBondEndWidth * (i + 0.5)) / (numberOfLines - 0.5),
          );
          q = r.addScaled(
            firstHalfEdge.leftNormal,
            (-halfOfBondEndWidth * (i + 0.5)) / (numberOfLines - 0.5),
          );
          // path += makeStroke(p, q);
          path += `
            M${p.x},${p.y}
            L${q.x},${q.y}
          `;
        }

        this.canvas
          .append('path')
          .attr('d', path)
          .attr('stroke', '#000')
          .attr('stroke-width', 2)
          .attr('stroke-linecap', 'round')
          .attr('stroke-linejoin', 'round');
      } else {
        let startPosition = this.scaledPosition.startPosition;
        let endPosition = this.scaledPosition.endPosition;

        startPosition = this.shiftPositionIfAtomLabelVisible(
          startPosition,
          this.bond.firstAtom,
          firstHalfEdge,
        );
        endPosition = this.shiftPositionIfAtomLabelVisible(
          endPosition,
          this.bond.secondAtom,
          secondHalfEdge,
        );

        this.canvas
          .append('line')
          .attr('x1', startPosition.x)
          .attr('y1', startPosition.y)
          .attr('x2', endPosition.x)
          .attr('y2', endPosition.y)
          .attr('stroke', 'black')
          .attr('stroke-width', '2px');
      }
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
