import { RaphaelPaper } from 'raphael';
import {
  AttachmentPoints,
  Bond,
  RGroupAttachmentPoint,
  RGroupAttachmentPointType,
  Struct,
  Vec2,
} from 'domain/entities';
import { Scale } from 'domain/helpers';
import { ReAtom, ReObject, ReStruct } from '.';
import draw from '../draw';
import { Render } from '../raphaelRender';
import { RenderOptions, RenderOptionStyles } from '../render.types';
import { LayerMap } from './generalEnumTypes';
import Visel from './visel';

class ReRGroupAttachmentPoint extends ReObject {
  item: RGroupAttachmentPoint;
  reAtom: ReAtom;
  lineDirectionVector: Vec2 = new Vec2();

  static LINE_OUTLINE_WIDTH = 0.36;
  static OUTLINE_PADDING = 0.15;
  static CURVE_OUTLINE_WIDTH = 1.0;
  static CURVE_OUTLINE_HEIGHT = 0.42;

  constructor(item: RGroupAttachmentPoint, reAtom: ReAtom) {
    super('rgroupAttachmentPoint');
    this.item = item;
    this.reAtom = reAtom;
  }

  get normalizedLineDirectionVector() {
    return this.lineDirectionVector.normalized();
  }

  get normalizedCurveDirectionVector() {
    return this.lineDirectionVector.rotate(Math.PI / 2).normalized();
  }

  get startPoint() {
    return this.reAtom.a.pp;
  }

  get middlePoint() {
    return this.outlineEndPoint.addScaled(
      this.normalizedLineDirectionVector,
      -ReRGroupAttachmentPoint.CURVE_OUTLINE_HEIGHT,
    );
  }

  get endPoint() {
    return this.startPoint.add(this.lineDirectionVector);
  }

  get outlineEndPoint() {
    const length =
      this.lineDirectionVector.length() +
      ReRGroupAttachmentPoint.OUTLINE_PADDING;
    return this.startPoint.addScaled(
      this.normalizedLineDirectionVector,
      length,
    );
  }

  static isSelectable() {
    return true;
  }

  getOutlinePoints(isHighlight = false) {
    const highlightPadding = isHighlight ? -0.1 : 0;
    const curveOutlineWidth =
      ReRGroupAttachmentPoint.CURVE_OUTLINE_WIDTH + highlightPadding;
    const lineOutlineWidth =
      ReRGroupAttachmentPoint.LINE_OUTLINE_WIDTH + highlightPadding;

    const topLeftPadPoint = this.outlineEndPoint.addScaled(
      this.normalizedCurveDirectionVector,
      -curveOutlineWidth / 2,
    );
    const topLeftPoint = topLeftPadPoint.addScaled(
      this.normalizedCurveDirectionVector,
      ReRGroupAttachmentPoint.OUTLINE_PADDING,
    );
    const topRightPadPoint = this.outlineEndPoint.addScaled(
      this.normalizedCurveDirectionVector,
      curveOutlineWidth / 2,
    );
    const topRightPoint = topRightPadPoint.addScaled(
      this.normalizedCurveDirectionVector,
      -ReRGroupAttachmentPoint.OUTLINE_PADDING,
    );
    const middleMostLeftPadPoint = this.middlePoint.addScaled(
      this.normalizedCurveDirectionVector,
      -curveOutlineWidth / 2,
    );
    const middleMostLeftPoint = middleMostLeftPadPoint.addScaled(
      this.normalizedCurveDirectionVector,
      ReRGroupAttachmentPoint.OUTLINE_PADDING,
    );
    const middleMostRightPadPoint = this.middlePoint.addScaled(
      this.normalizedCurveDirectionVector,
      curveOutlineWidth / 2,
    );
    const middleMostRightPoint = middleMostRightPadPoint.addScaled(
      this.normalizedCurveDirectionVector,
      -ReRGroupAttachmentPoint.OUTLINE_PADDING,
    );
    const middleLeftPoint = this.middlePoint.addScaled(
      this.normalizedCurveDirectionVector,
      -lineOutlineWidth / 2,
    );
    const middleRightPoint = this.middlePoint.addScaled(
      this.normalizedCurveDirectionVector,
      lineOutlineWidth / 2,
    );
    const bottomLeftPadPoint = this.startPoint.addScaled(
      this.normalizedCurveDirectionVector,
      -lineOutlineWidth / 2,
    );
    const bottomLeftPoint = bottomLeftPadPoint.addScaled(
      this.normalizedLineDirectionVector,
      ReRGroupAttachmentPoint.OUTLINE_PADDING,
    );
    const bottomRightPadPoint = this.startPoint.addScaled(
      this.normalizedCurveDirectionVector,
      lineOutlineWidth / 2,
    );
    const bottomRightPoint = bottomRightPadPoint.addScaled(
      this.normalizedLineDirectionVector,
      ReRGroupAttachmentPoint.OUTLINE_PADDING,
    );

    return [
      topLeftPadPoint,
      topLeftPoint,
      topRightPoint,
      topRightPadPoint,
      middleMostRightPadPoint,
      middleMostRightPoint,
      middleRightPoint,
      bottomRightPoint,
      bottomRightPadPoint,
      bottomLeftPadPoint,
      bottomLeftPoint,
      middleLeftPoint,
      middleMostLeftPoint,
      middleMostLeftPadPoint,
    ] as const;
  }

