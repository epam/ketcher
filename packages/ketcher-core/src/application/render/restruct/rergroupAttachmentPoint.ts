import {
  attachmentPointDirection,
  attachmentPointGeometry,
  type AttachmentPointGeometry,
  ATTACHMENT_POINT_OUTLINE_PADDING,
} from 'application/render/geometry/atomGeometry';
import type { RaphaelPaper } from 'raphael';
import { AttachmentPoints } from 'domain/entities/atom';
import { Bond } from 'domain/entities/bond';
import type { RGroupAttachmentPoint } from 'domain/entities/rgroupAttachmentPoint';
import type { Struct } from 'domain/entities/struct';
import { Vec2 } from 'domain/entities/vec2';
import { Scale } from 'domain/helpers';
import type ReAtom from './reatom';
import ReObject from './reobject';
import type ReStruct from './restruct';
import draw from '../draw';
import type { Render } from '../raphaelRender';
import type { RenderOptions, RenderOptionStyles } from '../render.types';
import { LayerMap } from './generalEnumTypes';
import type Visel from './visel';

type AttachmentPointShape = {
  items?: Array<{ node?: SVGElement | null }>;
  node?: SVGElement | null;
};

class ReRGroupAttachmentPoint extends ReObject {
  item: RGroupAttachmentPoint;
  reAtom: ReAtom;
  lineDirectionVector: Vec2 = new Vec2();

  static readonly LINE_OUTLINE_WIDTH = 0.36;
  static readonly OUTLINE_PADDING = ATTACHMENT_POINT_OUTLINE_PADDING;
  static readonly CURVE_OUTLINE_WIDTH = 1;
  static readonly CURVE_OUTLINE_HEIGHT = 0.42;

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

  private readonly makeHighlightePlate = (
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
    const geometry = getAttachmentPointGeometry(
      this.reAtom,
      restruct.render.options,
      directionVector,
    );
    this.lineDirectionVector = directionVector;

    const attachmentPointShape = showAttachmentPointShape(
      restruct.render,
      geometry,
      directionVector,
      restruct.addReObjectPath.bind(restruct),
      this.visel,
    );
    this.addTestAttributes(attachmentPointShape);

    const showLabel = isAttachmentPointLabelRequired(restruct);
    if (showLabel) {
      // in case of isTrisectionRequired (trisection case) we should show labels '1' and '2' for those separated vectors
      const labelText = this.item.type === 'primary' ? '1' : '2';
      showAttachmentPointLabel(
        restruct.render,
        geometry,
        restruct.addReObjectPath.bind(restruct),
        labelText,
        this.reAtom.color,
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

  private addTestAttributes(attachmentPointShape: AttachmentPointShape) {
    const attachmentPointElement = attachmentPointShape.items
      ? attachmentPointShape.items[0]?.node
      : attachmentPointShape.node;

    if (!attachmentPointElement) {
      return;
    }

    attachmentPointElement.dataset.testid = 'attachment-point';
    attachmentPointElement.dataset.primaryOrSecondary = this.item.type;
    attachmentPointElement.dataset.attachedToAtomid = String(this.item.atomId);
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
    const neighbors = this.reAtom.a.neighbors.flatMap((id) => {
      const halfBond = struct.halfBonds.get(id);
      if (!halfBond) {
        if (this.reAtom.a.neighbors.length === 1) {
          throw new Error(
            `HalfBond not found for neighbor id ${id} while resolving R-group attachment point direction`,
          );
        }
        return [];
      }
      return [
        {
          angle: halfBond.ang,
          isTriple:
            struct.bonds.get(halfBond.bid)?.type === Bond.PATTERN.TYPE.TRIPLE,
        },
      ];
    });
    return attachmentPointDirection(
      neighbors,
      this.item.type,
      this.isTrisectionAttachmentPoint(),
    );
  }

  private isTrisectionAttachmentPoint(): boolean {
    // in this case we should split the attachment point vector to two vectors
    return this.reAtom.a.attachmentPoints === AttachmentPoints.BothSides;
  }
}

function showAttachmentPointShape(
  { options, paper }: Render,
  geometry: AttachmentPointGeometry,
  directionVector: Vec2,
  addReObjectPath: InstanceType<typeof ReStruct>['addReObjectPath'],
  visel: Visel,
): AttachmentPointShape {
  const resultShape = draw.rgroupAttachmentPoint(
    paper,
    geometry.shiftedStemStart,
    geometry.attachmentPointEnd,
    directionVector,
    options,
  );

  addReObjectPath(
    LayerMap.indices,
    visel,
    resultShape,
    geometry.atomPositionVector,
    true,
  );

  return resultShape;
}

function isAttachmentPointLabelRequired(restruct: ReStruct) {
  return restruct.molecule.atoms.some(
    ({ attachmentPoints }) =>
      attachmentPoints === AttachmentPoints.SecondSideOnly ||
      attachmentPoints === AttachmentPoints.BothSides,
  );
}

function showAttachmentPointLabel(
  { options, paper }: Render,
  geometry: AttachmentPointGeometry,
  addReObjectPath: InstanceType<typeof ReStruct>['addReObjectPath'],
  labelText: string,
  atomColor: string,
  visel: Visel,
): void {
  const labelPath = draw.rgroupAttachmentPointLabel(
    paper,
    geometry.labelPosition,
    labelText,
    options,
    atomColor,
  );
  addReObjectPath(
    LayerMap.indices,
    visel,
    labelPath,
    geometry.atomPositionVector,
    true,
  );
}

function getAttachmentPointGeometry(
  atom: ReAtom,
  options: RenderOptions,
  directionVector: Vec2,
): AttachmentPointGeometry {
  return attachmentPointGeometry(
    Scale.modelToCanvas(atom.a.pp, options),
    directionVector,
    options.microModeScale,
    atom.getShiftedSegmentPosition(options, directionVector),
  );
}

export { ReRGroupAttachmentPoint };
