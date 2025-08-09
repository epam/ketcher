import {
  IKetMacromoleculesContent,
  IKetMonomerNode,
  IKetMonomerTemplate,
  IKetAmbiguousMonomerNode,
  IKetAmbiguousMonomerTemplate,
} from 'application/formatters/types/ket';
import { Struct, Vec2 } from 'domain/entities';
import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import {
  modifyTransformation,
  setMonomerTemplatePrefix,
  switchIntoChemistryCoordSystem,
} from 'domain/serializers/ket/helpers';
import { KetSerializer } from 'domain/serializers';
import { monomerFactory } from 'application/editor';

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
    modificationType: template.modificationType,
    ...(template.aliasHELM ? { aliasHELM: template.aliasHELM } : {}),
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
      label: alias || id,
      colorScheme: undefined,
      favorite: false,
      props: templateToMonomerProps(template),
      attachmentPoints: KetSerializer.getTemplateAttachmentPoints(template),
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

export function createMonomersForVariantMonomer(
  variantMonomerTemplate: IKetAmbiguousMonomerTemplate,
  parsedFileContent: IKetMacromoleculesContent,
) {
  const monomerTemplates = variantMonomerTemplate.options.map((option) => {
    return parsedFileContent[setMonomerTemplatePrefix(option.templateId)];
  }) as IKetMonomerTemplate[];
  const monomers = monomerTemplates.map((monomerTemplate) => {
    const monomerItem = {
      label: monomerTemplate.alias,
      expanded: false,
      struct: KetSerializer.convertMonomerTemplateToStruct(monomerTemplate),
      props: templateToMonomerProps(monomerTemplate),
      attachmentPoints: monomerTemplate.attachmentPoints,
    };
    const [MonomerConstructor] = monomerFactory(monomerItem);
    KetSerializer.fillStructRgLabelsByMonomerTemplate(
      monomerTemplate,
      monomerItem,
    );

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
) {
  const position: Vec2 = switchIntoChemistryCoordSystem(
    new Vec2(node.position.x, node.position.y),
  );

  const monomers = createMonomersForVariantMonomer(template, parsedFileContent);

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
