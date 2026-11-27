import { CoreImage } from 'domain/entities/CoreImage';
import { Vec2 } from 'domain/entities/vec2';
import { ImageRenderer } from 'application/render/renderers/ImageRenderer';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../helpers/dom';

describe('ImageRenderer', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('draws the bitmap inside an image group', () => {
    createPolymerEditorCanvas();
    const image = new CoreImage(
      'data:image/png;base64,AAAA',
      new Vec2(5, 5),
      new Vec2(2, 2),
    );

    new ImageRenderer(image).show();

    const element = document.querySelector('[data-testid="image"] image');
    expect(element?.getAttribute('href')).toBe('data:image/png;base64,AAAA');
    expect(Number(element?.getAttribute('width'))).toBeGreaterThan(0);
  });

  it('shows two corner handles when the image is selected', () => {
    createPolymerEditorCanvas();
    const image = new CoreImage(
      'data:image/png;base64,AAAA',
      new Vec2(5, 5),
      new Vec2(2, 2),
    );
    image.turnOnSelection();

    new ImageRenderer(image).show();

    expect(
      document.querySelectorAll(
        '[data-testid="image"] circle[data-point-index]',
      ).length,
    ).toBe(2);
  });

  it('is added and removed through the renderers manager', () => {
    createPolymerEditorCanvas();
    const renderersManager = createRenderersManager();
    const image = new CoreImage(
      'data:image/png;base64,AAAA',
      new Vec2(5, 5),
      new Vec2(2, 2),
    );

    renderersManager.addImage(image);
    expect(document.querySelector('[data-testid="image"] image')).toBeTruthy();

    renderersManager.deleteImage(image);
    expect(document.querySelector('[data-testid="image"] image')).toBeFalsy();
  });
});
