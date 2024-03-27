import {
  IKetMonomerNode,
  IKetMonomerTemplate,
} from 'application/formatters/types/ket';
import { Struct, Vec2 } from 'domain/entities';
import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';

export function monomerToDrawingEntity(
  node: IKetMonomerNode,
  template: IKetMonomerTemplate,
  struct: Struct,
  drawingEntitiesManager: DrawingEntitiesManager,
) {
  return drawingEntitiesManager.addMonomer(
    {
      struct,
      label: template.alias || template.id,
      colorScheme: undefined,
      favorite: false,
      props: {
        id: template.id,
        Name:
          template.fullName || template.name || template.alias || template.id,
        MonomerNaturalAnalogCode: template.naturalAnalogShort,
        MonomerName:
          template.fullName || template.name || template.alias || template.id,
        MonomerFullName: template.fullName,
        MonomerType: template.classHELM,
        MonomerClass: template.class,
        MonomerCaps: {},
      },
      attachmentPoints: template.attachmentPoints,
      seqId: node.seqid,
    },
    node.position as Vec2,
  );
}
