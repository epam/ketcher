import { type Mock, vi } from 'vitest';
import { ReImage } from '../reImage';
import { Image } from 'domain/entities/image';
import { Vec2 } from 'domain/entities/vec2';
import { BROKEN_IMAGE_PLACEHOLDER } from 'domain/constants';
import type ReStruct from '../restruct';
import type { RenderOptions } from 'application/render/render.types';

// 1x1 PNG
const VALID_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
// Same PNG cut off in the middle of its pixel data
const TRUNCATED_PNG = VALID_PNG.slice(0, 80);
// Not checked structurally, so it is left to the browser's load events
const JPEG = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ==';

// The probe stands in for the browser Image: tests settle load/error by hand
class ProbeImage {
  static readonly instances: ProbeImage[] = [];
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  src = '';

  constructor() {
    ProbeImage.instances.push(this);
  }
}

const originalImage = globalThis.Image;

interface FakeElement {
  node: SVGElement;
  attr: Mock;
  insertBefore: Mock;
}

function createFakeElement(tag: string): FakeElement {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  document.body.appendChild(node);
  const element: FakeElement = {
    node,
    attr: vi.fn(() => element),
    insertBefore: vi.fn(),
  };
  return element;
}

function createReStruct() {
  const images: FakeElement[] = [];
  const paper = {
    set: () => {
      const items: unknown[] = [];
      const set = {
        push: (item: unknown) => items.push(item),
        attr: () => set,
      };
      return set;
    },
    circle: () => createFakeElement('circle'),
    image: vi.fn(() => {
      const element = createFakeElement('image');
      images.push(element);
      return element;
    }),
  };
  const reStruct = {
    render: { paper },
    molecule: { images: { keyOf: () => 0 } },
    addReObjectPath: vi.fn(),
  } as unknown as ReStruct;
  return { reStruct, paper, images };
}

const renderOptions = {
  microModeScale: 40,
  offset: new Vec2(0, 0),
} as unknown as RenderOptions;

function createImage(bitmap: string) {
  return new Image(bitmap, new Vec2(1, 1), new Vec2(0.5, 0.5));
}

function lastImageSource(paper: { image: Mock }) {
  return paper.image.mock.calls[paper.image.mock.calls.length - 1][0];
}

describe('ReImage.show', () => {
  beforeEach(() => {
    ProbeImage.instances.length = 0;
    globalThis.Image = ProbeImage as unknown as typeof globalThis.Image;
    document.body.innerHTML = '';
  });

  afterAll(() => {
    globalThis.Image = originalImage;
  });

  it('draws the placeholder at once for a corrupted PNG', () => {
    const { reStruct, paper, images } = createReStruct();
    const image = createImage(TRUNCATED_PNG);

    new ReImage(image).show(reStruct, renderOptions);

    expect(lastImageSource(paper)).toBe(BROKEN_IMAGE_PLACEHOLDER);
    expect(images[0].node.dataset.imagePlaceholder).toBe('true');
    expect(images[0].node.dataset.testid).toBe('image');
    expect(ProbeImage.instances).toHaveLength(0);
  });

  it('keeps the original bitmap in the model', () => {
    const { reStruct } = createReStruct();
    const image = createImage(TRUNCATED_PNG);

    new ReImage(image).show(reStruct, renderOptions);

    expect(image.bitmap).toBe(TRUNCATED_PNG);
    expect(image.toKetNode().data).toBe(TRUNCATED_PNG.split(',')[1]);
  });

  it('draws a valid image as is', () => {
    const { reStruct, paper, images } = createReStruct();

    new ReImage(createImage(VALID_PNG)).show(reStruct, renderOptions);
    ProbeImage.instances[0].onload?.();

    expect(lastImageSource(paper)).toBe(VALID_PNG);
    expect(images[0].node.dataset.imagePlaceholder).toBeUndefined();
    expect(images[0].attr).not.toHaveBeenCalled();
  });

  it('swaps in the placeholder when the browser fails to load the image', () => {
    const { reStruct, paper, images } = createReStruct();

    new ReImage(createImage(JPEG)).show(reStruct, renderOptions);
    expect(lastImageSource(paper)).toBe(JPEG);

    ProbeImage.instances[0].onerror?.();

    expect(images[0].attr).toHaveBeenCalledWith({
      src: BROKEN_IMAGE_PLACEHOLDER,
    });
    expect(images[0].node.dataset.imagePlaceholder).toBe('true');
  });

  it('does not touch an element that was removed before loading failed', () => {
    const { reStruct, images } = createReStruct();

    new ReImage(createImage(JPEG)).show(reStruct, renderOptions);
    images[0].node.remove();
    ProbeImage.instances[0].onerror?.();

    expect(images[0].attr).not.toHaveBeenCalled();
    expect(images[0].node.dataset.imagePlaceholder).toBeUndefined();
  });

  it('draws the placeholder directly on re-render once loading failed', () => {
    const { reStruct, paper } = createReStruct();
    const reImage = new ReImage(createImage(JPEG));

    reImage.show(reStruct, renderOptions);
    ProbeImage.instances[0].onerror?.();
    reImage.show(reStruct, renderOptions);

    expect(lastImageSource(paper)).toBe(BROKEN_IMAGE_PLACEHOLDER);
    expect(ProbeImage.instances).toHaveLength(1);
  });

  it('checks the bitmap again when it changes', () => {
    const { reStruct, paper } = createReStruct();
    const image = createImage(TRUNCATED_PNG);
    const reImage = new ReImage(image);

    reImage.show(reStruct, renderOptions);
    image.bitmap = VALID_PNG;
    reImage.show(reStruct, renderOptions);

    expect(lastImageSource(paper)).toBe(VALID_PNG);
  });

  it('draws the bitmap as is when there is no browser Image', () => {
    globalThis.Image = undefined as unknown as typeof globalThis.Image;
    const { reStruct, paper } = createReStruct();

    new ReImage(createImage(JPEG)).show(reStruct, renderOptions);

    expect(lastImageSource(paper)).toBe(JPEG);
  });
});
