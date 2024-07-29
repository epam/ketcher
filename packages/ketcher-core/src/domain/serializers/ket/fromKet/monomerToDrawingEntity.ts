import {
  IKetMonomerNode,
  IKetMonomerTemplate,
} from 'application/formatters/types/ket';
import { Struct, Vec2 } from 'domain/entities';
import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import { switchIntoChemistryCoordSystem } from 'domain/serializers/ket/helpers';
import { KetSerializer } from 'domain/serializers';

export function templateToMonomerProps(template: IKetMonomerTemplate) {
  return {
    id: template.id,
    Name: template.fullName || template.name || template.alias || template.id,
    MonomerNaturalAnalogCode: template.naturalAnalogShort || '',
    MonomerName: template.alias || template.id,
    MonomerFullName: template.fullName,
    MonomerType: template.classHELM,
    MonomerClass: template.class,
    MonomerCaps: {},
    idtAliases: template.idtAliases,
    unresolved: template.unresolved,
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
  return drawingEntitiesManager.addMonomer(
    {
      struct,
      label: template.alias || template.id,
      colorScheme: undefined,
      favorite: false,
      props: templateToMonomerProps(template),
      attachmentPoints: KetSerializer.getTemplateAttachmentPoints(template),
      seqId: node.seqid,
    },
    position,
  );
}
