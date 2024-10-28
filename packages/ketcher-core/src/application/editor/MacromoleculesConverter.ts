import {
  AmbiguousMonomer,
  Atom as MicromoleculesAtom,
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
import {
  getAttachmentPointLabel,
  getAttachmentPointNumberFromLabel,
} from 'domain/helpers/attachmentPointCalculations';
import { invert, isNumber } from 'lodash';
import { IKetAttachmentPoint } from 'application/formatters';
import { MonomerToAtomBond } from 'domain/entities/MonomerToAtomBond';
import { CoreEditor } from 'application/editor/Editor';
import { Atom } from 'domain/entities/CoreAtom';
import { AtomLabel } from 'domain/constants';
import { isMonomerSgroupWithAttachmentPoints } from '../../utilities/monomers';
import { HydrogenBond } from 'domain/entities/HydrogenBond';
import { MACROMOLECULES_BOND_TYPES } from 'application/editor/tools/Bond';

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
    atom: MicromoleculesAtom,
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

  public static findAttachmentPointAtom(
    polymerBond: PolymerBond | MonomerToAtomBond,
    monomer: BaseMonomer,
    monomerToAtomIdMap: Map<BaseMonomer, Map<number, number>>,
  ) {
    const attachmentPointName = monomer.getAttachmentPointByBond(polymerBond);

    if (!attachmentPointName) {
      return {
        attachmentAtomId: undefined,
        attachmentPointNumber: undefined,
      };
    }

    const attachmentPointNumber =
      MacromoleculesConverter.convertAttachmentPointNameToNumber(
        attachmentPointName,
      );
    const attachmentPointIndex =
      monomer.listOfAttachmentPoints.indexOf(attachmentPointName);
    const attachmentPoint =
      monomer.monomerItem.attachmentPoints?.[attachmentPointIndex];
    const atomIdMap = monomerToAtomIdMap.get(monomer);
    const attachmentPointAtomId =
      monomer instanceof AmbiguousMonomer ? 0 : attachmentPoint?.attachmentAtom;

    return {
      globalAttachmentAtomId:
        isNumber(attachmentPointAtomId) &&
        atomIdMap?.get(attachmentPointAtomId as number),
      attachmentAtomId:
        isNumber(attachmentPointAtomId) && attachmentPointAtomId,
      attachmentPointNumber,
    };
  }

  public static convertDrawingEntitiesToStruct(
    drawingEntitiesManager: DrawingEntitiesManager,
    struct: Struct,
    reStruct?: ReStruct,
  ) {
    const monomerToAtomIdMap = new Map<BaseMonomer, Map<number, number>>();
    const monomerToMonomerMicromolecule = new Map<
      BaseMonomer,
      MonomerMicromolecule
    >();

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
        const monomerAtoms =
          monomer instanceof AmbiguousMonomer
            ? monomer.monomers[0].monomerItem.struct.atoms
            : monomer.monomerItem.struct.atoms;
        const monomerBonds =
          monomer instanceof AmbiguousMonomer
            ? monomer.monomers[0].monomerItem.struct.bonds
            : monomer.monomerItem.struct.bonds;

        monomerToMonomerMicromolecule.set(monomer, monomerMicromolecule);

        monomerAtoms.forEach((oldAtom, oldAtomId) => {
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
          monomer.listOfAttachmentPoints.map(
            (attachmentPointName, attachmentPointIndex) => {
              const attachmentPointNumber =
                getAttachmentPointNumberFromLabel(attachmentPointName);
              const attachmentPoint = monomer.monomerItem.attachmentPoints?.[
                attachmentPointIndex
              ] as IKetAttachmentPoint;

              return new SGroupAttachmentPoint(
                atomIdsMap.get(attachmentPoint.attachmentAtom) as number,
                atomIdsMap.get(attachmentPoint.leavingGroup?.atoms[0]),
                undefined,
                attachmentPointNumber,
              );
            },
          ) || [],
          false,
        );
        struct.sGroupForest.insert(monomerMicromolecule);
        monomerBonds.forEach((bond) => {
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

      if (polymerBond instanceof HydrogenBond) {
        const bond = new Bond({
          type: Bond.PATTERN.TYPE.HYDROGEN,
          begin: monomerToAtomIdMap
            .get(polymerBond.firstMonomer)
            ?.values()
            .next().value,
          end: monomerToAtomIdMap
            .get(polymerBond.secondMonomer)
            ?.values()
            .next().value,
        });
        const bondId = struct.bonds.add(bond);

        reStruct?.bonds.set(bondId, new ReBond(bond));

        return;
      }

      const {
        globalAttachmentAtomId: beginAtom,
        attachmentPointNumber: beginSuperatomAttachmentPointNumber,
      } = this.findAttachmentPointAtom(
        polymerBond,
        polymerBond.firstMonomer,
        monomerToAtomIdMap,
      );
      const {
        globalAttachmentAtomId: endAtom,
        attachmentPointNumber: endSuperatomAttachmentPointNumber,
      } = this.findAttachmentPointAtom(
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
        type:
          polymerBond instanceof HydrogenBond
            ? Bond.PATTERN.TYPE.HYDROGEN
            : Bond.PATTERN.TYPE.SINGLE,
        begin: beginAtom,
        end: endAtom,
        beginSuperatomAttachmentPointNumber,
        endSuperatomAttachmentPointNumber,
      });
      const bondId = struct.bonds.add(bond);
      reStruct?.bonds.set(bondId, new ReBond(bond));
    });

    drawingEntitiesManager.monomerToAtomBonds.forEach((monomerToAtomBond) => {
      const {
        globalAttachmentAtomId: beginAtom,
        attachmentPointNumber: beginSuperatomAttachmentPointNumber,
      } = this.findAttachmentPointAtom(
        monomerToAtomBond,
        monomerToAtomBond.monomer,
        monomerToAtomIdMap,
      );

      const endAtom = monomerToAtomIdMap
        ?.get(monomerToAtomBond.atom.monomer)
        ?.get(monomerToAtomBond.atom.atomIdInMicroMode);

      if (!isNumber(beginAtom) || !isNumber(endAtom)) {
        conversionErrorMessage =
          'There is no atom for provided attachment point. Bond between monomers was not created.';

        return;
      }

      const bond = new Bond({
        type: Bond.PATTERN.TYPE.SINGLE,
        begin: beginAtom,
        end: endAtom,
        beginSuperatomAttachmentPointNumber,
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
    const monomerAdditionCommand =
      monomerMicromolecule.monomer instanceof AmbiguousMonomer
        ? drawingEntitiesManager.addAmbiguousMonomer(
            monomerMicromolecule.monomer.variantMonomerItem,
            monomerMicromolecule.monomer.position,
          )
        : drawingEntitiesManager.addMonomer(
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

  public static getAttachmentPointLabel(atom: MicromoleculesAtom) {
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

  public static findAtomByMicromoleculeAtomId(
    drawingEntitiesManager: DrawingEntitiesManager,
    atomId: number,
    monomer?: BaseMonomer,
  ) {
    return [...drawingEntitiesManager.atoms.values()].find(
      (atom) =>
        atom.atomIdInMicroMode === atomId &&
        (!monomer || monomer === atom.monomer),
    );
  }

  public static convertStructToDrawingEntities(
    struct: Struct,
    drawingEntitiesManager: DrawingEntitiesManager,
  ) {
    const editor = CoreEditor.provideEditorInstance();
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
    const fragmentIdToAtomIdMap = new Map<number, Map<number, number>>();
    const globalAtomIdToMonomerMap = new Map<number, BaseMonomer>();

    fragments.forEach((_fragment) => {
      const atomIdMap = new Map<number, number>();
      const fragmentStruct = struct.getFragment(_fragment, false, atomIdMap);
      const monomerAddCommand = this.convertFragmentToChem(
        fragmentNumber,
        fragmentStruct,
        drawingEntitiesManager,
      );
      const monomer = monomerAddCommand.operations[0].monomer as BaseMonomer;
      const atomIdMapObject = Object.fromEntries(atomIdMap.entries());
      const localAtomIdToGlobalAtomId = invert(atomIdMapObject);
      const atomsMap = new Map<number, Atom>();

      _fragment.forEach((fragmentId) => {
        fragmentIdToMonomer.set(fragmentId as number, monomer);
        fragmentIdToAtomIdMap.set(fragmentId, atomIdMap);
      });
      command.merge(monomerAddCommand);

      if (
        monomer.monomerItem.props.isMicromoleculeFragment &&
        !isMonomerSgroupWithAttachmentPoints(monomer)
      ) {
        monomer.monomerItem.struct.atoms.forEach((atom, atomId) => {
          const atomAddCommand = drawingEntitiesManager.addAtom(
            atom.pp,
            monomer,
            atomId,
            atom.label as AtomLabel,
          );

          command.merge(atomAddCommand);
          atomsMap.set(atomId, atomAddCommand.operations[0].atom as Atom);
          globalAtomIdToMonomerMap.set(
            Number(localAtomIdToGlobalAtomId[atomId]),
            monomer,
          );
        });

        monomer.monomerItem.struct.bonds.forEach((bond) => {
          const firstAtom = atomsMap.get(bond.begin);
          const secondAtom = atomsMap.get(bond.end);

          if (!firstAtom || !secondAtom) {
            return;
          }

          command.merge(
            drawingEntitiesManager.addBond(
              firstAtom,
              secondAtom,
              bond.type,
              bond.stereo,
            ),
          );
        });
      }

      fragmentNumber++;
    });

    const superatomAttachmentPointToBond = new Map<
      SGroupAttachmentPoint,
      Bond
    >();

    struct.bonds.forEach((bond) => {
      const beginAtom = struct.atoms.get(bond.begin);
      const endAtom = struct.atoms.get(bond.end);
      const beginAtomSgroup = struct.getGroupFromAtomId(bond.begin);
      beginAtomSgroup?.getAttachmentPoints();
      const endAtomSgroup = struct.getGroupFromAtomId(bond.end);
      const isConnectionBetweenMonomerAndMolecule =
        (beginAtomSgroup instanceof MonomerMicromolecule &&
          !(endAtomSgroup instanceof MonomerMicromolecule) &&
          !endAtomSgroup?.isSuperatomWithoutLabel) ||
        (endAtomSgroup instanceof MonomerMicromolecule &&
          !(beginAtomSgroup instanceof MonomerMicromolecule) &&
          !beginAtomSgroup?.isSuperatomWithoutLabel);

      if (!isConnectionBetweenMonomerAndMolecule) {
        return;
      }

      const moleculeAtomId =
        beginAtomSgroup instanceof MonomerMicromolecule ? bond.end : bond.begin;
      const moleculeAtom =
        beginAtomSgroup instanceof MonomerMicromolecule ? endAtom : beginAtom;
      const monomerSgroup =
        beginAtomSgroup instanceof MonomerMicromolecule
          ? beginAtomSgroup
          : endAtomSgroup;

      if (!moleculeAtom || !monomerSgroup) {
        return;
      }

      const atomsMap = fragmentIdToAtomIdMap.get(moleculeAtom.fragment);
      const atomIdInMicromolecules = atomsMap?.get(moleculeAtomId);
      const monomer = sgroupToMonomer.get(monomerSgroup);

      if (!isNumber(atomIdInMicromolecules) || !monomer) {
        return;
      }

      const atomToConnect =
        MacromoleculesConverter.findAtomByMicromoleculeAtomId(
          drawingEntitiesManager,
          atomIdInMicromolecules,
          globalAtomIdToMonomerMap.get(moleculeAtomId),
        );

      if (
        !atomToConnect ||
        !isNumber(bond.beginSuperatomAttachmentPointNumber)
      ) {
        return;
      }

      command.merge(
        drawingEntitiesManager.addMonomerToAtomBond(
          monomer,
          atomToConnect,
          getAttachmentPointLabel(bond.beginSuperatomAttachmentPointNumber),
        ),
      );
    });

    struct.bonds.forEach((bond) => {
      const beginAtom = struct.atoms.get(bond.begin);
      const endAtom = struct.atoms.get(bond.end);

      if (!beginAtom || !endAtom) {
        return;
      }

      const beginAtomSgroup = struct.getGroupFromAtomId(bond.begin);
      const beginAtomSgroupAttachmentPoints =
        beginAtomSgroup?.getAttachmentPoints();
      const endAtomSgroup = struct.getGroupFromAtomId(bond.end);
      const endAtomSgroupAttachmentPoints =
        endAtomSgroup?.getAttachmentPoints();
      const beginAtomAttachmentPointNumber = isNumber(
        bond.beginSuperatomAttachmentPointNumber,
      )
        ? bond.beginSuperatomAttachmentPointNumber
        : beginAtomSgroupAttachmentPoints?.findIndex(
            (sgroupAttachmentPoint) =>
              sgroupAttachmentPoint.atomId === bond.begin &&
              !superatomAttachmentPointToBond.has(sgroupAttachmentPoint),
          );
      const beginAtomAttachmentPoint =
        isNumber(beginAtomAttachmentPointNumber) &&
        beginAtomSgroupAttachmentPoints?.find(
          (attachmentPoint) =>
            attachmentPoint.attachmentPointNumber ===
            beginAtomAttachmentPointNumber,
        );
      const endAtomAttachmentPointNumber = isNumber(
        bond.endSuperatomAttachmentPointNumber,
      )
        ? bond.endSuperatomAttachmentPointNumber
        : endAtomSgroupAttachmentPoints?.findIndex(
            (sgroupAttachmentPoint) =>
              sgroupAttachmentPoint.atomId === bond.end &&
              !superatomAttachmentPointToBond.has(sgroupAttachmentPoint),
          );
      const endAtomAttachmentPoint =
        isNumber(endAtomAttachmentPointNumber) &&
        endAtomSgroupAttachmentPoints?.find(
          (attachmentPoint) =>
            attachmentPoint.attachmentPointNumber ===
            endAtomAttachmentPointNumber,
        );

      if (beginAtomAttachmentPoint) {
        superatomAttachmentPointToBond.set(beginAtomAttachmentPoint, bond);
      }
      if (endAtomAttachmentPoint) {
        superatomAttachmentPointToBond.set(endAtomAttachmentPoint, bond);
      }
      if (
        endAtomSgroup !== beginAtomSgroup &&
        isNumber(beginAtomAttachmentPointNumber) &&
        isNumber(endAtomAttachmentPointNumber) &&
        beginAtomSgroup &&
        endAtomSgroup &&
        (beginAtomSgroup instanceof MonomerMicromolecule ||
          beginAtomSgroup.isSuperatomWithoutLabel) &&
        (endAtomSgroup instanceof MonomerMicromolecule ||
          endAtomSgroup.isSuperatomWithoutLabel)
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
            getAttachmentPointLabel(beginAtomAttachmentPointNumber),
            getAttachmentPointLabel(endAtomAttachmentPointNumber),
            bond.type === Bond.PATTERN.TYPE.HYDROGEN
              ? MACROMOLECULES_BOND_TYPES.HYDROGEN
              : MACROMOLECULES_BOND_TYPES.SINGLE,
          ),
        );
      }
    });

    drawingEntitiesManager.setMicromoleculesHiddenEntities(struct);

    if (editor) {
      editor.viewModel.initialize([...drawingEntitiesManager.bonds.values()]);
    }

    return {
      drawingEntitiesManager,
      modelChanges: command,
      fragmentIdToMonomer,
      fragmentIdToAtomIdMap,
    };
  }
}
