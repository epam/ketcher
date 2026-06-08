import type {
  IKetAttachmentPoint,
  IKetMonomerTemplate,
} from 'application/formatters/types/ket';
import { Struct, Vec2, BaseMonomer } from 'domain/entities';
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
    const leavingGroupAtom = monomerItem.struct.atoms.get(
      isNumber(firstAtomInLeavingGroup)
        ? firstAtomInLeavingGroup
        : attachmentPoint.attachmentAtom,
    );
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
    ] = leavingGroupAtom.label;
  });
}
