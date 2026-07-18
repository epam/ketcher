import assert from 'assert';
import { provideEditorInstance } from 'application/editor/editorSingleton';
import { BaseMonomerRenderer } from 'application/render/renderers/BaseMonomerRenderer';
import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import { AtomRenderer } from 'application/render/renderers/AtomRenderer';
import { Chem } from 'domain/entities/Chem';
import type { DrawingEntity } from 'domain/entities/DrawingEntity';
import { isMonomerSgroupWithAttachmentPoints } from '../../../utilities/monomers';

export function getRenderedStructuresBbox(drawingEntities?: DrawingEntity[]) {
  let left: number | undefined;
  let right: number | undefined;
  let top: number | undefined;
  let bottom: number | undefined;
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

    left =
      left !== undefined
        ? Math.min(left, monomerPosition.x)
        : monomerPosition.x;
    right =
      right !== undefined
        ? Math.max(right, monomerPosition.x)
        : monomerPosition.x;
    top =
      top !== undefined ? Math.min(top, monomerPosition.y) : monomerPosition.y;
    bottom =
      bottom !== undefined
        ? Math.max(bottom, monomerPosition.y)
        : monomerPosition.y;
  });
  assert(
    left !== undefined &&
      right !== undefined &&
      top !== undefined &&
      bottom !== undefined,
  );
  return {
    left,
    right,
    top,
    bottom,
    width: right - left,
    height: bottom - top,
  };
}
