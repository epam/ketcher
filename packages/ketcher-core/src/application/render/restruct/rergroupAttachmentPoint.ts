import {
  Bond,
  Box2Abs,
  RGroupAttachmentPoint,
  RGroupAttachmentPointType,
  Struct,
  Vec2,
} from 'domain/entities';
import { Scale } from 'domain/helpers';
import { ReAtom, ReObject, ReStruct } from '.';
import draw from '../draw';
import { Render } from '../raphaelRender';
import { LayerMap } from './generalEnumTypes';
import Visel from './visel';

class ReRGroupAttachmentPoint extends ReObject {
  item: RGroupAttachmentPoint;
  reAtom: ReAtom;

  constructor(item: RGroupAttachmentPoint, reAtom: ReAtom) {
    super('rgroupAttachmentPoint');
    this.item = item;
    this.reAtom = reAtom;
  }

  static isSelectable() {
    return false;
  }

  /**
   * Why?
   * We need to return Bounding box for the attachment points for this atom,
   * to be able to correctly calculate boundaries for autoscaling and positioning
   */
  getVBoxObj(render: Render): Box2Abs | null {
    let accumulatedBBox: Box2Abs | null = null;
    const directionVector = this.getAttachmentPointDirectionVector(
      render.ctab.molecule,
    );
    if (!directionVector) {
      return null;
    }
    const attachmentPointEndPosition = this.reAtom.a.pp.add(directionVector);
    const attachmentPointEndBoundingBox = new Box2Abs(
      attachmentPointEndPosition,
      attachmentPointEndPosition,
    );
    accumulatedBBox = accumulatedBBox
      ? Box2Abs.union(accumulatedBBox, attachmentPointEndBoundingBox)
      : attachmentPointEndBoundingBox;
    return accumulatedBBox;
  }

  show(restruct: ReStruct) {
    const directionVector = this.getAttachmentPointDirectionVector(
      restruct.molecule,
    );

    if (!directionVector) {
      return;
    }

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
      const labelText = this.item.attachmentPointType === 'primary' ? '1' : '2';
      showAttachmentPointLabel(
        this.reAtom,
        restruct.render,
        directionVector,
        restruct.addReObjectPath.bind(restruct),
        labelText,
        this.visel,
      );
    }
  }

  private getAttachmentPointDirectionVector(struct: Struct) {
    if (!this.reAtom.hasAttachmentPoint()) {
      return;
    }
    if (this.isTrisectionAttachmentPoint()) {
      return trisectionLargestSector(
        this.reAtom,
        struct,
        this.item.attachmentPointType,
      );
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
    return this.reAtom.a.attpnt === 3;
  }
}

function showAttachmentPointShape(
  atom: ReAtom,
  { options, paper }: Render,
  directionVector: Vec2,
  addReObjectPath: InstanceType<typeof ReStruct>['addReObjectPath'],
  visel: Visel,
): void {
  const atomPositionVector = Scale.obj2scaled(atom.a.pp, options);
  const shiftedAtomPositionVector = atom.getShiftedSegmentPosition(
    options,
    directionVector,
  );
  const attachmentPointEnd = atomPositionVector.addScaled(
    directionVector,
    options.scale * 0.85,
  );

  const resultShape = draw.rgroupAttachmentPoint(
    paper,
    shiftedAtomPositionVector,
    attachmentPointEnd,
    directionVector,
    options,
  );

  addReObjectPath(LayerMap.indices, visel, resultShape, atomPositionVector);
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
  // in case of having 2 or 3 attachment point type we have to render
  // 2 - Secondary type
  // 3 - Both Primary and Secondary - should be considered as two Attachment points
  return restruct.molecule.atoms.some(({ attpnt }) => [2, 3].includes(attpnt));
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
  const atomPositionVector = Scale.obj2scaled(atom.a.pp, options);
  const labelPosition = getLabelPositionForAttachmentPoint(
    atomPositionVector,
    directionVector,
    options.scale,
  );
  const labelPath = draw.rgroupAttachmentPointLabel(
    paper,
    labelPosition,
    labelText,
    options,
    atom.color,
  );
  addReObjectPath(LayerMap.indices, visel, labelPath, atomPositionVector);
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
