import assert from 'assert';
import { provideEditorInstance } from 'application/editor/editorSingleton';
import { provideEditorSettings } from 'application/editor/editorSettings';
import { BaseMonomerRenderer } from 'application/render/renderers/BaseMonomerRenderer';
import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import { AtomRenderer } from 'application/render/renderers/AtomRenderer';
import { Chem } from 'domain/entities/Chem';
import type { DrawingEntity } from 'domain/entities/DrawingEntity';
import { Scale } from 'domain/helpers';
import type { Vec2 } from 'domain/entities/vec2';
import { isMonomerSgroupWithAttachmentPoints } from '../../../utilities/monomers';

function expandBbox(
  bbox: { left?: number; right?: number; top?: number; bottom?: number },
  point: Vec2,
) {
  bbox.left = bbox.left !== undefined ? Math.min(bbox.left, point.x) : point.x;
  bbox.right =
    bbox.right !== undefined ? Math.max(bbox.right, point.x) : point.x;
  bbox.top = bbox.top !== undefined ? Math.min(bbox.top, point.y) : point.y;
  bbox.bottom =
    bbox.bottom !== undefined ? Math.max(bbox.bottom, point.y) : point.y;
}

export function getRenderedStructuresBbox(drawingEntities?: DrawingEntity[]) {
  const bbox: {
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
  } = {};
  const editor = provideEditorInstance();
  const editorSettings = provideEditorSettings();

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

    expandBbox(bbox, monomerPosition);
  });

  if (!drawingEntities) {
    editor.drawingEntitiesManager.rxnArrows.forEach((arrow) => {
      if (!arrow.renderer) return;
      expandBbox(
        bbox,
        Scale.modelToCanvas(arrow.startPosition, editorSettings),
      );
      expandBbox(bbox, Scale.modelToCanvas(arrow.endPosition, editorSettings));
    });

    editor.drawingEntitiesManager.multitailArrows.forEach((arrow) => {
      if (!arrow.renderer) return;
      const positions = arrow.getReferencePositions();
      expandBbox(bbox, Scale.modelToCanvas(positions.head, editorSettings));
      expandBbox(bbox, Scale.modelToCanvas(positions.topSpine, editorSettings));
      expandBbox(
        bbox,
        Scale.modelToCanvas(positions.bottomSpine, editorSettings),
      );
      positions.tails.forEach((tail) => {
        expandBbox(bbox, Scale.modelToCanvas(tail, editorSettings));
      });
    });
  }

  const left = bbox.left ?? 0;
  const right = bbox.right ?? 0;
  const top = bbox.top ?? 0;
  const bottom = bbox.bottom ?? 0;
  return {
    left,
    right,
    top,
    bottom,
    width: right - left,
    height: bottom - top,
  };
}
