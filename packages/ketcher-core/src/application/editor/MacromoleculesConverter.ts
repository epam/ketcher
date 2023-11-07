import {
  Atom,
  Bond,
  FunctionalGroup,
  Pile,
  SGroup,
  SGroupAttachmentPoint,
  Struct,
  Vec2,
} from 'domain/entities';
import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import { ReAtom, ReBond, ReSGroup, ReStruct } from 'application/render';
import { BaseMonomer } from 'domain/entities/BaseMonomer';
import { MonomerMicromolecule } from 'domain/entities/monomerMicromolecule';
import { Command } from 'domain/entities/Command';
import { MONOMER_CONST } from 'application/editor/operations/monomer/monomerFactory';
import { PolymerBond } from 'domain/entities/PolymerBond';
import assert from 'assert';
import { AttachmentPointName } from 'domain/types';

export class MacromoleculesConverter {
  private static convertMonomerToMonomerMicromolecule(
    monomer: BaseMonomer,
    struct: Struct,
  ) {
    const monomerMicromolecule = new MonomerMicromolecule(
      SGroup.TYPES.SUP,
      monomer,
    );
    const sgroupId = struct.sgroups.add(monomerMicromolecule);

    monomerMicromolecule.data.name = monomer.monomerItem.label;
    monomerMicromolecule.data.expanded = false;
    monomerMicromolecule.id = sgroupId;
    monomerMicromolecule.pp = monomer.position;

    return monomerMicromolecule;
  }

  private static addMonomerAtomToStruct(
    atom: Atom,
    monomer: BaseMonomer,
    monomerMicromolecule: MonomerMicromolecule,
    struct: Struct,
  ) {
    const atomClone = atom.clone();
    atomClone.pp = monomer.position.add(atom.pp);
    atomClone.sgs = new Pile<number>([monomerMicromolecule.id]);
    atomClone.fragment = -1;
    const atomId = struct.atoms.add(atomClone);
    monomerMicromolecule.atoms.push(atomId);
    if (atom.rglabel) {
      monomerMicromolecule.addAttachmentPoint(
        new SGroupAttachmentPoint(atomId, undefined, undefined),
      );
    }

    return { atomId, atom: atomClone };
  }

  /* attachmentPointName - R1, R2, ...
   * return number of attachment point with left binary shift:
   * [attachmentPointNumber]: [binaryShiftedAttachmentPointNumber]
   * 1: 1
   * 2: 2
   * 3: 4
   * 4: 8
   * 5: 16
   * 6: 32
   * It needs because attachment point 3 means that atom has two attachment points
   * */
  public static convertAttachmentPointNameToNumber(
    attachmentPointName: AttachmentPointName,
  ) {
    return 0 | (1 << (Number(attachmentPointName?.replace('R', '')) - 1));
  }

  private static findAttachmentPointAtom(
    sgroup: SGroup,
    polymerBond: PolymerBond,
    monomer: BaseMonomer,
    struct: Struct,
  ) {
    const attachmentPointName = monomer.getAttachmentPointByBond(polymerBond);
    assert(attachmentPointName);
    return sgroup.atoms.find(
      (atomId) =>
        Number(struct.atoms.get(atomId)?.rglabel) ===
        MacromoleculesConverter.convertAttachmentPointNameToNumber(
          attachmentPointName,
        ),
    );
  }

  public static convertDrawingEntitiesToStruct(
    drawingEntitiesManager: DrawingEntitiesManager,
    struct: Struct,
    reStruct?: ReStruct,
  ) {
    const monomerToSgroup = new Map<BaseMonomer, SGroup>();

    drawingEntitiesManager.micromoleculesHiddenEntities.mergeInto(struct);

    drawingEntitiesManager.clearMicromoleculesHiddenEntities();
    drawingEntitiesManager.monomers.forEach((monomer) => {
      if (monomer.monomerItem.props.isMicromoleculeFragment) {
        monomer.monomerItem.struct.mergeInto(struct);
      } else {
        const atomIdsMap = {};
        const monomerMicromolecule = this.convertMonomerToMonomerMicromolecule(
          monomer,
          struct,
        );
        monomerToSgroup.set(monomer, monomerMicromolecule);
        reStruct?.sgroups.set(
          monomerMicromolecule.id,
          new ReSGroup(monomerMicromolecule),
        );

        monomer.monomerItem.struct.atoms.forEach((oldAtom, oldAtomId) => {
          const { atom, atomId } = this.addMonomerAtomToStruct(
            oldAtom,
            monomer,
            monomerMicromolecule,
            struct,
          );
          atomIdsMap[oldAtomId] = atomId;
          reStruct?.atoms.set(atomId, new ReAtom(atom));
        });

        struct.sGroupForest.insert(monomerMicromolecule);
        monomer.monomerItem.struct.bonds.forEach((bond) => {
          const bondClone = bond.clone();
          bondClone.begin = atomIdsMap[bondClone.begin];
          bondClone.end = atomIdsMap[bondClone.end];
          const bondId = struct.bonds.add(bondClone);
          reStruct?.bonds.set(bondId, new ReBond(bondClone));
        });

        struct.functionalGroups.add(new FunctionalGroup(monomerMicromolecule));
      }
    });

    drawingEntitiesManager.polymerBonds.forEach((polymerBond) => {
      assert(polymerBond.secondMonomer);
      const bond = new Bond({
        type: Bond.PATTERN.TYPE.SINGLE,
        begin: this.findAttachmentPointAtom(
          monomerToSgroup.get(polymerBond.firstMonomer) as SGroup,
          polymerBond,
          polymerBond.firstMonomer,
          struct,
        ),
        end: this.findAttachmentPointAtom(
          monomerToSgroup.get(polymerBond.secondMonomer) as SGroup,
          polymerBond,
          polymerBond.secondMonomer,
          struct,
        ),
      });
      const bondId = struct.bonds.add(bond);
      reStruct?.bonds.set(bondId, new ReBond(bond));
    });

    return { struct, reStruct };
  }

