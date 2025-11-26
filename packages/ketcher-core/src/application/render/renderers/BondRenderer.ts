import { BaseRenderer } from 'application/render/renderers/BaseRenderer';
import { Atom } from 'domain/entities/CoreAtom';
import { Coordinates } from 'application/editor/shared/coordinates';
import { Bond, BondStereo, BondType } from 'domain/entities/CoreBond';
import { Bond as MoleculeBond } from 'domain/entities/bond';
import { Scale } from 'domain/helpers';
import { Box2Abs, Vec2 } from 'domain/entities';
import { CoreEditor } from 'application/editor';
import { HalfEdge } from 'application/render/view-model/HalfEdge';
import { ViewModel } from 'application/render/view-model/ViewModel';
import { KetcherLogger } from 'utilities';
import { D3SvgElementSelection } from 'application/render/types';
import {
  SVGPathAttributes,
  BondVectors,
} from 'application/render/renderers/BondPathRenderer/constants';
import {
  DoubleBondPathRenderer,
  DoubleCisTransBondPathRenderer,
  SingleBondPathRenderer,
  SingleDoubleBondPathRenderer,
  SingleDownBondPathRenderer,
  SingleUpBondPathRenderer,
  SingleUpDownBondPathRenderer,
  TripleBondPathRenderer,
} from 'application/render/renderers/BondPathRenderer';
import util from 'application/render/util';

const BOND_WIDTH = 2;
const LINE_WIDTH = 1.3;
const BOND_SPACE = 4.2;

export class BondRenderer extends BaseRenderer {
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

  private get scaledCenter() {
    return Scale.modelToCanvas(this.bond.center, this.editorSettings);
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
    if (!atom.renderer?.isLabelVisible) {
      return position;
    }

    const atomLabelBBoxes = atom.renderer?.labelBBoxes;
    const atomPositionInPixels = atom.renderer.scaledPosition;
    let shiftValue = 0;

    atomLabelBBoxes?.forEach((labelSymbolBBox) => {
      const relativeLabelSymbolBox2Abs = new Box2Abs(
        labelSymbolBBox.x,
        labelSymbolBBox.y,
        labelSymbolBBox.x + labelSymbolBBox.width,
        labelSymbolBBox.y + labelSymbolBBox.height,
      );
      const absoluteLabelSymbolBox2Abs =
        relativeLabelSymbolBox2Abs.translate(atomPositionInPixels);

      shiftValue = Math.max(
        shiftValue,
        util.shiftRayBox(
          atomPositionInPixels,
          halfEdge.direction,
          absoluteLabelSymbolBox2Abs,
        ),
      );
    });

    return position.addScaled(halfEdge.direction, BOND_WIDTH + shiftValue);
  }

  private get cipElementId() {
    return `cip-bond-${this.bond.id}`;
  }

  private getBondFromMoleculeStruct() {
    return this.bond.firstAtom.monomer.monomerItem.struct?.bonds.get(
      this.bond.bondIdInMicroMode,
    );
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

    this.rootElement
      ?.select(`#${this.cipElementId} rect`)
      ?.attr('fill', '#57ff8f');
  }

