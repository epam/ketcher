import { Vec2 } from 'domain/entities/vec2';
import { CoreSimpleObject } from 'domain/entities/CoreSimpleObject';
import { SimpleObjectMode } from 'domain/entities/simpleObject';
import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../helpers/dom';

describe('RenderersManager simple objects', () => {
  it('draws a simple object on add and removes it on delete', () => {
    createPolymerEditorCanvas();
    const renderersManager = createRenderersManager();
    const simpleObject = new CoreSimpleObject(
      SimpleObjectMode.rectangle,
      new Vec2(0, 0),
      new Vec2(2, 2),
    );

    renderersManager.addSimpleObject(simpleObject);
    expect(
      document.querySelector('[data-testid="simple-object"] rect'),
    ).toBeTruthy();

    renderersManager.deleteSimpleObject(simpleObject);
    expect(
      document.querySelector('[data-testid="simple-object"] rect'),
    ).toBeFalsy();
  });
  it('removes the drawn shape when the object is erased', () => {
    createPolymerEditorCanvas();
    const renderersManager = createRenderersManager();
    const manager = new DrawingEntitiesManager();
    manager
      .addSimpleObject(SimpleObjectMode.line, new Vec2(0, 0), new Vec2(2, 0))
      .operations[0].execute(renderersManager);
    const [simpleObject] = manager.simpleObjects.values();

    manager
      .deleteDrawingEntity(simpleObject)
      .operations[0].execute(renderersManager);

    expect(document.querySelector('[data-testid="simple-object"]')).toBeFalsy();
  });
});