  getDistanceTo(destination: Vec2) {
    return Vec2.dist(destination, this.middlePoint);
  }

  private makeHighlightePlate = (
    restruct: ReStruct,
    style: RenderOptionStyles,
  ) => {
    const { paper, options } = restruct.render;
    const hoverPlatePath = this.getHoverPlatePath(options, true);
    return paper.path(hoverPlatePath).attr(options.selectionStyle).attr(style);
  };

  show(restruct: ReStruct, rgroupAttachmentPointId: number) {
    const directionVector = this.getAttachmentPointDirectionVector(
      restruct.molecule,
    );

    if (!directionVector) {
      return;
    }
    this.lineDirectionVector = directionVector;

    showAttachmentPointShape(
      this.reAtom,
      restruct.render,
      directionVector,
      restruct.addReObjectPath.bind(restruct),
      this.visel,
    );

    const showLabel = isAttachmentPointLabelRequired(restruct);
    if (showLabel) {
      // in case of isTrisectionRequired (trisection case) we should show labels '1' and '2' for those separated vectors
      const labelText = this.item.type === 'primary' ? '1' : '2';
      showAttachmentPointLabel(
        this.reAtom,
        restruct.render,
        directionVector,
        restruct.addReObjectPath.bind(restruct),
        labelText,
        this.visel,
      );
    }
    const highlights = restruct.molecule.highlights;
    let isHighlighted = false;
    let highlightColor = '';
    highlights.forEach((highlight) => {
      const hasCurrentHighlight = highlight.rgroupAttachmentPoints?.includes(
        rgroupAttachmentPointId,
      );
      isHighlighted = isHighlighted || hasCurrentHighlight;
      if (hasCurrentHighlight) {
        highlightColor = highlight.color;
      }
    });
    if (isHighlighted) {
      const style = { fill: highlightColor, stroke: 'none' };
      const path = this.makeHighlightePlate(restruct, style);
      restruct.addReObjectPath(LayerMap.hovering, this.visel, path);
    }
  }

  private getHoverPlatePath(options: RenderOptions, isHighlight = false) {
    const outlinePoints = this.getOutlinePoints(isHighlight);
    const scaledOutlinePoints = outlinePoints.map((point) =>
      Scale.modelToCanvas(point, options),
    );
    const [
      topLeftPadPoint,
      topLeftPoint,
      topRightPoint,
      topRightPadPoint,
      middleMostRightPadPoint,
      middleMostRightPoint,
      middleRightPoint,
      bottomRightPoint,
      bottomRightPadPoint,
      bottomLeftPadPoint,
      bottomLeftPoint,
      middleLeftPoint,
      middleMostLeftPoint,
      middleMostLeftPadPoint,
    ] = scaledOutlinePoints;

    // Docs: ketcher-core/docs/data/hover_selection_rgroup_attachment_point.png
    const pathString = `
      M ${topLeftPoint.x} ${topLeftPoint.y}
      L ${topRightPoint.x} ${topRightPoint.y}
      C ${topRightPadPoint.x} ${topRightPadPoint.y}, ${middleMostRightPadPoint.x} ${middleMostRightPadPoint.y}, ${middleMostRightPoint.x} ${middleMostRightPoint.y}
      L ${middleRightPoint.x} ${middleRightPoint.y}
      L ${bottomRightPoint.x} ${bottomRightPoint.y}
      C ${bottomRightPadPoint.x} ${bottomRightPadPoint.y}, ${bottomLeftPadPoint.x} ${bottomLeftPadPoint.y}, ${bottomLeftPoint.x} ${bottomLeftPoint.y}
      L ${middleLeftPoint.x} ${middleLeftPoint.y}
      L ${middleMostLeftPoint.x} ${middleMostLeftPoint.y}
      C ${middleMostLeftPadPoint.x} ${middleMostLeftPadPoint.y}, ${topLeftPadPoint.x} ${topLeftPadPoint.y}, ${topLeftPoint.x} ${topLeftPoint.y}
    `;
    return pathString;
  }

  makeHoverPlate(render: Render) {
    const hoverPlatePath = this.getHoverPlatePath(render.options);
    return render.paper.path(hoverPlatePath).attr(render.options.hoverStyle);
  }

  makeSelectionPlate(
    _restruct: ReStruct,
    paper: RaphaelPaper,
    options: RenderOptions,
  ) {
    const hoverPlatePath = this.getHoverPlatePath(options);
    return paper.path(hoverPlatePath).attr(options.selectionStyle);
  }

