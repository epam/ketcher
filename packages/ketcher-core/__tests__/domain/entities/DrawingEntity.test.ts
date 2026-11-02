import { provideEditorSettings } from 'application/editor/editorSettings';
import type { BaseRenderer } from 'application/render/renderers/BaseRenderer';
import { RxnPlus } from 'domain/entities/CoreRxnPlus';
import type { DrawingEntity } from 'domain/entities/DrawingEntity';
import { Vec2 } from 'domain/entities/vec2';

// Without selection points of the renderer, DrawingEntity selects by its center
// on the canvas: model position * macroModeScale (40 by default).
const MODEL_POSITION = new Vec2(2, 3);
const CANVAS_CENTER_AT_SCALE_40 = new Vec2(80, 120);
const CANVAS_CENTER_AT_SCALE_20 = new Vec2(40, 60);

function buildEntity(selectionPoints?: Vec2[]): DrawingEntity {
  const entity = new RxnPlus(MODEL_POSITION);
  entity.baseRenderer = { selectionPoints } as unknown as BaseRenderer;
  return entity;
}

type SelectAround = (
  entity: DrawingEntity,
  around: Vec2,
  isPreviousSelected: boolean,
  isShiftKeyPressed: boolean,
) => boolean;

const HALF_SIZE = 10;

const shapes: Array<[string, SelectAround]> = [
  [
    'selectIfLocatedInRectangle',
    (entity, around, isPreviousSelected, isShiftKeyPressed) =>
      entity.selectIfLocatedInRectangle(
        new Vec2(around.x - HALF_SIZE, around.y - HALF_SIZE),
        new Vec2(around.x + HALF_SIZE, around.y + HALF_SIZE),
        isPreviousSelected,
        isShiftKeyPressed,
      ),
  ],
  [
    'selectIfLocatedInPolygon',
    (entity, around, isPreviousSelected, isShiftKeyPressed) =>
      entity.selectIfLocatedInPolygon(
        [
          new Vec2(around.x - HALF_SIZE, around.y - HALF_SIZE),
          new Vec2(around.x + HALF_SIZE, around.y - HALF_SIZE),
          new Vec2(around.x + HALF_SIZE, around.y + HALF_SIZE),
          new Vec2(around.x - HALF_SIZE, around.y + HALF_SIZE),
        ],
        isPreviousSelected,
        isShiftKeyPressed,
      ),
  ],
];

const FAR_AWAY = new Vec2(500, 500);

describe.each(shapes)('DrawingEntity.%s', (_name, selectAround) => {
  afterEach(() => {
    provideEditorSettings().macroModeScale = 40;
  });

  it('selects an entity whose center is inside and returns true', () => {
    const entity = buildEntity();

    const changed = selectAround(
      entity,
      CANVAS_CENTER_AT_SCALE_40,
      false,
      false,
    );

    expect(changed).toBe(true);
    expect(entity.selected).toBe(true);
  });

  it('returns false when the entity is already selected and stays inside', () => {
    const entity = buildEntity();
    entity.turnOnSelection();

    const changed = selectAround(
      entity,
      CANVAS_CENTER_AT_SCALE_40,
      false,
      false,
    );

    expect(changed).toBe(false);
    expect(entity.selected).toBe(true);
  });

  it('does not select an entity whose center is outside and returns false', () => {
    const entity = buildEntity();

    const changed = selectAround(entity, FAR_AWAY, false, false);

    expect(changed).toBe(false);
    expect(entity.selected).toBe(false);
  });

  it('deselects a selected entity whose center is outside and returns true', () => {
    const entity = buildEntity();
    entity.turnOnSelection();

    const changed = selectAround(entity, FAR_AWAY, false, false);

    expect(changed).toBe(true);
    expect(entity.selected).toBe(false);
  });

  it('keeps a selected entity outside the shape when shift is pressed with isPreviousSelected', () => {
    const entity = buildEntity();
    entity.turnOnSelection();

    const changed = selectAround(entity, FAR_AWAY, true, true);

    expect(changed).toBe(false);
    expect(entity.selected).toBe(true);
  });

  it('selects an unselected entity outside the shape when shift is pressed with isPreviousSelected', () => {
    const entity = buildEntity();

    const changed = selectAround(entity, FAR_AWAY, true, true);

    expect(changed).toBe(true);
    expect(entity.selected).toBe(true);
  });

  it('deselects an entity outside the shape when shift is pressed without isPreviousSelected', () => {
    const entity = buildEntity();
    entity.turnOnSelection();

    const changed = selectAround(entity, FAR_AWAY, false, true);

    expect(changed).toBe(true);
    expect(entity.selected).toBe(false);
  });

  it('uses the macro mode scale at the time of the call', () => {
    const entity = buildEntity();
    provideEditorSettings().macroModeScale = 20;

    expect(selectAround(entity, CANVAS_CENTER_AT_SCALE_40, false, false)).toBe(
      false,
    );
    expect(entity.selected).toBe(false);

    expect(selectAround(entity, CANVAS_CENTER_AT_SCALE_20, false, false)).toBe(
      true,
    );
    expect(entity.selected).toBe(true);
  });

  it('uses the selection points of the renderer and not the center when they are given', () => {
    const entity = buildEntity([FAR_AWAY]);

    expect(selectAround(entity, CANVAS_CENTER_AT_SCALE_40, false, false)).toBe(
      false,
    );
    expect(entity.selected).toBe(false);

    expect(selectAround(entity, FAR_AWAY, false, false)).toBe(true);
    expect(entity.selected).toBe(true);
  });
});
