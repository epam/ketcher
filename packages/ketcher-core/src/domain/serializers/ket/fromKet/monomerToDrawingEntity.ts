import {
  IKetMonomerNode,
  IKetMonomerTemplate,
} from 'application/formatters/types/ket';
import { Struct, Vec2 } from 'domain/entities';
import { CoreEditor } from 'application/editor';

export function monomerToDrawingEntity(
  node: IKetMonomerNode,
  template: IKetMonomerTemplate,
  struct: Struct,
) {
  const editor = CoreEditor.provideEditorInstance();

  return editor.drawingEntitiesManager.addMonomer(
    {
      struct,
      label: template.alias || template.id,
      colorScheme: undefined,
      favorite: false,
      props: {
        Name: template.fullName || template.alias || template.id,
        MonomerNaturalAnalogCode: template.naturalAnalogShort,
        MonomerName: template.fullName || template.alias || template.id,
        MonomerType: template.monomerClass,
      },
    },
    new Vec2(node.position.x, node.position.y),
    Number(node.id),
  );
}
