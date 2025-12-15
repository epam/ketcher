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
import { monomerFactory, CoreEditor } from 'application/editor';

/**
 * Looks up a monomer template in the library by template ID or alias.
 * This is used to enrich templates from KET deserialization with library data like idtAliases.
 */
export function getLibraryMonomerTemplate(
  templateId: string,
  templateAlias?: string,
): IKetMonomerTemplate | undefined {
  try {
    const editor = CoreEditor.provideEditorInstance();
    if (!editor?.monomersLibraryParsedJson) {
      return undefined;
    }

    const libraryJson = editor.monomersLibraryParsedJson;

    // Try to find by template ID first
    const templateKey = setMonomerTemplatePrefix(templateId);
    if (libraryJson[templateKey]) {
      return libraryJson[templateKey] as IKetMonomerTemplate;
    }

    // Try to find by alias if provided
    if (templateAlias) {
      const templateByAlias = setMonomerTemplatePrefix(templateAlias);
      if (libraryJson[templateByAlias]) {
        return libraryJson[templateByAlias] as IKetMonomerTemplate;
      }
    }

    return undefined;
  } catch (e) {
    // If there's any error accessing the library, just return undefined
    // and fall back to using the template from the KET file
    return undefined;
  }
}

/**
 * Merges a KET template with its corresponding library template to enrich it with
 * additional properties like idtAliases that may not be present in the KET file.
 */
export function enrichTemplateWithLibraryData(
  template: IKetMonomerTemplate,
): IKetMonomerTemplate {
  const libraryTemplate = getLibraryMonomerTemplate(
    template.id,
    template.alias,
  );

  if (!libraryTemplate) {
    return template;
  }

  // Merge library template data, prioritizing library values for properties
  // that might be missing from the KET template (like idtAliases)
  return {
    ...template,
    // If the template doesn't have idtAliases but the library does, use library's
    idtAliases: template.idtAliases || libraryTemplate.idtAliases,
    // Similar for other properties that might be missing
    aliasHELM: template.aliasHELM || libraryTemplate.aliasHELM,
    aliasAxoLabs: template.aliasAxoLabs || libraryTemplate.aliasAxoLabs,
    modificationTypes:
      template.modificationTypes || libraryTemplate.modificationTypes,
  };
}

export function templateToMonomerProps(template: IKetMonomerTemplate) {
  // Enrich the template with library data before extracting props
  const enrichedTemplate = enrichTemplateWithLibraryData(template);

  return {
    id: enrichedTemplate.id,
    Name:
      enrichedTemplate.fullName ??
      enrichedTemplate.name ??
      enrichedTemplate.alias ??
      enrichedTemplate.id,
    MonomerNaturalAnalogCode: enrichedTemplate.naturalAnalogShort ?? '',
    MonomerNaturalAnalogThreeLettersCode: enrichedTemplate.naturalAnalog ?? '',
    MonomerName:
      enrichedTemplate.name ?? enrichedTemplate.alias ?? enrichedTemplate.id,
    MonomerFullName: enrichedTemplate.fullName,
    MonomerType: enrichedTemplate.classHELM,
    MonomerClass: enrichedTemplate.class,
    MonomerCaps: {},
    idtAliases: enrichedTemplate.idtAliases,
    unresolved: enrichedTemplate.unresolved,
    modificationTypes: enrichedTemplate.modificationTypes,
    ...(enrichedTemplate.aliasHELM
      ? { aliasHELM: enrichedTemplate.aliasHELM }
      : {}),
    ...(enrichedTemplate.aliasAxoLabs
      ? { aliasAxoLabs: enrichedTemplate.aliasAxoLabs }
      : {}),
    ...(enrichedTemplate.hidden ? { hidden: enrichedTemplate.hidden } : {}),
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
