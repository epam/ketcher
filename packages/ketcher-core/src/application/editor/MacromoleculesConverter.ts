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
import { getAttachmentPointLabel } from 'domain/helpers/attachmentPointCalculations';
import { isNumber } from 'lodash';

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

    return { atomId, atom: atomClone };
  }

  public static convertAttachmentPointNameToNumber(
    attachmentPointName: AttachmentPointName,
  ) {
    return Number(attachmentPointName?.replace('R', ''));
  }

  private static findAttachmentPointAtom(
    polymerBond: PolymerBond,
    monomer: BaseMonomer,
    monomerToAtomIdMap: Map<BaseMonomer, Map<number, number>>,
  ) {
    const attachmentPointName = monomer.getAttachmentPointByBond(polymerBond);
    assert(attachmentPointName);
    const attachmentPointNumber =
      MacromoleculesConverter.convertAttachmentPointNameToNumber(
        attachmentPointName,
      );
    // TODO fix it for monomers without first attachment point
    const attachmentPoint =
      monomer.monomerItem.attachmentPoints?.[attachmentPointNumber - 1];
    const atomIdMap = monomerToAtomIdMap.get(monomer);

    return (
      isNumber(attachmentPoint?.attachmentAtom) &&
      atomIdMap?.get(attachmentPoint?.attachmentAtom as number)
    );
  }

  public static convertDrawingEntitiesToStruct(
    drawingEntitiesManager: DrawingEntitiesManager,
    struct: Struct,
    reStruct?: ReStruct,
  ) {
    const monomerToAtomIdMap = new Map<BaseMonomer, Map<number, number>>();

    drawingEntitiesManager.micromoleculesHiddenEntities.mergeInto(struct);

    drawingEntitiesManager.clearMicromoleculesHiddenEntities();
    drawingEntitiesManager.monomers.forEach((monomer) => {
      if (monomer.monomerItem.props.isMicromoleculeFragment) {
        const atomIdMap = new Map<number, number>();
        monomer.monomerItem.struct.mergeInto(
          struct,
          null,
          null,
          false,
          false,
          atomIdMap,
        );
        monomerToAtomIdMap.set(monomer, atomIdMap);
      } else {
        const atomIdsMap = new Map<number, number>();
        const monomerMicromolecule = this.convertMonomerToMonomerMicromolecule(
          monomer,
          struct,
        );
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
          atomIdsMap.set(oldAtomId, atomId);
          monomerToAtomIdMap.set(monomer, atomIdsMap);
          reStruct?.atoms.set(atomId, new ReAtom(atom));
        });

        monomerMicromolecule.addAttachmentPoints(
          monomer.monomerItem.attachmentPoints?.map(
            (attachmentPoint) =>
              new SGroupAttachmentPoint(
                atomIdsMap.get(attachmentPoint.attachmentAtom) as number,
                atomIdsMap.get(attachmentPoint.leavingGroup.atoms[0]),
                undefined,
              ),
          ) || [],
        );
        struct.sGroupForest.insert(monomerMicromolecule);
        monomer.monomerItem.struct.bonds.forEach((bond) => {
          const bondClone = bond.clone();
          bondClone.begin = atomIdsMap.get(bondClone.begin) as number;
          bondClone.end = atomIdsMap.get(bondClone.end) as number;
          const bondId = struct.bonds.add(bondClone);
          reStruct?.bonds.set(bondId, new ReBond(bondClone));
        });

        struct.functionalGroups.add(new FunctionalGroup(monomerMicromolecule));
      }
    });

    let conversionErrorMessage = '';

    drawingEntitiesManager.polymerBonds.forEach((polymerBond) => {
      assert(polymerBond.secondMonomer);
      const beginAtom = this.findAttachmentPointAtom(
        polymerBond,
        polymerBond.firstMonomer,
        monomerToAtomIdMap,
      );
      const endAtom = this.findAttachmentPointAtom(
        polymerBond,
        polymerBond.secondMonomer,
        monomerToAtomIdMap,
      );

      if (!isNumber(beginAtom) || !isNumber(endAtom)) {
        conversionErrorMessage =
          'There is no atom for provided attachment point. Bond between monomers was not created.';

        return;
      }

      const bond = new Bond({
        type: Bond.PATTERN.TYPE.SINGLE,
        begin: beginAtom,
        end: endAtom,
      });
      const bondId = struct.bonds.add(bond);
      reStruct?.bonds.set(bondId, new ReBond(bond));
    });

    return { struct, reStruct, conversionErrorMessage };
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

  public static getAttachmentPointLabel(atom: Atom) {
    let attachmentPointLabel = '';
    const atomRglabel = Number(atom.rglabel);
    assert(Number.isInteger(atomRglabel));
    for (let rgi = 0; rgi < 32; rgi++) {
      if (atomRglabel & (1 << rgi)) {
        attachmentPointLabel = 'R' + (rgi + 1).toString();
      }
    }
    return attachmentPointLabel;
  }

  // This method returns array of arrays of fragmentIds grouped by sgroup
  // It needs to serialize/deserialize several molecules grouped by sgroup as a single molecule
  public static getFragmentsGroupedBySgroup(struct: Struct) {
    const groupedFragments: number[][] = [];
    struct.frags.forEach((_fragment, fragmentId) => {
      const isAlreadyGrouped = groupedFragments.find((fragmentsGroup) =>
        fragmentsGroup.includes(fragmentId),
      );
      if (isAlreadyGrouped) {
        return;
      }

      // Find all sgroups related to fragment
      const fragmentSgroups = new Set<SGroup>();
      struct.atoms.forEach((atom, atomId) => {
        if (atom.fragment !== fragmentId) return;
        const sgroup = struct.getGroupFromAtomId(atomId);
        if (sgroup) {
          fragmentSgroups.add(sgroup);
        }
      });

      // Add new group of fragments with fragments related to one sgroup
      const lastFragmentGroupIndex = groupedFragments.push([fragmentId]) - 1;
      fragmentSgroups.forEach((sgroup) => {
        sgroup.atoms.forEach((aid) => {
          const atomFragmentId = struct.atoms.get(aid)?.fragment;
          if (
            atomFragmentId &&
            !groupedFragments[lastFragmentGroupIndex].includes(atomFragmentId)
          ) {
            groupedFragments[lastFragmentGroupIndex].push(atomFragmentId);
          }
        });
      });
    });

    return groupedFragments;
  }

  public static convertStructToDrawingEntities(
    struct: Struct,
    drawingEntitiesManager: DrawingEntitiesManager,
  ) {
    const sgroupToMonomer = new Map<SGroup, BaseMonomer>();
    const fragmentIdToMonomer = new Map<number, BaseMonomer>();
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
    const fragments = this.getFragmentsGroupedBySgroup(struct);

    let fragmentNumber = 1;
    fragments.forEach((_fragment, fragmentId) => {
      const fragmentStruct = struct.getFragment(_fragment, false);
      const monomerAddCommand = this.convertFragmentToChem(
        fragmentNumber,
        fragmentStruct,
        drawingEntitiesManager,
      );
      fragmentIdToMonomer.set(
        fragmentId,
        monomerAddCommand.operations[0].monomer as BaseMonomer,
      );
      command.merge(monomerAddCommand);
      fragmentNumber++;
    });
    struct.bonds.forEach((bond) => {
      const beginAtom = struct.atoms.get(bond.begin) as Atom;
      const endAtom = struct.atoms.get(bond.end) as Atom;
      const beginAtomSgroup = struct.getGroupFromAtomId(bond.begin);
      const beginAtomSgroupAttachmentPoints =
        beginAtomSgroup?.getAttachmentPoints();
      const endAtomSgroup = struct.getGroupFromAtomId(bond.end);
      const endAtomSgroupAttachmentPoints =
        endAtomSgroup?.getAttachmentPoints();
      const beginAtomAttachmentPointIndex =
        beginAtomSgroupAttachmentPoints?.findIndex(
          (sgroupAttachmentPoint) =>
            sgroupAttachmentPoint.atomId === bond.begin,
        );
      const endAtomAttachmentPointIndex =
        endAtomSgroupAttachmentPoints?.findIndex(
          (sgroupAttachmentPoint) => sgroupAttachmentPoint.atomId === bond.end,
        );
      if (
        endAtomSgroup !== beginAtomSgroup &&
        isNumber(beginAtomAttachmentPointIndex) &&
        beginAtomAttachmentPointIndex !== -1 &&
        isNumber(endAtomAttachmentPointIndex) &&
        endAtomAttachmentPointIndex !== -1 &&
        (beginAtomSgroup || endAtomSgroup)
      ) {
        // Here we take monomers from sgroupToMonomer in case of macromolecules structure and
        // from fragmentIdToMonomer in case of micromolecules structure.
        const firstMonomer =
          beginAtomSgroup instanceof MonomerMicromolecule
            ? sgroupToMonomer.get(beginAtomSgroup)
            : fragmentIdToMonomer.get(beginAtom.fragment);
        const secondMonomer =
          endAtomSgroup instanceof MonomerMicromolecule
            ? sgroupToMonomer.get(endAtomSgroup)
            : fragmentIdToMonomer.get(endAtom.fragment);
        assert(firstMonomer);
        assert(secondMonomer);

        command.merge(
          drawingEntitiesManager.createPolymerBond(
            firstMonomer,
            secondMonomer,
            getAttachmentPointLabel(beginAtomAttachmentPointIndex + 1),
            getAttachmentPointLabel(endAtomAttachmentPointIndex + 1),
          ),
        );
      }
    });
    drawingEntitiesManager.setMicromoleculesHiddenEntities(struct);

    return { drawingEntitiesManager, modelChanges: command };
  }
}
