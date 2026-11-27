import { Vec2 } from 'domain/entities/vec2';
import { CoreSimpleObject } from 'domain/entities/CoreSimpleObject';
import { SimpleObjectMode } from 'domain/entities/simpleObject';
import { SimpleObjectRenderer } from 'application/render/renderers/SimpleObjectRenderer';
import { createPolymerEditorCanvas } from '../../helpers/dom';
import { SELECTION_COLOR } from 'application/render/renderers/constants';
import { Coordinates } from 'application/editor/shared/coordinates';

describe('SimpleObjectRenderer', () => {
  it('draws a rectangle inside a simple-object group', () => {
    createPolymerEditorCanvas();
    const simpleObject = new CoreSimpleObject(
      SimpleObjectMode.rectangle,
      new Vec2(0, 0),
      new Vec2(2, 3),
    );

    new SimpleObjectRenderer(simpleObject).show();

    const group = document.querySelector('[data-testid="simple-object"]');
    const rect = group?.querySelector('rect');
    expect(rect).toBeTruthy();
    expect(Number(rect?.getAttribute('width'))).toBeGreaterThan(0);
    expect(Number(rect?.getAttribute('height'))).toBeGreaterThan(0);
    expect(simpleObject.baseRenderer).toBeDefined();
  });
  it('draws an ellipse and a line for their modes', () => {
    createPolymerEditorCanvas();

    new SimpleObjectRenderer(
      new CoreSimpleObject(
        SimpleObjectMode.ellipse,
        new Vec2(0, 0),
        new Vec2(2, 2),
      ),
    ).show();
    new SimpleObjectRenderer(
      new CoreSimpleObject(
        SimpleObjectMode.line,
        new Vec2(0, 0),
        new Vec2(3, 1),
      ),
    ).show();

    expect(
      document.querySelector('[data-testid="simple-object"] ellipse'),
    ).toBeTruthy();
    expect(
      document.querySelector('[data-testid="simple-object"] line'),
    ).toBeTruthy();
  });
  it('shows a selection box for a selected simple object', () => {
    createPolymerEditorCanvas();
    const simpleObject = new CoreSimpleObject(
      SimpleObjectMode.rectangle,
      new Vec2(0, 0),
      new Vec2(2, 2),
    );
    simpleObject.turnOnSelection();

    new SimpleObjectRenderer(simpleObject).show();

    expect(
      document.querySelector(`rect[fill="${SELECTION_COLOR}"]`),
    ).toBeTruthy();
  });

  it('shows a hover outline while the pointer is over the object', () => {
    createPolymerEditorCanvas();
    new SimpleObjectRenderer(
      new CoreSimpleObject(
        SimpleObjectMode.line,
        new Vec2(0, 0),
        new Vec2(3, 1),
      ),
    ).show();

    const group = [
      ...document.querySelectorAll('[data-testid="simple-object"]'),
    ].at(-1);
    const hoverArea = group?.querySelector('rect[pointer-events="all"]');
    expect(group?.querySelector('rect[stroke="#0097A8"]')).toBeFalsy();

    hoverArea?.dispatchEvent(new Event('mouseover'));
    expect(group?.querySelector('rect[stroke="#0097A8"]')).toBeTruthy();

    hoverArea?.dispatchEvent(new Event('mouseout'));
    expect(group?.querySelector('rect[stroke="#0097A8"]')).toBeFalsy();
  });
  it('binds the renderer to the clickable shape so the select tools can find it', () => {
    createPolymerEditorCanvas();
    new SimpleObjectRenderer(
      new CoreSimpleObject(
        SimpleObjectMode.line,
        new Vec2(0, 0),
        new Vec2(3, 1),
      ),
    ).show();

    const shape = document.querySelector('[data-testid="simple-object"] line');

    expect(
      (shape as unknown as { __data__?: unknown }).__data__,
    ).toBeInstanceOf(SimpleObjectRenderer);
  });

  it('selects the simple object when a selection rectangle covers it', () => {
    createPolymerEditorCanvas();
    const simpleObject = new CoreSimpleObject(
      SimpleObjectMode.rectangle,
      new Vec2(0, 0),
      new Vec2(2, 2),
    );
    new SimpleObjectRenderer(simpleObject).show();
    const center = Coordinates.modelToCanvas(simpleObject.center);

    const changed = simpleObject.selectIfLocatedInRectangle(
      new Vec2(center.x - 500, center.y - 500),
      new Vec2(center.x + 500, center.y + 500),
    );

    expect(changed).toBe(true);
    expect(simpleObject.selected).toBe(true);
  });
});
