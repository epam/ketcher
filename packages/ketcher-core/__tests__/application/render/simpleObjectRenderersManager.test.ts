import { Vec2 } from 'domain/entities/vec2';
import { CoreSimpleObject } from 'domain/entities/CoreSimpleObject';
import { SimpleObjectMode } from 'domain/entities/simpleObject';
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
});
