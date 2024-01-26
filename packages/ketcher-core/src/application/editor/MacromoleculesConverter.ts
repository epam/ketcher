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
    polymerBond: PolymerBond,
    monomer: BaseMonomer,
    struct: Struct,
    sgroup?: SGroup,
    fragmentId?: number,
  ) {
    const attachmentPointName = monomer.getAttachmentPointByBond(polymerBond);
    assert(attachmentPointName);
    const attachmentPointNumber =
      MacromoleculesConverter.convertAttachmentPointNameToNumber(
        attachmentPointName,
      );

    return sgroup
      ? sgroup.atoms.find(
          (atomId) =>
            Number(struct.atoms.get(atomId)?.rglabel) === attachmentPointNumber,
        )
      : struct.atoms.find((atomId) => {
          const atom = struct.atoms.get(atomId) as Atom;
          return (
            atom.fragment === fragmentId &&
            Number(atom.rglabel) === attachmentPointNumber
          );
        });
  }

  public static convertDrawingEntitiesToStruct(
    drawingEntitiesManager: DrawingEntitiesManager,
    struct: Struct,
    reStruct?: ReStruct,
  ) {
    const monomerToSgroup = new Map<BaseMonomer, SGroup>();
    const monomerToFragmentId = new Map<BaseMonomer, number>();

    drawingEntitiesManager.micromoleculesHiddenEntities.mergeInto(struct);

    drawingEntitiesManager.clearMicromoleculesHiddenEntities();
    drawingEntitiesManager.monomers.forEach((monomer) => {
      if (monomer.monomerItem.props.isMicromoleculeFragment) {
        monomer.monomerItem.struct.mergeInto(struct);
        monomerToFragmentId.set(monomer, struct.frags.size - 1);
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

    let conversionErrorMessage = '';

    drawingEntitiesManager.polymerBonds.forEach((polymerBond) => {
      assert(polymerBond.secondMonomer);
      const beginAtom = this.findAttachmentPointAtom(
        polymerBond,
        polymerBond.firstMonomer,
        struct,
        monomerToSgroup.get(polymerBond.firstMonomer),
        monomerToFragmentId.get(polymerBond.firstMonomer),
      );
      const endAtom = this.findAttachmentPointAtom(
        polymerBond,
        polymerBond.secondMonomer,
        struct,
        monomerToSgroup.get(polymerBond.secondMonomer),
        monomerToFragmentId.get(polymerBond.secondMonomer),
      );

      if (!beginAtom || !endAtom) {
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

  public static getFragments(struct: Struct) {
    const fragments: number[][] = [];
    struct.frags.forEach((_fragment, fragmentId) => {
      const fragmentSgroups = new Set<SGroup>();
      struct.atoms.forEach((atom, atomId) => {
        if (atom.fragment !== fragmentId) return;
        const sgroup = struct.getGroupFromAtomId(atomId);
        if (sgroup) {
          fragmentSgroups.add(sgroup);
        }
      });
      const index = fragments.push([fragmentId]) - 1;
      fragmentSgroups.forEach((sgroup) => {
        sgroup.atoms.forEach((aid) => {
          const atomFragmentId = struct.atoms.get(aid)?.fragment;
          if (atomFragmentId && !fragments[index].includes(atomFragmentId)) {
            fragments[index].push(atomFragmentId);
          }
        });
      });
    });

    const uniqueFragments = fragments.filter((arr, index, self) => {
      // Sort the arrays before comparing
      const sortedArr = arr.slice().sort();
      return (
        index ===
        self.findIndex((a) => {
          const sortedA = a.slice().sort();
          return JSON.stringify(sortedA) === JSON.stringify(sortedArr);
        })
      );
    });
    return uniqueFragments;
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
    const fragments = this.getFragments(struct);

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
      const endAtomSgroup = struct.getGroupFromAtomId(bond.end);
      const beginAtomAttachmentPointNumber =
        MacromoleculesConverter.getAttachmentPointLabel(beginAtom);
      const endAtomAttachmentPointNumber =
        MacromoleculesConverter.getAttachmentPointLabel(endAtom);
      if (
        beginAtomAttachmentPointNumber &&
        endAtomAttachmentPointNumber &&
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