  private static convertMonomerMicromoleculeToMonomer(
    monomerMicromolecule: MonomerMicromolecule,
    drawingEntitiesManager: DrawingEntitiesManager,
    sgroupToMonomer: Map<SGroup, BaseMonomer>,
  ) {
    const command = new Command();
    const monomerAdditionCommand = drawingEntitiesManager.addMonomer(
      monomerMicromolecule.monomer.monomerItem,
      monomerMicromolecule.pp as Vec2,
    );
    command.merge(monomerAdditionCommand);
    sgroupToMonomer.set(
      monomerMicromolecule,
      monomerAdditionCommand.operations[0].monomer as BaseMonomer,
    );

    return command;
  }

  private static convertFragmentToChem(
    fragmentNumber: number,
    fragmentStruct: Struct,
    drawingEntitiesManager: DrawingEntitiesManager,
  ) {
    const fragmentBbox = fragmentStruct.getCoordBoundingBox();
    return drawingEntitiesManager.addMonomer(
      {
        struct: fragmentStruct,
        label: 'F' + fragmentNumber,
        colorScheme: undefined,
        favorite: false,
        props: {
          Name: 'F' + fragmentNumber,
          MonomerNaturalAnalogCode: '',
          MonomerName: 'F' + fragmentNumber,
          MonomerType: MONOMER_CONST.CHEM,
          isMicromoleculeFragment: true,
        },
      },
      new Vec2(
        fragmentBbox.max.x - (fragmentBbox.max.x - fragmentBbox.min.x) / 2,
        fragmentBbox.max.y - (fragmentBbox.max.y - fragmentBbox.min.y) / 2,
      ),
    );
  }

  public static getAttachmentPointLabel(atomId: number, struct: Struct) {
    let attachmentPointLabel = '';
    const atomRglabel = Number(struct.atoms.get(atomId)?.rglabel);
    assert(Number.isInteger(atomRglabel));
    for (let rgi = 0; rgi < 32; rgi++) {
      if (atomRglabel & (1 << rgi)) {
        attachmentPointLabel = 'R' + (rgi + 1).toString();
      }
    }
    return attachmentPointLabel;
  }

  public static convertStructToDrawingEntities(
    struct: Struct,
    drawingEntitiesManager: DrawingEntitiesManager,
  ) {
    const sgroupToMonomer = new Map<SGroup, BaseMonomer>();
    const command = new Command();
    struct.sgroups.forEach((sgroup) => {
      if (sgroup instanceof MonomerMicromolecule) {
        command.merge(
          this.convertMonomerMicromoleculeToMonomer(
            sgroup,
            drawingEntitiesManager,
            sgroupToMonomer,
          ),
        );
      }
    });
    let fragmentNumber = 1;
    struct.frags.forEach((_fragment, fragmentId) => {
      const fragmentStruct = struct.getFragment(fragmentId, false);
      command.merge(
        this.convertFragmentToChem(
          fragmentNumber,
          fragmentStruct,
          drawingEntitiesManager,
        ),
      );
      fragmentNumber++;
    });
    struct.bonds.forEach((bond) => {
      const beginAtomSgroup = struct.getGroupFromAtomId(bond.begin);
      const endAtomSgroup = struct.getGroupFromAtomId(bond.end);
      const beginAtomAttachmentPointNumber =
        MacromoleculesConverter.getAttachmentPointLabel(bond.begin, struct);
      const endAtomAttachmentPointNumber =
        MacromoleculesConverter.getAttachmentPointLabel(bond.end, struct);
      if (
        beginAtomAttachmentPointNumber &&
        endAtomAttachmentPointNumber &&
        beginAtomSgroup instanceof MonomerMicromolecule &&
        endAtomSgroup instanceof MonomerMicromolecule
      ) {
        const { command: polymerBondAdditionCommand, polymerBond } =
          drawingEntitiesManager.addPolymerBond(
            sgroupToMonomer.get(beginAtomSgroup),
            sgroupToMonomer.get(beginAtomSgroup)?.position,
            sgroupToMonomer.get(endAtomSgroup)?.position,
          );
        command.merge(polymerBondAdditionCommand);

        const secondMonomer = sgroupToMonomer.get(endAtomSgroup);
        assert(secondMonomer);

        command.merge(
          drawingEntitiesManager.finishPolymerBondCreation(
            polymerBond,
            secondMonomer,
            beginAtomAttachmentPointNumber,
            endAtomAttachmentPointNumber,
          ),
        );
      }
    });
    drawingEntitiesManager.setMicromoleculesHiddenEntities(struct);

    return { drawingEntitiesManager, modelChanges: command };
  }
}
