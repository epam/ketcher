import utils from 'application/editor/shared/utils';
import { ReStruct } from 'application/render';
import { Vec2 } from 'domain/entities';
import { OperationType } from '../OperationType';
import Base from '../base';

interface RxnArrowRotateData {
  id: number;
  angle: number;
  center: Vec2;
  noinvalidate?: boolean;
}

export class RxnArrowRotate extends Base {
  data: RxnArrowRotateData;

  constructor(id: number, angle: number, center: Vec2, noinvalidate?: boolean) {
    super(OperationType.RXN_ARROW_ROTATE);
    this.data = { id, angle, center, noinvalidate };
  }

  execute(reStruct: ReStruct) {
    const degree = utils.degrees(this.data.angle);

    const arrowId = this.data.id;
    const arrow = reStruct.molecule.rxnArrows.get(arrowId);
    if (arrow) {
      // Note: Struct and ReStruct are in two different systems,
      //       must manually update struct's position
      arrow.pos = arrow.pos.map((p) =>
        p.rotateAroundOrigin(degree, this.data.center)
      );
    }

    const options = reStruct.render.options;
    const drawingCenter = this.data.center
      .scaled(options.scale)
      .add(options.offset);

    reStruct.rxnArrows.get(arrowId)?.visel.rotate(degree, drawingCenter);

    if (!this.data.noinvalidate) {
      Base.invalidateItem(reStruct, 'rxnArrows', arrowId, 1);
    }
  }

  invert() {
    const move = new RxnArrowRotate(
      this.data.id,
      -this.data.angle,
      this.data.center,
      this.data.noinvalidate
    );
    return move;
  }
}
