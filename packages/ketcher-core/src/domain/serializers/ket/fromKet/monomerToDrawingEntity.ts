import {
  IKetMonomerNode,
  IKetMonomerTemplate,
} from 'application/formatters/types/ket';
import { Struct, Vec2 } from 'domain/entities';
import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import { switchIntoChemistryCoordSystem } from 'domain/serializers/ket/helpers';

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
      props: {
        id: template.id,
        Name: template.fullName || template.alias || template.id,
        MonomerNaturalAnalogCode: template.naturalAnalogShort,
        MonomerName: template.fullName || template.alias || template.id,
        MonomerFullName: template.fullName,
        MonomerType: template.classHELM,
        MonomerClass: template.class,
        MonomerCaps: {},
      },
      attachmentPoints: template.attachmentPoints,
      seqId: node.seqid,
    },
    position,
  );
}
