import { assert } from 'utilities';
import { provideEditorInstance } from 'application/editor/editorSingleton';
import { BaseMonomerRenderer } from 'application/render/renderers/BaseMonomerRenderer';
import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import { AtomRenderer } from 'application/render/renderers/AtomRenderer';
import { Chem } from 'domain/entities/Chem';
import { Coordinates } from 'application/editor/shared/coordinates';
import type { DrawingEntity } from 'domain/entities/DrawingEntity';
import { isMonomerSgroupWithAttachmentPoints } from '../../../utilities/monomers';

export function getRenderedStructuresBbox(
  drawingEntities?: DrawingEntity[],
  { includePolymerBonds = false } = {},
) {
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
      left === undefined
        ? monomerPosition.x
        : Math.min(left, monomerPosition.x);
    right =
      right === undefined
        ? monomerPosition.x
        : Math.max(right, monomerPosition.x);
    top =
      top === undefined ? monomerPosition.y : Math.min(top, monomerPosition.y);
    bottom =
      bottom === undefined
        ? monomerPosition.y
        : Math.max(bottom, monomerPosition.y);
  });

  if (!drawingEntities) {
    editor.drawingEntitiesManager.simpleObjects.forEach((simpleObject) => {
      simpleObject
        .mapPoints((point) => Coordinates.modelToCanvas(point))
        .forEach((point) => {
          left = left === undefined ? point.x : Math.min(left, point.x);
          right = right === undefined ? point.x : Math.max(right, point.x);
          top = top === undefined ? point.y : Math.min(top, point.y);
          bottom = bottom === undefined ? point.y : Math.max(bottom, point.y);
        });
    });
  }

  if (includePolymerBonds) {
    editor.drawingEntitiesManager.polymerBonds.forEach((polymerBond) => {
      const bondBbox = polymerBond.baseRenderer?.rootBBox;

      if (!bondBbox) {
        return;
      }

      left = Math.min(left ?? bondBbox.x, bondBbox.x);
      right = Math.max(right ?? bondBbox.x, bondBbox.x + bondBbox.width);
      top = Math.min(top ?? bondBbox.y, bondBbox.y);
      bottom = Math.max(bottom ?? bondBbox.y, bondBbox.y + bondBbox.height);
    });
  }

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