  drawHover(render: Render) {
    const hoverPlate = this.makeHoverPlate(render);
    render.ctab.addReObjectPath(LayerMap.hovering, this.visel, hoverPlate);
    return hoverPlate;
  }

  private getAttachmentPointDirectionVector(struct: Struct) {
    if (!this.reAtom.hasAttachmentPoint()) {
      return;
    }
    if (this.isTrisectionAttachmentPoint()) {
      return trisectionLargestSector(this.reAtom, struct, this.item.type);
    } else {
      const hasOnlyOneBond = this.reAtom.a.neighbors.length === 1;
      const directionVector = hasOnlyOneBond
        ? getAttachmentDirectionForOnlyOneBond(this.reAtom, struct)
        : this.reAtom.bisectLargestSector(struct);
      return directionVector;
    }
  }

  private isTrisectionAttachmentPoint(): boolean {
    // in this case we should split the attachment point vector to two vectors
    return this.reAtom.a.attachmentPoints === AttachmentPoints.BothSides;
  }
}

function showAttachmentPointShape(
  atom: ReAtom,
  { options, paper }: Render,
  directionVector: Vec2,
  addReObjectPath: InstanceType<typeof ReStruct>['addReObjectPath'],
  visel: Visel,
): void {
  const atomPositionVector = Scale.modelToCanvas(atom.a.pp, options);
  const shiftedAtomPositionVector = atom.getShiftedSegmentPosition(
    options,
    directionVector,
  );
  const attachmentPointEnd = atomPositionVector.addScaled(
    directionVector,
    options.microModeScale * 0.85,
  );

  const resultShape = draw.rgroupAttachmentPoint(
    paper,
    shiftedAtomPositionVector,
    attachmentPointEnd,
    directionVector,
    options,
  );

  addReObjectPath(
    LayerMap.indices,
    visel,
    resultShape,
    atomPositionVector,
    true,
  );
}

function trisectionLargestSector(
  atom: ReAtom,
  struct: Struct,
  attachmentPointType: RGroupAttachmentPointType,
) {
  const { largestAngle, neighborAngle } =
    atom.getLargestSectorFromNeighbors(struct);
  const firstTrisectorAngle = neighborAngle + largestAngle / 3;
  const secondTrisectorAngle = neighborAngle + (largestAngle * 2) / 3;

  return attachmentPointType === 'primary'
    ? newVectorFromAngle(firstTrisectorAngle)
    : newVectorFromAngle(secondTrisectorAngle);
}

function newVectorFromAngle(angle: number): Vec2 {
  return new Vec2(Math.cos(angle), Math.sin(angle));
}

function isAttachmentPointLabelRequired(restruct: ReStruct) {
  return restruct.molecule.atoms.some(
    ({ attachmentPoints }) =>
      attachmentPoints === AttachmentPoints.SecondSideOnly ||
      attachmentPoints === AttachmentPoints.BothSides,
  );
}

function getAttachmentDirectionForOnlyOneBond(
  atom: ReAtom,
  struct: Struct,
): Vec2 {
  const DEGREE_120_FOR_ONE_BOND = (2 * Math.PI) / 3;
  const DEGREE_180_FOR_TRIPLE_BOND = Math.PI;
  const onlyNeighbor = atom.a.neighbors[0];
  // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
  const neighbour = struct.halfBonds.get(onlyNeighbor)!;
  const angle = neighbour.ang;
  const isTripleBond =
    struct.bonds.get(neighbour.bid)?.type === Bond.PATTERN.TYPE.TRIPLE;
  const finalAngle =
    angle +
    (isTripleBond ? DEGREE_180_FOR_TRIPLE_BOND : DEGREE_120_FOR_ONE_BOND);
  return newVectorFromAngle(finalAngle);
}

function showAttachmentPointLabel(
  atom: ReAtom,
  { options, paper }: Render,
  directionVector: Vec2,
  addReObjectPath: InstanceType<typeof ReStruct>['addReObjectPath'],
  labelText: string,
  visel: Visel,
): void {
  const atomPositionVector = Scale.modelToCanvas(atom.a.pp, options);
  const labelPosition = getLabelPositionForAttachmentPoint(
    atomPositionVector,
    directionVector,
    options.microModeScale,
  );
  const labelPath = draw.rgroupAttachmentPointLabel(
    paper,
    labelPosition,
    labelText,
    options,
    atom.color,
  );
  addReObjectPath(LayerMap.indices, visel, labelPath, atomPositionVector, true);
}

function getLabelPositionForAttachmentPoint(
  atomPositionVector: Vec2,
  directionVector: Vec2,
  shapeHeight: number,
): Vec2 {
  const normal = directionVector.rotateSC(1, 0);
  return atomPositionVector
    .addScaled(normal, 0.17 * shapeHeight)
    .addScaled(directionVector, shapeHeight * 0.7);
}

export { ReRGroupAttachmentPoint };