  public removeSelection() {
    this.selectionElement?.remove();
    this.selectionElement = undefined;

    this.rootElement
      ?.select(`#${this.cipElementId} rect`)
      ?.attr('fill', '#f5f5f5');
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
    } else {
      this.removeSelection();
    }
  }

  private appendRootElement() {
    const rootElement = this.canvas
      .append('g')
      .data([this])
      .attr('data-testid', 'bond')
      .attr('data-bondtype', this.bond.type)
      .attr('data-bondstereo', this.bond.stereo)
      .attr('data-bondid', this.bond.id)
      .attr('data-fromatomid', this.bond.firstAtom.id)
      .attr('data-toatomid', this.bond.secondAtom.id);

    // Add topology and reacting center attributes from molecule struct if available
    const bondFromStruct = this.getBondFromMoleculeStruct();
    if (bondFromStruct) {
      rootElement.attr('data-topology', bondFromStruct.topology);
      rootElement.attr(
        'data-reacting-center',
        bondFromStruct.reactingCenterStatus,
      );
    }

    rootElement.attr(
      'transform',
      `translate(${this.scaledPosition.startPosition.x}, ${this.scaledPosition.startPosition.y})`,
    );

    return rootElement as never as D3SvgElementSelection<SVGGElement, void>;
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

  private createBondHoverablePath(paths: SVGPathAttributes[]): void {
    if (!this.rootElement) {
      return;
    }

    paths.forEach(({ d, attrs }) => {
      const path = this.rootElement
        ?.append('path')
        .attr('d', d)
        .attr('stroke', 'black')
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round');

      Object.entries(attrs).forEach(([key, value]) => {
        path?.attr(key, value);
      });
    });

    const combinedPath = paths.reduce((acc, { d }) => {
      return acc + d;
    }, '');

    const combinedPathWidth = paths.reduce((acc, { attrs }) => {
      const strokeWidth = Number(attrs['stroke-width'] ?? BOND_WIDTH);
      return acc + strokeWidth;
    }, 0);

    const hoverPath = this.rootElement
      .append('path')
      .attr('d', combinedPath)
      .attr('fill', 'none')
      .attr('stroke', 'transparent')
      // BOND_WIDTH_HOVER was replaced with 4 because otherwise - hover area for bond is too big
      // and it is bad if triple bond is close to another bond (double in my case - see
      // ketcher/ketcher-autotests/KET/Micro-Macro-Switcher/Deleting a bonds in macromolecules mode test.ket)
      .attr('stroke-width', `${combinedPathWidth * 4}`);

    hoverPath
      .on('mouseenter', () => {
        this.appendHover();
      })
      .on('mouseleave', () => {
        this.removeHover();
      });
  }

  private get halfEdges() {
    const editor = CoreEditor.provideEditorInstance();
    const viewModel = editor.viewModel;
    return viewModel.bondsToHalfEdges.get(this.bond);
  }

  private get bondVectors(): BondVectors | undefined {
    const halfEdges = this.halfEdges;
    const firstHalfEdge = halfEdges?.[0];
    const secondHalfEdge = halfEdges?.[1];

    if (!firstHalfEdge || !secondHalfEdge) {
      return undefined;
    }

    let startPosition = new Vec2(0, 0);
    let endPosition = Coordinates.modelToCanvas(secondHalfEdge.position).sub(
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

    return {
      startPosition,
      endPosition,
      firstHalfEdge,
      secondHalfEdge,
    };
  }

  show() {
    const editor = CoreEditor.provideEditorInstance();
    const viewModel = editor.viewModel;

    this.rootElement = this.rootElement || this.appendRootElement();

    const bondVectors = this.bondVectors;
    if (!bondVectors) {
      KetcherLogger.warn('Failed to draw a bond. No half edges found.');
      return;
    }

    let bondSVGPaths: SVGPathAttributes[] = [];
    switch (this.bond.type) {
      case BondType.Single:
        if (this.bond.stereo === BondStereo.Up) {
          bondSVGPaths = SingleUpBondPathRenderer.preparePaths(bondVectors);
        } else if (this.bond.stereo === BondStereo.Down) {
          bondSVGPaths = SingleDownBondPathRenderer.preparePaths(bondVectors);
        } else if (this.bond.stereo === BondStereo.Either) {
          bondSVGPaths = SingleUpDownBondPathRenderer.preparePaths(bondVectors);
        } else {
          bondSVGPaths = SingleBondPathRenderer.preparePaths(bondVectors);
        }
        break;

      case BondType.Double:
        if (this.bond.stereo === BondStereo.CisTrans) {
          bondSVGPaths =
            DoubleCisTransBondPathRenderer.preparePaths(bondVectors);
        } else {
          bondSVGPaths = DoubleBondPathRenderer.preparePaths(
            bondVectors,
            this.getDoubleBondShift(
              viewModel,
              bondVectors.firstHalfEdge,
              bondVectors.secondHalfEdge,
            ),
          );
        }
        break;

      case BondType.Triple:
        bondSVGPaths = TripleBondPathRenderer.preparePaths(bondVectors);
        break;

      case BondType.Aromatic:
      case BondType.SingleAromatic:
      case BondType.DoubleAromatic:
        bondSVGPaths = DoubleBondPathRenderer.preparePaths(
          bondVectors,
          this.getDoubleBondShift(
            viewModel,
            bondVectors.firstHalfEdge,
            bondVectors.secondHalfEdge,
          ),
          this.bond.type,
        );
        break;

      case BondType.SingleDouble:
        bondSVGPaths = SingleDoubleBondPathRenderer.preparePaths(bondVectors);
        break;

      case BondType.Any:
      case BondType.Dative:
      case BondType.Hydrogen:
        bondSVGPaths = SingleBondPathRenderer.preparePaths(
          bondVectors,
          this.bond.type,
        );
        break;

      default:
        break;
    }

    this.createBondHoverablePath(bondSVGPaths);

    this.appendBondProperties();
    this.appendStereochemistry();
  }

  private get topologyElementId() {
    return `topology-bond-${this.bond.id}`;
  }

  private get reactingCenterElementId() {
    return `reacting-center-bond-${this.bond.id}`;
  }

  private appendBondProperties() {
    const bondFromStruct = this.getBondFromMoleculeStruct();
    if (!bondFromStruct) {
      return;
    }

    this.appendTopologyMark(bondFromStruct);
    this.appendReactingCenterMark(bondFromStruct);
  }

  private appendTopologyMark(bondFromStruct: MoleculeBond) {
    let mark: string | null = null;

    if (bondFromStruct.customQuery) {
      mark = bondFromStruct.customQuery;
      if (bondFromStruct.customQuery.length > 8) {
        mark = `${bondFromStruct.customQuery.substring(0, 8)}...`;
      }
    } else if (bondFromStruct.topology === MoleculeBond.PATTERN.TOPOLOGY.RING) {
      mark = 'rng';
    } else if (
      bondFromStruct.topology === MoleculeBond.PATTERN.TOPOLOGY.CHAIN
    ) {
      mark = 'chn';
    }

    if (!mark) {
      return;
    }

    const halfEdges = this.halfEdges;
    const firstHalfEdge = halfEdges?.[0];
    const secondHalfEdge = halfEdges?.[1];

    if (!firstHalfEdge || !secondHalfEdge) {
      return;
    }

    const bondVectors = this.bondVectors;
    if (!bondVectors) {
      return;
    }

    // Calculate center position in local coordinates
    const center = bondVectors.endPosition
      .add(bondVectors.startPosition)
      .scaled(0.5);
    const direction = bondVectors.endPosition
      .sub(bondVectors.startPosition)
      .normalized();
    let normal = new Vec2(-direction.y, direction.x);

    // Adjust position based on double bond shift
    const doubleBondShift = this.getDoubleBondShift(
      CoreEditor.provideEditorInstance().viewModel,
      firstHalfEdge,
      secondHalfEdge,
    );

    let fixed = LINE_WIDTH;
    if (doubleBondShift > 0) {
      normal = normal.scaled(-doubleBondShift);
    } else if (doubleBondShift === 0) {
      fixed += BOND_SPACE / 2;
    }

    const offset = new Vec2(2, 1).scaled(BOND_SPACE);
    if (bondFromStruct.type === MoleculeBond.PATTERN.TYPE.TRIPLE) {
      fixed += BOND_SPACE;
    }

    const position = center.add(
      new Vec2(normal.x * (offset.x + fixed), normal.y * (offset.y + fixed)),
    );

    const topologyGroup = this.rootElement
      ?.append('g')
      ?.attr('id', this.topologyElementId);

    const topologyText = topologyGroup
      ?.append('text')
      .text(mark)
      .attr('font-family', 'Arial')
      .attr('font-size', '10px')
      .attr('fill', '#000')
      .attr('pointer-events', 'none');

    const textNode = topologyText?.node();
    if (textNode) {
      const box = textNode.getBBox();
      topologyText
        ?.attr('x', position.x - box.width / 2)
        ?.attr('y', position.y + box.height / 4);
    }
  }

  private appendReactingCenterMark(bondFromStruct: MoleculeBond) {
    const reactingCenterStatus = bondFromStruct.reactingCenterStatus;

    if (
      reactingCenterStatus === null ||
      reactingCenterStatus === undefined ||
      reactingCenterStatus === MoleculeBond.PATTERN.REACTING_CENTER.UNMARKED
    ) {
      return;
    }

    const bondVectors = this.bondVectors;
    if (!bondVectors) {
      return;
    }

    // Calculate center and direction in local coordinates
    const center = bondVectors.endPosition
      .add(bondVectors.startPosition)
      .scaled(0.5);
    const direction = bondVectors.endPosition
      .sub(bondVectors.startPosition)
      .normalized();
    const normal = new Vec2(-direction.y, direction.x);

    const lw = LINE_WIDTH;
    const bs = BOND_SPACE / 2;
    const alongIntRc = lw;
    const alongIntMadeBroken = 2 * lw;
    const alongSz = 1.5 * bs;
    const acrossInt = 1.5 * bs;
    const acrossSz = 3.0 * bs;
    const tiltTan = 0.2;

    const points: Vec2[] = [];

    switch (reactingCenterStatus) {
      case MoleculeBond.PATTERN.REACTING_CENTER.NOT_CENTER: // X
        points.push(
          center
            .addScaled(normal, acrossSz)
            .addScaled(direction, tiltTan * acrossSz),
        );
        points.push(
          center
            .addScaled(normal, -acrossSz)
            .addScaled(direction, -tiltTan * acrossSz),
        );
        points.push(
          center
            .addScaled(normal, acrossSz)
            .addScaled(direction, -tiltTan * acrossSz),
        );
        points.push(
          center
            .addScaled(normal, -acrossSz)
            .addScaled(direction, tiltTan * acrossSz),
        );
        break;
      case MoleculeBond.PATTERN.REACTING_CENTER.CENTER: // #
        points.push(
          center
            .addScaled(normal, acrossSz)
            .addScaled(direction, tiltTan * acrossSz)
            .addScaled(direction, alongIntRc),
        );
        points.push(
          center
            .addScaled(normal, -acrossSz)
            .addScaled(direction, -tiltTan * acrossSz)
            .addScaled(direction, alongIntRc),
        );
        points.push(
          center
            .addScaled(normal, acrossSz)
            .addScaled(direction, tiltTan * acrossSz)
            .addScaled(direction, -alongIntRc),
        );
        points.push(
          center
            .addScaled(normal, -acrossSz)
            .addScaled(direction, -tiltTan * acrossSz)
            .addScaled(direction, -alongIntRc),
        );
        points.push(
          center.addScaled(direction, alongSz).addScaled(normal, acrossInt),
        );
        points.push(
          center.addScaled(direction, -alongSz).addScaled(normal, acrossInt),
        );
        points.push(
          center.addScaled(direction, alongSz).addScaled(normal, -acrossInt),
        );
        points.push(
          center.addScaled(direction, -alongSz).addScaled(normal, -acrossInt),
        );
        break;
      case MoleculeBond.PATTERN.REACTING_CENTER.MADE_OR_BROKEN: // ||
        points.push(
          center
            .addScaled(normal, acrossSz)
            .addScaled(direction, alongIntMadeBroken),
        );
        points.push(
          center
            .addScaled(normal, -acrossSz)
            .addScaled(direction, alongIntMadeBroken),
        );
        points.push(
          center
            .addScaled(normal, acrossSz)
            .addScaled(direction, -alongIntMadeBroken),
        );
        points.push(
          center
            .addScaled(normal, -acrossSz)
            .addScaled(direction, -alongIntMadeBroken),
        );
        break;
      case MoleculeBond.PATTERN.REACTING_CENTER.ORDER_CHANGED: // |
        points.push(center.addScaled(normal, acrossSz));
        points.push(center.addScaled(normal, -acrossSz));
        break;
      case MoleculeBond.PATTERN.REACTING_CENTER.MADE_OR_BROKEN_AND_CHANGED: // ||| combined
        points.push(
          center
            .addScaled(normal, acrossSz)
            .addScaled(direction, alongIntMadeBroken),
        );
        points.push(
          center
            .addScaled(normal, -acrossSz)
            .addScaled(direction, alongIntMadeBroken),
        );
        points.push(
          center
            .addScaled(normal, acrossSz)
            .addScaled(direction, -alongIntMadeBroken),
        );
        points.push(
          center
            .addScaled(normal, -acrossSz)
            .addScaled(direction, -alongIntMadeBroken),
        );
        points.push(center.addScaled(normal, acrossSz));
        points.push(center.addScaled(normal, -acrossSz));
        break;
      default:
        return;
    }

    if (points.length === 0) {
      return;
    }

    // Build path from point pairs
    let pathD = '';
    for (let i = 0; i < points.length; i += 2) {
      const p1 = points[i];
      const p2 = points[i + 1];
      if (p1 && p2) {
        pathD += `M${p1.x},${p1.y}L${p2.x},${p2.y}`;
      }
    }

    this.rootElement
      ?.append('path')
      .attr('id', this.reactingCenterElementId)
      .attr('d', pathD)
      .attr('stroke', 'black')
      .attr('stroke-width', LINE_WIDTH)
      .attr('fill', 'none')
      .attr('pointer-events', 'none');
  }

  private appendStereochemistry() {
    const cipValue = this.bond.cip;

    if (!cipValue) {
      return;
    }

    const cipGroup = this.rootElement
      ?.append('g')
      ?.attr('id', this.cipElementId);

    const cipText = cipGroup
      ?.append('text')
      .text(`(${cipValue})`)
      .attr('font-family', 'Arial')
      .attr('font-size', '13px')
      .attr('pointer-events', 'none');

    const textNode = cipText?.node();
    if (textNode) {
      const box = textNode.getBBox();
      cipText?.attr('x', 0)?.attr('y', -box.y);

      const rectWidth = box.width + 2;
      const rectHeight = box.height + 2;
      cipGroup
        ?.insert('rect', 'text')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', rectWidth)
        .attr('height', rectHeight)
        .attr('rx', 3)
        .attr('ry', 3)
        .attr('fill', '#f5f5f5');

      cipGroup?.attr(
        'transform',
        `
        translate(${-this.scaledPosition.startPosition.x}, ${-this
          .scaledPosition.startPosition.y})
        translate(${this.scaledCenter.x - rectWidth / 2}, ${
          this.scaledCenter.y - rectHeight / 2
        })
        `,
      );
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
