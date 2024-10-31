import { BaseRenderer } from 'application/render/renderers/BaseRenderer';
import { Atom } from 'domain/entities/CoreAtom';
import { Coordinates } from 'application/editor/shared/coordinates';
import { Bond } from 'domain/entities/CoreBond';
import { Scale } from 'domain/helpers';
import { Vec2 } from 'domain/entities';
import { getBondLineShift } from 'application/render/restruct/rebond';
import { CoreEditor } from 'application/editor';
import { HalfEdge } from 'application/render/view-model/HalfEdge';
import { ViewModel } from 'application/render/view-model/ViewModel';
import { KetcherLogger } from 'utilities';
import { D3SvgElementSelection } from 'application/render/types';

const BOND_WIDTH = 2;

export class BondRenderer extends BaseRenderer {
  private pathShape = '';
  private selectionElement:
    | D3SvgElementSelection<SVGPathElement, void>
    | undefined;

  constructor(public bond: Bond) {
    super(bond);
    bond.setRenderer(this);
  }

  private get scaledPosition() {
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
        BOND_WIDTH * 3 + (this.bond.firstAtom.renderer?.labelLength || 0) * 4,
      );
    }

    return position;
  }

  public appendSelection() {
    const pathShape = this.getSelectionContour();

    if (this.selectionElement) {
      this.selectionElement.attr('d', pathShape);
    } else {
      this.selectionElement = this.canvas
        ?.insert('path', ':first-child')
        .attr('d', pathShape)
        .attr('fill', '#57ff8f')
        .attr('class', 'dynamic-element');
    }
  }

  public removeSelection() {
    this.selectionElement?.remove();
    this.selectionElement = undefined;
  }

  public appendHover() {
    if (this.hoverElement) {
      return this.hoverElement;
    }

    const pathShape = this.getSelectionContour();

    this.hoverElement = this.canvas
      ?.insert('path', ':first-child')
      .attr('d', pathShape)
      .attr('fill', 'none')
      .attr('stroke', '#0097A8')
      .attr('stroke-width', 1.2)
      .attr('class', 'dynamic-element');

    return this.hoverElement;
  }

  public removeHover() {
    this.hoverElement?.remove();
    this.hoverElement = undefined;
  }

  public drawSelection() {
    if (!this.rootElement) {
      return;
    }
    if (this.bond.selected) {
      this.appendSelection();
      // this.raiseElement();
    } else {
      this.removeSelection();
    }
  }

  private appendRootElement() {
    return this.canvas
      .append('g')
      .data([this])
      .attr(
        'transform',
        `translate(${this.scaledPosition.startPosition.x}, ${this.scaledPosition.startPosition.y})`,
      ) as never as D3SvgElementSelection<SVGGElement, void>;
  }

  getSelectionPoints() {
    // please refer to: ketcher-core/docs/data/hover_selection_1.png
    const editor = CoreEditor.provideEditorInstance();
    const viewModel = editor.viewModel;
    const halfEdges = viewModel.bondsToHalfEdges.get(this.bond);
    const firstHalfEdge = halfEdges?.[0];
    const secondHalfEdge = halfEdges?.[1];
    const bond: Bond = this.bond;
    const bondSpacingInPx = 6;
    const stereoBondWidth = 6;
    const regularSelectionThikness = bondSpacingInPx + BOND_WIDTH;

    if (!firstHalfEdge || !secondHalfEdge) {
      KetcherLogger.warn(
        'Failed to draw selection for bond. There is no no half edges.',
      );

      return [];
    }

    // get half-bond positions, this is where the actual bond
    // image on the screen is drawn, it may be different e.g. if the
    // bond is connected to an atom with a label as opposed
    // to when it is connected to a Carbon atom w/o a label
    // please refer to: ketcher-core/docs/data/hover_selection_2.png
    let halfEdgeStart = Coordinates.modelToCanvas(firstHalfEdge.position);
    let halfEdgeEnd = Coordinates.modelToCanvas(secondHalfEdge.position);

    halfEdgeStart = this.shiftPositionIfAtomLabelVisible(
      halfEdgeStart,
      this.bond.firstAtom,
      firstHalfEdge,
    );

    halfEdgeEnd = this.shiftPositionIfAtomLabelVisible(
      halfEdgeEnd,
      this.bond.secondAtom,
      secondHalfEdge,
    );

    const isStereoBond = bond.stereo !== 0 && bond.stereo !== 3;

    const addPadding = isStereoBond ? 0 : -2;

    // find the points on the line where we will be drawing the curves
    const contourStart = Vec2.getLinePoint(
      halfEdgeEnd,
      halfEdgeStart,
      addPadding,
    );
    const contourEnd = Vec2.getLinePoint(
      halfEdgeStart,
      halfEdgeEnd,
      addPadding,
    );

    const stereoBondStartHeightCoef = 0.5;
    const bondPadding = 0.5;
    const addStart = isStereoBond
      ? stereoBondWidth * stereoBondStartHeightCoef
      : regularSelectionThikness + bondPadding;
    const stereoBondEndHeightCoef = 1;
    const addEnd = isStereoBond
      ? stereoBondWidth +
        (regularSelectionThikness * stereoBondEndHeightCoef) / stereoBondWidth
      : regularSelectionThikness + bondPadding;

    const contourPaddedStart = Vec2.getLinePoint(
      contourStart,
      contourEnd,
      addEnd,
    );
    const contourPaddedEnd = Vec2.getLinePoint(
      contourEnd,
      contourStart,
      addStart,
    );

    // we need four points for each bezier curve
    // and two for each line that together form the selection contour
    // the padded values are for the curve points and the rest of
    // the values are for drawing the lines
    // please refer to: ketcher-core/docs/data/hover_selection_3.png
    const startPoint = contourStart.add(new Vec2(addEnd, 0));
    const endPoint = contourEnd.add(new Vec2(addStart, 0));
    const padStartPoint = contourPaddedStart.add(new Vec2(addEnd, 0));
    const padEndPoint = contourPaddedEnd.add(new Vec2(addStart, 0));

    const angle =
      (Math.atan2(firstHalfEdge.direction.y, firstHalfEdge.direction.x) * 180) /
      Math.PI;

    // rotate the points +/-90 degrees to find the
    // perpendicular points that will be used for actual drawing
    // of selection contour on canvas
    const startTop = startPoint.rotateAroundOrigin(
      angle + 90,
      new Vec2(contourStart.x, contourStart.y),
    );
    const startBottom = startPoint.rotateAroundOrigin(
      angle - 90,
      new Vec2(contourStart.x, contourStart.y),
    );
    const startPadTop = padStartPoint.rotateAroundOrigin(
      angle + 90,
      contourPaddedStart,
    );
    const startPadBottom = padStartPoint.rotateAroundOrigin(
      angle - 90,
      contourPaddedStart,
    );
    const endTop = endPoint.rotateAroundOrigin(angle + 90, contourEnd);
    const endBottom = endPoint.rotateAroundOrigin(angle - 90, contourEnd);
    const endPadTop = padEndPoint.rotateAroundOrigin(
      angle + 90,
      contourPaddedEnd,
    );
    const endPadBottom = padEndPoint.rotateAroundOrigin(
      angle - 90,
      contourPaddedEnd,
    );

    return [
      startPadTop,
      startTop,
      endTop,
      endPadTop,
      endPadBottom,
      endBottom,
      startPadBottom,
      startBottom,
    ];
  }

  private getSelectionContour() {
    const [
      startPadTop,
      startTop,
      endTop,
      endPadTop,
      endPadBottom,
      endBottom,
      startPadBottom,
      startBottom,
    ] = this.getSelectionPoints();

    // for a visual representation of the points
    // please refer to: ketcher-core/docs/data/hover_selection_exp.png
    const pathString = `
      M ${startTop.x} ${startTop.y}
      L ${endTop.x} ${endTop.y}
      C ${endPadTop.x} ${endPadTop.y}, ${endPadBottom.x} ${endPadBottom.y}, ${endBottom.x} ${endBottom.y}
      L ${startBottom.x} ${startBottom.y}
      C ${startPadBottom.x} ${startPadBottom.y}, ${startPadTop.x} ${startPadTop.y}, ${startTop.x} ${startTop.y}
    `;

    return pathString;
  }

  public moveSelection() {
    if (!this.rootElement) {
      return;
    }

    this.drawSelection();
    this.move();
  }

  show() {
    this.rootElement = this.appendRootElement();
    const editor = CoreEditor.provideEditorInstance();
    const viewModel = editor.viewModel;
    const halfEdges = viewModel.bondsToHalfEdges.get(this.bond);
    const firstHalfEdge = halfEdges?.[0];
    const secondHalfEdge = halfEdges?.[1];
    const bondSpace = 6;
    const linesOffset = bondSpace / 2;
    const stereoBondWidth = 6;

    if (!firstHalfEdge || !secondHalfEdge) {
      KetcherLogger.warn(
        'Failed to draw double bond. There is no no half edges.',
      );

      return;
    }

    if (this.bond.type === 2) {
      let bondStartPosition = Coordinates.modelToCanvas(
        firstHalfEdge.position,
      ).sub(this.scaledPosition.startPosition);
      let bondEndPosition = Coordinates.modelToCanvas(
        secondHalfEdge.position,
      ).sub(this.scaledPosition.startPosition);
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

      this.pathShape = `
          M${firstLineStartPosition.x},${firstLineStartPosition.y} 
          L${firstLineEndPosition.x},${firstLineEndPosition.y} 
          M${secondLineStartPosition.x},${secondLineStartPosition.y}      
          L${secondLineEndPosition.x},${secondLineEndPosition.y}
        `;

      this.rootElement
        .append('path')
        .attr('d', this.pathShape)
        .attr('stroke', 'black')
        .attr('stroke-width', `${BOND_WIDTH}px`)
        .on('mouseover', () => {
          this.appendHover();
        })
        .on('mouseout', () => {
          this.removeHover();
        });
    } else if (this.bond.type === 1) {
      if (this.bond.stereo === 1) {
        let bondStartPosition = Coordinates.modelToCanvas(
          firstHalfEdge.position,
        ).sub(this.scaledPosition.startPosition);
        let bondEndPosition = Coordinates.modelToCanvas(
          secondHalfEdge.position,
        ).sub(this.scaledPosition.startPosition);
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

        this.pathShape = `
          M${bondStartPosition.x},${bondStartPosition.y}
          L${bondEndFirstPoint.x},${bondEndFirstPoint.y}
          L${bondEndSecondPoint.x},${bondEndSecondPoint.y}
          Z
          `;

        this.rootElement
          .append('path')
          .attr('d', this.pathShape)
          .attr('stroke', '#000')
          .attr('stroke-width', 2)
          .attr('stroke-linecap', 'round')
          .attr('stroke-linejoin', 'round')
          .on('mouseenter', () => {
            this.appendHover();
          })
          .on('mouseleave', () => {
            this.removeHover();
          });
      } else if (this.bond.stereo === 6) {
        let bondStartPosition = Coordinates.modelToCanvas(
          firstHalfEdge.position,
        ).sub(this.scaledPosition.startPosition);
        let bondEndPosition = Coordinates.modelToCanvas(
          secondHalfEdge.position,
        ).sub(this.scaledPosition.startPosition);

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
        const offsetBetweenLines = 1.2 * BOND_WIDTH;
        const numberOfLines =
          Math.max(
            Math.floor(
              (bondLength - BOND_WIDTH) / (BOND_WIDTH + offsetBetweenLines),
            ),
            0,
          ) + 2;
        const step = bondLength / (numberOfLines - 1);
        const halfOfBondEndWidth = 0.7 * stereoBondWidth;

        let path = '';
        // TODO define proper names for variables below
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

          path += `
            M${p.x},${p.y}
            L${q.x},${q.y}
          `;
        }

        this.pathShape = path;

        this.rootElement
          .append('path')
          .attr('d', this.pathShape)
          .attr('stroke', '#000')
          .attr('stroke-width', 2)
          .attr('stroke-linecap', 'round')
          .attr('stroke-linejoin', 'round')
          .on('mouseenter', () => {
            this.appendHover();
          })
          .on('mouseleave', () => {
            this.removeHover();
          });
      } else {
        let startPosition = new Vec2(0, 0);
        let endPosition = this.scaledPosition.endPosition.sub(
          this.scaledPosition.startPosition,
        );

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

        this.pathShape = `M${startPosition.x},${startPosition.y} L${endPosition.x},${endPosition.y}`;

        this.rootElement
          .append('path')
          .attr('d', this.pathShape)
          .attr('stroke', 'black')
          .attr('stroke-width', `${BOND_WIDTH}px`)
          .on('mouseenter', () => {
            this.appendHover();
          })
          .on('mouseleave', () => {
            this.removeHover();
          });
      }
    }
  }

  public remove() {
    super.remove();
    this.removeHover();
    this.removeSelection();
  }

  public move() {
    if (!this.rootElement) {
      return;
    }

    this.remove();
    this.show();
  }

  protected appendHoverAreaElement(): void {}
}
