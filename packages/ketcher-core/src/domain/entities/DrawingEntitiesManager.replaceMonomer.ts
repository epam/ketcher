import { BaseMonomer } from 'domain/entities/BaseMonomer';
import {
  AttachmentPointName,
  MonomerItemType,
  MonomerOrAmbiguousType,
} from 'domain/types';
import { Command } from 'domain/entities/Command';
import { PolymerBond } from 'domain/entities/PolymerBond';
import { Atom } from 'domain/entities/CoreAtom';
import { MonomerToAtomBond } from 'domain/entities/MonomerToAtomBond';
import assert from 'assert';

import { DrawingEntitiesManager } from './DrawingEntitiesManager';

export function replaceMonomer(
  drawingEntitiesManager: DrawingEntitiesManager,
  monomer: BaseMonomer,
  newMonomerItem: MonomerOrAmbiguousType,
): Command {
  const command = new Command();
  // TODO: monomer.hydrogenBonds
  const monomerId = monomer.id;

  const polymerBondInfoList: {
    id: number;
    firstMonomer: BaseMonomer;
    firstMonomerAttachmentPoint?: AttachmentPointName;
    secondMonomer?: BaseMonomer;
    secondMonomerAttachmentPoint?: AttachmentPointName;
    bond?: PolymerBond;
  }[] = Array.from(drawingEntitiesManager.polymerBonds)
    .filter(([_id, bond]) => {
      return bond.firstMonomer === monomer || bond.secondMonomer === monomer;
    })
    .map(([id, bond]) => {
      return {
        id,
        firstMonomer: bond.firstMonomer,
        firstMonomerAttachmentPoint: bond.firstMonomerAttachmentPoint,
        secondMonomer: bond.secondMonomer,
        secondMonomerAttachmentPoint: bond.secondMonomerAttachmentPoint,
        bond,
      };
    });
  const monomerToAtomBondInfoList: {
    id: number;
    monomer: BaseMonomer;
    attachmentPoint: AttachmentPointName;
    atom: Atom;
    bond?: MonomerToAtomBond;
  }[] = Array.from(drawingEntitiesManager.monomerToAtomBonds)
    .filter(([_id, bond]) => {
      return bond.monomer === monomer;
    })
    .map(([id, bond]) => {
      const attachmentPoint = Object.entries(
        monomer.attachmentPointsToBonds,
      ).find(([_ap, apBond]) => apBond === bond)?.[0] as AttachmentPointName;
      return {
        id,
        monomer: bond.monomer,
        attachmentPoint,
        atom: bond.atom,
        bond,
      };
    });

  for (const polymerBondInfo of polymerBondInfoList) {
    assert(polymerBondInfo.bond);
    // TODO: bond.selected ? see deleteMonomer method
    polymerBondInfo.bond.turnOnSelection();
    command.merge(
      drawingEntitiesManager.deletePolymerBond(polymerBondInfo.bond),
    );
    delete polymerBondInfo.bond;
  }

  for (const monomerToAtomBondInfo of monomerToAtomBondInfoList) {
    assert(monomerToAtomBondInfo.bond);
    command.merge(
      drawingEntitiesManager.deleteMonomerToAtomBond(
        monomerToAtomBondInfo.bond,
      ),
    );
    delete monomerToAtomBondInfo.bond;
  }

  command.merge(drawingEntitiesManager.deleteMonomer(monomer, true));
  const newMonomer: BaseMonomer = drawingEntitiesManager.createMonomer(
    newMonomerItem,
    monomer.position,
  );
  newMonomer.id = monomerId;
  command.merge(
    drawingEntitiesManager.addMonomer(
      new Proxy(newMonomerItem, {}) as MonomerItemType,
      monomer.position,
      newMonomer,
    ),
  );

  for (const polymerBondInfo of polymerBondInfoList) {
    if (
      !polymerBondInfo.firstMonomerAttachmentPoint ||
      !polymerBondInfo.secondMonomerAttachmentPoint ||
      !polymerBondInfo.secondMonomer
    )
      throw new Error(
        'Polymer bond requires both monomers and attachment points defined',
      );

    command.merge(
      drawingEntitiesManager.createPolymerBond(
        polymerBondInfo.firstMonomer === monomer
          ? newMonomer
          : polymerBondInfo.firstMonomer,
        polymerBondInfo.secondMonomer === monomer
          ? newMonomer
          : polymerBondInfo.secondMonomer,
        polymerBondInfo.firstMonomerAttachmentPoint,
        polymerBondInfo.secondMonomerAttachmentPoint,
      ),
    );
  }

  for (const monomerToAtomBondInfo of monomerToAtomBondInfoList) {
    command.merge(
      drawingEntitiesManager.addMonomerToAtomBond(
        monomerToAtomBondInfo.monomer,
        monomerToAtomBondInfo.atom,
        monomerToAtomBondInfo.attachmentPoint as AttachmentPointName,
      ),
    );
  }

  return command;
}

// declare module './DrawingEntitiesManager' {
//   interface DrawingEntitiesManager {
//     replaceMonomer(
//       monomer: BaseMonomer,
//       newMonomerItem: MonomerOrAmbiguousType,
//     ): Command;
//   }
// }
//
// DrawingEntitiesManager.prototype.replaceMonomer = function (
//   monomer: BaseMonomer,
//   newMonomerItem: MonomerOrAmbiguousType,
// ): Command {
//   return replaceMonomer(this, monomer, newMonomerItem);
// };
