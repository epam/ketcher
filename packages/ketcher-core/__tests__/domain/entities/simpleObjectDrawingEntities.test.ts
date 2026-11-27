import type { RenderersManager } from 'application/render/renderers/RenderersManager';
import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import { SimpleObjectMode } from 'domain/entities/simpleObject';
import { Vec2 } from 'domain/entities/vec2';

vi.mock('application/editor/editorSingleton', () => ({
  provideEditorInstance: () => ({ viewModel: { initialize: vi.fn() } }),
}));

function createRenderersManagerMock() {
  return {
    addSimpleObject: vi.fn(),
    deleteSimpleObject: vi.fn(),
    reinitializeViewModel: vi.fn(),
    runPostRenderMethods: vi.fn(),
    moveDrawingEntity: vi.fn(),
    redrawDrawingEntity: vi.fn(),
  } as unknown as RenderersManager;
}

describe('DrawingEntitiesManager simple objects', () => {
  it('adds a simple object to the model and to allEntities', () => {
    const manager = new DrawingEntitiesManager();
    const command = manager.addSimpleObject(
      SimpleObjectMode.rectangle,
      new Vec2(0, 0),
      new Vec2(2, 2),
    );

    command.execute(createRenderersManagerMock());

    expect(manager.simpleObjects.size).toBe(1);
    expect(manager.allEntities).toHaveLength(1);
    expect(manager.hasDrawingEntities).toBe(true);
  });

  it('deletes a simple object through deleteDrawingEntity', () => {
    const manager = new DrawingEntitiesManager();
    manager
      .addSimpleObject(SimpleObjectMode.line, new Vec2(0, 0), new Vec2(3, 3))
      .execute(createRenderersManagerMock());
    const [simpleObject] = manager.allEntitiesArray;

    manager
      .deleteDrawingEntity(simpleObject)
      .execute(createRenderersManagerMock());

    expect(manager.simpleObjects.size).toBe(0);
    expect(manager.hasDrawingEntities).toBe(false);
  });

  it('restores the simple object when the delete is inverted', () => {
    const manager = new DrawingEntitiesManager();
    const renderersManager = createRenderersManagerMock();
    manager
      .addSimpleObject(SimpleObjectMode.ellipse, new Vec2(0, 0), new Vec2(1, 1))
      .execute(renderersManager);
    const [simpleObject] = manager.allEntitiesArray;
    const deleteCommand = manager.deleteDrawingEntity(simpleObject);

    deleteCommand.execute(renderersManager);
    deleteCommand.invert(renderersManager);

    expect(manager.simpleObjects.get(simpleObject.id)).toBe(simpleObject);
  });

  it('moves both points of a selected simple object and restores them on invert', () => {
    const manager = new DrawingEntitiesManager();
    const renderersManager = createRenderersManagerMock();
    manager
      .addSimpleObject(
        SimpleObjectMode.rectangle,
        new Vec2(0, 0),
        new Vec2(2, 2),
      )
      .execute(renderersManager);
    const [simpleObject] = manager.simpleObjects.values();
    simpleObject.turnOnSelection();
    const moveCommand = manager.moveSelectedDrawingEntities(new Vec2(5, 1));

    moveCommand.execute(renderersManager);

    expect(simpleObject.pos[0]).toEqual(new Vec2(5, 1));
    expect(simpleObject.pos[1]).toEqual(new Vec2(7, 3));

    moveCommand.invert(renderersManager);

    expect(simpleObject.pos[0]).toEqual(new Vec2(0, 0));
    expect(simpleObject.pos[1]).toEqual(new Vec2(2, 2));
  });

  it('rotates both points of a selected simple object and restores them on invert', () => {
    const manager = new DrawingEntitiesManager();
    const renderersManager = createRenderersManagerMock();
    manager
      .addSimpleObject(SimpleObjectMode.line, new Vec2(1, 0), new Vec2(3, 0))
      .execute(renderersManager);
    const [simpleObject] = manager.simpleObjects.values();
    simpleObject.turnOnSelection();
    const rotateCommand = manager.rotateSelectedDrawingEntities(
      new Vec2(0, 0),
      90,
    );

    rotateCommand.execute(renderersManager);

    expect(Math.abs(simpleObject.pos[0].x)).toBeCloseTo(0);
    expect(Math.abs(simpleObject.pos[0].y)).toBeCloseTo(1);
    expect(Math.abs(simpleObject.pos[1].x)).toBeCloseTo(0);
    expect(Math.abs(simpleObject.pos[1].y)).toBeCloseTo(3);

    rotateCommand.invert(renderersManager);

    expect(simpleObject.pos[0]).toEqual(new Vec2(1, 0));
    expect(simpleObject.pos[1]).toEqual(new Vec2(3, 0));
  });

  it('mirrors both points of a selected simple object when flipped horizontally', () => {
    const manager = new DrawingEntitiesManager();
    const renderersManager = createRenderersManagerMock();
    manager
      .addSimpleObject(SimpleObjectMode.line, new Vec2(1, 0), new Vec2(3, 0))
      .execute(renderersManager);
    const [simpleObject] = manager.simpleObjects.values();
    simpleObject.turnOnSelection();
    const flipCommand = manager.flipSelectedDrawingEntities('horizontal');

    flipCommand.execute(renderersManager);

    expect(simpleObject.pos[1].x - simpleObject.pos[0].x).toBeCloseTo(-2);
    expect(simpleObject.pos[0].y).toBeCloseTo(0);
    expect(simpleObject.pos[1].y).toBeCloseTo(0);

    flipCommand.invert(renderersManager);

    expect(simpleObject.pos[0]).toEqual(new Vec2(1, 0));
    expect(simpleObject.pos[1]).toEqual(new Vec2(3, 0));
  });
  it('records a rotation drag so undo restores the starting points', () => {
    const manager = new DrawingEntitiesManager();
    const renderersManager = createRenderersManagerMock();
    manager
      .addSimpleObject(SimpleObjectMode.line, new Vec2(1, 0), new Vec2(3, 0))
      .execute(renderersManager);
    const [simpleObject] = manager.simpleObjects.values();
    simpleObject.turnOnSelection();
    const startPoints = manager.getSelectedSimpleObjectPoints();

    manager
      .rotateSelectedDrawingEntities(new Vec2(0, 0), 90)
      .execute(renderersManager);
    const historyCommand = manager.createRotationHistoryCommand(
      new Map(),
      startPoints,
    );

    historyCommand.invert(renderersManager);

    expect(simpleObject.pos[0]).toEqual(new Vec2(1, 0));
    expect(simpleObject.pos[1]).toEqual(new Vec2(3, 0));
  });
  it('copies a simple object with mode and points through mergeInto', () => {
    const source = new DrawingEntitiesManager();
    const target = new DrawingEntitiesManager();
    const renderersManager = createRenderersManagerMock();
    source
      .addSimpleObject(SimpleObjectMode.ellipse, new Vec2(1, 1), new Vec2(4, 3))
      .execute(renderersManager);
    const [original] = source.simpleObjects.values();

    const { command, mergedDrawingEntities } = source.mergeInto(target);
    command.execute(renderersManager);

    const [copied] = target.simpleObjects.values();
    expect(target.simpleObjects.size).toBe(1);
    expect(copied).not.toBe(original);
    expect(copied.mode).toBe(SimpleObjectMode.ellipse);
    expect(copied.pos).toEqual([new Vec2(1, 1), new Vec2(4, 3)]);
    expect(mergedDrawingEntities.simpleObjects.size).toBe(1);
  });

  it('filterSelection copies only the selected simple objects', () => {
    const source = new DrawingEntitiesManager();
    const renderersManager = createRenderersManagerMock();
    source
      .addSimpleObject(SimpleObjectMode.line, new Vec2(0, 0), new Vec2(2, 0))
      .execute(renderersManager);
    source
      .addSimpleObject(
        SimpleObjectMode.rectangle,
        new Vec2(5, 5),
        new Vec2(6, 6),
      )
      .execute(renderersManager);
    const [selected] = source.simpleObjects.values();
    selected.turnOnSelection();

    const filtered = source.filterSelection();

    const [copy] = filtered.simpleObjects.values();
    expect(filtered.simpleObjects.size).toBe(1);
    expect(copy.mode).toBe(SimpleObjectMode.line);
    expect(copy.pos).toEqual([new Vec2(0, 0), new Vec2(2, 0)]);
  });
});
