import type {
  IKetMacromoleculesContent,
  IKetMonomerNode,
  IKetMonomerTemplate,
  IKetAmbiguousMonomerNode,
  IKetAmbiguousMonomerTemplate,
} from 'application/formatters/types/ket';
import {
  type BaseMonomer,
  type BaseMonomerConfig,
} from '../../../entities/BaseMonomer';
import { Vec2 } from '../../../entities/vec2';
import type { Struct } from '../../../entities/struct';
import type { DrawingEntitiesManager } from '../../../entities/DrawingEntitiesManager';
import type { MonomerItemType } from '../../../types/monomers';
import {
  modifyTransformation,
  setMonomerTemplatePrefix,
  switchIntoChemistryCoordSystem,
} from '../helpers';
import {
  convertMonomerTemplateToStruct,
  fillStructRgLabelsByMonomerTemplate,
  getTemplateAttachmentPoints,
} from './monomerTemplateUtils';

export function templateToMonomerProps(template: IKetMonomerTemplate) {
  return {
    id: template.id,
    Name: template.fullName ?? template.name ?? template.alias ?? template.id,
    MonomerNaturalAnalogCode: template.naturalAnalogShort ?? '',
    MonomerNaturalAnalogThreeLettersCode: template.naturalAnalog ?? '',
    MonomerName: template.name ?? template.alias ?? template.id,
    MonomerFullName: template.fullName,
    MonomerType: template.classHELM,
    MonomerClass: template.class,
    MonomerCaps: {},
    idtAliases: template.idtAliases,
    unresolved: template.unresolved,
    modificationTypes: template.modificationTypes,
    ...(template.aliasHELM ? { aliasHELM: template.aliasHELM } : {}),
    ...(template.aliasBILN ? { aliasBILN: template.aliasBILN } : {}),
    ...(template.aliasAxoLabs ? { aliasAxoLabs: template.aliasAxoLabs } : {}),
    ...(template.aliasBILN ? { aliasBILN: template.aliasBILN } : {}),
    ...(template.hidden ? { hidden: template.hidden } : {}),
  };
}

export function monomerToDrawingEntity(
  node: IKetMonomerNode,
  template: IKetMonomerTemplate,
  struct: Struct,
  drawingEntitiesManager: DrawingEntitiesManager,
) {
  const position: Vec2 = switchIntoChemistryCoordSystem(
    new Vec2(node.position.x, node.position.y),
  );

  const { alias, id } = template;
  const { seqid, expanded, transformation } = node;

  return drawingEntitiesManager.addMonomer(
    {
      struct,
      label: alias ?? id,
      colorScheme: undefined,
      favorite: false,
      props: templateToMonomerProps(template),
      attachmentPoints: getTemplateAttachmentPoints(template),
      seqId: seqid,
      ...(expanded !== undefined && {
        expanded,
      }),
      ...(transformation !== undefined && {
        transformation: modifyTransformation(transformation),
      }),
    },
    position,
  );
}

export type MonomerFactoryFn = (
  monomerItem: MonomerItemType,
) => [
  new (
    monomerItem: MonomerItemType,
    position?: Vec2,
    config?: BaseMonomerConfig,
  ) => BaseMonomer,
  ...unknown[],
];

export function createMonomersForVariantMonomer(
  variantMonomerTemplate: IKetAmbiguousMonomerTemplate,
  parsedFileContent: IKetMacromoleculesContent,
  monomerFactory: MonomerFactoryFn,
) {
  const monomerTemplates = variantMonomerTemplate.options.map((option) => {
    return parsedFileContent[setMonomerTemplatePrefix(option.templateId)];
  }) as IKetMonomerTemplate[];
  const monomers = monomerTemplates.map((monomerTemplate) => {
    const monomerItem = {
      label: monomerTemplate.alias,
      expanded: false,
      struct: convertMonomerTemplateToStruct(monomerTemplate),
      props: templateToMonomerProps(monomerTemplate),
      attachmentPoints: getTemplateAttachmentPoints(monomerTemplate),
    };
    const [MonomerConstructor] = monomerFactory(monomerItem);
    fillStructRgLabelsByMonomerTemplate(monomerTemplate, monomerItem);

    return new MonomerConstructor(monomerItem, undefined, {
      generateId: false,
    });
  });

  return monomers;
}

export function variantMonomerToDrawingEntity(
  drawingEntitiesManager: DrawingEntitiesManager,
  node: IKetAmbiguousMonomerNode,
  template: IKetAmbiguousMonomerTemplate,
  parsedFileContent: IKetMacromoleculesContent,
  monomerFactory: MonomerFactoryFn,
) {
  const position: Vec2 = switchIntoChemistryCoordSystem(
    new Vec2(node.position.x, node.position.y),
  );

  const monomers = createMonomersForVariantMonomer(
    template,
    parsedFileContent,
    monomerFactory,
  );

  return drawingEntitiesManager.addAmbiguousMonomer(
    {
      monomers,
      id: template.id,
      subtype: template.subtype,
      label: node.alias,
      options: template.options,
      idtAliases: template.idtAliases,
      isAmbiguous: true,
      transformation: node.transformation,
    },
    position,
  );
}
