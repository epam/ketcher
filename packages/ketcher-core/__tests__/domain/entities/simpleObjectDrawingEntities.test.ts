import type { RenderersManager } from 'application/render/renderers/RenderersManager';
import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import { SimpleObjectMode } from 'domain/entities/simpleObject';
import { Vec2 } from 'domain/entities/vec2';

function createRenderersManagerMock() {
  return {
    addSimpleObject: vi.fn(),
    deleteSimpleObject: vi.fn(),
    reinitializeViewModel: vi.fn(),
    runPostRenderMethods: vi.fn(),
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
});
