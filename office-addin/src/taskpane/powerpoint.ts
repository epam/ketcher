import {
  BASE_WIDTH_TAG,
  KET_TAG,
  type StructurePayload,
} from '../shared/messages';

export interface SelectedStructure {
  slideId: string;
  shapeId: string;
  ket: string;
  left: number;
  top: number;
  width: number;
  baseWidth: number | null;
}

// Returns the selected picture if Ketcher inserted it, otherwise null.
export async function getSelectedStructure(): Promise<SelectedStructure | null> {
  return PowerPoint.run(async (context) => {
    const slides = context.presentation.getSelectedSlides();
    const shapes = context.presentation.getSelectedShapes();
    slides.load('items/id');
    shapes.load('items/id,items/left,items/top,items/width');
    await context.sync();

    if (shapes.items.length !== 1 || slides.items.length === 0) return null;

    const shape = shapes.items[0];
    const ketTag = shape.tags.getItemOrNullObject(KET_TAG);
    const baseWidthTag = shape.tags.getItemOrNullObject(BASE_WIDTH_TAG);
    ketTag.load('value');
    baseWidthTag.load('value');
    await context.sync();

    if (ketTag.isNullObject) return null;

    const baseWidth = baseWidthTag.isNullObject
      ? NaN
      : Number(baseWidthTag.value);

    return {
      slideId: slides.items[0].id,
      shapeId: shape.id,
      ket: ketTag.value,
      left: shape.left,
      top: shape.top,
      width: shape.width,
      baseWidth: Number.isFinite(baseWidth) && baseWidth > 0 ? baseWidth : null,
    };
  });
}

function insertSvgAtSelection(
  svg: string,
  options: Office.SetSelectedDataOptions,
): Promise<void> {
  return new Promise((resolve, reject) => {
    Office.context.document.setSelectedDataAsync(
      svg,
      { coercionType: Office.CoercionType.XmlSvg, ...options },
      (result) => {
        if (result.status === Office.AsyncResultStatus.Failed) {
          reject(new Error(result.error.message));
        } else {
          resolve();
        }
      },
    );
  });
}

// Inserts the structure as an SVG picture and keeps its KET in the picture's
// tags, so the picture can be opened in Ketcher again. With `replace`, the old
// picture is removed and the new one takes its place and scale.
export async function insertStructure(
  { ket, svg }: StructurePayload,
  replace?: SelectedStructure,
): Promise<void> {
  const { slideId, existingShapeIds } = await PowerPoint.run(
    async (context) => {
      if (replace) {
        context.presentation.setSelectedSlides([replace.slideId]);
        context.presentation.slides
          .getItem(replace.slideId)
          .shapes.getItem(replace.shapeId)
          .delete();
        await context.sync();
      }

      const slide = context.presentation.getSelectedSlides().getItemAt(0);
      slide.load('id');
      slide.shapes.load('items/id');
      await context.sync();

      return {
        slideId: slide.id,
        existingShapeIds: new Set(slide.shapes.items.map((shape) => shape.id)),
      };
    },
  );

  await insertSvgAtSelection(
    svg,
    replace ? { imageLeft: replace.left, imageTop: replace.top } : {},
  );

  await PowerPoint.run(async (context) => {
    const slide = context.presentation.slides.getItem(slideId);
    slide.shapes.load('items/id,items/width,items/height');
    await context.sync();

    const inserted = slide.shapes.items.find(
      (shape) => !existingShapeIds.has(shape.id),
    );
    if (!inserted) {
      throw new Error('PowerPoint did not report the inserted picture.');
    }

    const baseWidth = inserted.width;
    inserted.name = 'Ketcher structure';
    inserted.tags.add(KET_TAG, ket);
    inserted.tags.add(BASE_WIDTH_TAG, String(baseWidth));

    if (replace?.baseWidth) {
      const scale = replace.width / replace.baseWidth;
      inserted.width = baseWidth * scale;
      inserted.height = inserted.height * scale;
    }

    slide.setSelectedShapes([inserted.id]);
    await context.sync();
  });
}
