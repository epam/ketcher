import assert from 'assert';
import { provideEditorInstance } from 'application/editor/editorSingleton';
import { BaseMonomerRenderer } from 'application/render/renderers/BaseMonomerRenderer';
import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import { AtomRenderer } from 'application/render/renderers/AtomRenderer';
import { Chem } from 'domain/entities/Chem';
import { DrawingEntity } from 'domain/entities/DrawingEntity';
import { isMonomerSgroupWithAttachmentPoints } from '../../../utilities/monomers';

export function getRenderedStructuresBbox(drawingEntities?: DrawingEntity[]) {
  let left;
  let right;
  let top;
  let bottom;
  const editor = provideEditorInstance();

  (
    drawingEntities ||
    [
      ...editor.drawingEntitiesManager.monomers.values(),
      ...editor.drawingEntitiesManager.atoms.values(),
    ].filter(
      (drawindEntity) =>
        !(
          drawindEntity instanceof Chem &&
          drawindEntity.monomerItem.props.isMicromoleculeFragment &&
          !isMonomerSgroupWithAttachmentPoints(drawindEntity)
        ),
    )
  ).forEach((monomer) => {
    if (
      !(monomer.baseRenderer instanceof BaseSequenceItemRenderer) &&
      !(monomer.baseRenderer instanceof BaseMonomerRenderer) &&
      !(monomer.baseRenderer instanceof AtomRenderer)
    ) {
      return;
    }

    const monomerPosition = monomer.baseRenderer?.scaledPosition;

    assert(monomerPosition);

    left = left ? Math.min(left, monomerPosition.x) : monomerPosition.x;
    right = right ? Math.max(right, monomerPosition.x) : monomerPosition.x;
    top = top ? Math.min(top, monomerPosition.y) : monomerPosition.y;
    bottom = bottom ? Math.max(bottom, monomerPosition.y) : monomerPosition.y;
  });
  return {
    left,
    right,
    top,
    bottom,
    width: right - left,
    height: bottom - top,
  };
}
