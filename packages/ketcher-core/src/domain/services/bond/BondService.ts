import { fromPolymerBondDeletion } from 'application/editor/actions/polymerBond';
import { ReStruct } from 'application/render';
import { PolymerBond } from 'domain/entities/PolymerBond';
import { BaseMonomer } from 'domain/entities/BaseMonomer';
import assert from 'assert';

export class BondService {
  static deleteBondWithAllLinks(
    renderersContainer: ReStruct,
    polymerBond: PolymerBond,
    secondMonomer?: BaseMonomer,
  ) {
    fromPolymerBondDeletion(renderersContainer, polymerBond);
    secondMonomer
      ? secondMonomer.removePotentialBonds()
      : polymerBond.secondMonomer?.removePotentialBonds();
    polymerBond.firstMonomer.removePotentialBonds();
  }

  static finishBondCreation(
    firstMonomerAttachmentPoint: string,
    secondMonomerAttachmentPoint: string,
    secondMonomer: BaseMonomer,
    polymerBond: PolymerBond,
  ) {
    polymerBond.setSecondMonomer(secondMonomer);
    polymerBond.firstMonomer.setBond(firstMonomerAttachmentPoint, polymerBond);
    assert(polymerBond.secondMonomer);
    assert(secondMonomer.renderer);
    polymerBond.secondMonomer.setBond(
      secondMonomerAttachmentPoint,
      polymerBond,
    );
    polymerBond.firstMonomer.removePotentialBonds();
    polymerBond.secondMonomer.removePotentialBonds();

    polymerBond.moveBondEndAbsolute(
      secondMonomer.renderer.center.x,
      secondMonomer.renderer.center.y,
    );

    polymerBond.firstMonomer.turnOffSelection();
    polymerBond.secondMonomer.turnOffSelection();
  }
}
