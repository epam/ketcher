import type {
  IKetAttachmentPoint,
  IKetMonomerTemplate,
} from 'application/formatters/types/ket';
import { Struct, Vec2, BaseMonomer, type Atom } from 'domain/entities';
import { type MonomerItemType, AttachmentPointName } from 'domain/types';
import { getAttachmentPointLabelWithBinaryShift } from 'domain/helpers/attachmentPointCalculations';
import { isNumber } from 'lodash';
import assert from 'assert';
import { moleculeToStruct } from './moleculeToStruct';
import { rxnToStruct } from './rxnToStruct';
import { simpleObjectToStruct } from './simpleObjectToStruct';
import { textToStruct } from './textToStruct';
import { imageToStruct } from './imageToStruct';
import { multitailArrowToStruct } from './multitailArrowToStruct';
import { rgroupToStruct } from './rgroupToStruct';
import {
  IMAGE_SERIALIZE_KEY,
  MULTITAIL_ARROW_SERIALIZE_KEY,
} from 'domain/constants';

function parseNode(node, struct) {
  const type = node.type;
  switch (type) {
    case 'arrow':
    case 'plus': {
      rxnToStruct(node, struct);
      break;
    }
    case 'simpleObject': {
      simpleObjectToStruct(node, struct);
      break;
    }
    case 'molecule': {
      const currentStruct = moleculeToStruct(node);
      if (node.stereoFlagPosition) {
        const fragment = currentStruct.frags.get(0);
        if (fragment) {
          fragment.stereoFlagPosition = new Vec2(node.stereoFlagPosition);
        }
      }
      currentStruct.mergeInto(struct);
      break;
    }
    case 'rgroup': {
      rgroupToStruct(node).mergeInto(struct);
      break;
    }
    case 'text': {
      textToStruct(node, struct);
      break;
    }
    case MULTITAIL_ARROW_SERIALIZE_KEY: {
      multitailArrowToStruct(node, struct);
      break;
    }
    case IMAGE_SERIALIZE_KEY: {
      imageToStruct(node, struct);
      break;
    }
    default:
      break;
  }
}

export function fillMonomerTemplateStruct(ket): Struct {
  const resultingStruct = new Struct();
  const nodes = ket.root.nodes;

  Object.keys(nodes).forEach((i) => {
    if (nodes[i].type) parseNode(nodes[i], resultingStruct);
    else if (nodes[i].$ref) parseNode(ket[nodes[i].$ref], resultingStruct);
  });
  resultingStruct.name = ket.header?.moleculeName ?? '';

  return resultingStruct;
}

export function normalizeTemplateAttachmentPoints(
  template: IKetMonomerTemplate,
): IKetAttachmentPoint[] | undefined {
  const attachmentPointsDict = (
    template as IKetMonomerTemplate & {
      attachmentPointsDict?: Record<string, IKetAttachmentPoint>;
    }
  ).attachmentPointsDict;

  if (!attachmentPointsDict) {
    return template.attachmentPoints;
  }

  return Object.entries(attachmentPointsDict).map(([key, attachmentPoint]) => {
    let normalizedLabel: AttachmentPointName | undefined;
    if (attachmentPoint.type === 'left') {
      normalizedLabel = AttachmentPointName.R1;
    } else if (attachmentPoint.type === 'right') {
      normalizedLabel = AttachmentPointName.R2;
    } else {
      normalizedLabel = undefined;
    }

    return {
      ...attachmentPoint,
      label: attachmentPoint.label ?? key,
      ...(normalizedLabel ? { type: attachmentPoint.type } : {}),
    };
  });
}

export function getTemplateAttachmentPoints(
  template: IKetMonomerTemplate,
): IKetAttachmentPoint[] {
  const attachmentPoints = normalizeTemplateAttachmentPoints(template) ?? [];

  return template.unresolved
    ? attachmentPoints.map((_, index) => {
        return {
          attachmentAtom: index,
          leavingGroup: {
            atoms: [],
          },
        };
      })
    : attachmentPoints;
}

export function convertMonomerTemplateToStruct(
  template: IKetMonomerTemplate,
): Struct {
  const attachmentPoints = getTemplateAttachmentPoints(template) ?? [];

  return fillMonomerTemplateStruct({
    root: {
      nodes: [{ $ref: 'mol0' }],
    },
    mol0: {
      ...template,
      type: 'molecule',
      atoms: template.unresolved
        ? attachmentPoints?.map((_, index) => {
            return {
              label: 'C',
              location: [index, index, index],
            };
          })
        : template.atoms,
      bonds: template.unresolved
        ? attachmentPoints?.map((_, index) => {
            if (index === attachmentPoints.length - 1) {
              return {
                type: 1,
                atoms: [0, attachmentPoints.length - 1],
              };
            }
            return {
              type: 1,
              atoms: [index, index + 1],
            };
          })
        : template.bonds,
      attachmentPoints,
    },
    header: {
      moleculeName: template.fullName,
    },
  });
}

/**
 * Builds a display label for a leaving group atom, appending implicit
 * hydrogens computed from the atom's standard valence and the number of
 * bonds it has within the monomer template structure (e.g. an "N" atom
 * with a single bond becomes "NH2", an "O" atom with a single bond
 * becomes "OH").
 */
function getLeavingGroupLabelWithHydrogens(
  struct: Struct,
  atomId: number,
  atom: Atom,
): string {
  let bondsCount = 0;
  struct.bonds.forEach((bond) => {
    if (bond.begin === atomId || bond.end === atomId) {
      bondsCount++;
    }
  });

  const hasValidValence = atom.calcValence(bondsCount);
  const implicitHydrogenCount = hasValidValence ? atom.implicitH : 0;

  if (implicitHydrogenCount <= 0) {
    return atom.label;
  }

  const hydrogenCountSuffix =
    implicitHydrogenCount > 1 ? String(implicitHydrogenCount) : '';

  return `${atom.label}H${hydrogenCountSuffix}`;
}

export function fillStructRgLabelsByMonomerTemplate(
  template: IKetMonomerTemplate,
  monomerItem: MonomerItemType,
): void {
  if (monomerItem.props.unresolved) {
    return;
  }

  const attachmentPoints = getTemplateAttachmentPoints(template);

  const { attachmentPointsList } =
    BaseMonomer.getAttachmentPointDictFromMonomerDefinition(attachmentPoints);

  attachmentPoints?.forEach((attachmentPoint, attachmentPointIndex) => {
    const firstAtomInLeavingGroup = attachmentPoint.leavingGroup?.atoms[0];
    const leavingGroupAtomId = isNumber(firstAtomInLeavingGroup)
      ? firstAtomInLeavingGroup
      : attachmentPoint.attachmentAtom;
    const leavingGroupAtom = monomerItem.struct.atoms.get(leavingGroupAtomId);
    assert(leavingGroupAtom);
    leavingGroupAtom.rglabel = (
      0 |
      (1 <<
        (Number(
          (attachmentPoint.label
            ? attachmentPoint.label
            : attachmentPointsList[attachmentPointIndex]
          ).replace('R', ''),
        ) -
          1))
    ).toString();
    assert(monomerItem.props.MonomerCaps);
    monomerItem.props.MonomerCaps[
      getAttachmentPointLabelWithBinaryShift(Number(leavingGroupAtom.rglabel))
    ] = getLeavingGroupLabelWithHydrogens(
      monomerItem.struct,
      leavingGroupAtomId,
      leavingGroupAtom,
    );
  });
}
