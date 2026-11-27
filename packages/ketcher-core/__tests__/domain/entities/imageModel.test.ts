import type { RenderersManager } from 'application/render/renderers/RenderersManager';
import { CoreEditor } from 'application/editor';
import { KetSerializer } from 'domain/serializers/ket';
import { MacromoleculesConverter } from 'application/editor/MacromoleculesConverter';
import { CoreImage } from 'domain/entities/CoreImage';
import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import { Image as MicromoleculesImage } from 'domain/entities/image';
import { Struct } from 'domain/entities/struct';
import { Vec2 } from 'domain/entities/vec2';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../helpers/dom';

const BITMAP = 'data:image/png;base64,AAAA';

function createRenderersManagerMock() {
  return {
    addImage: vi.fn(),
    deleteImage: vi.fn(),
    redrawDrawingEntity: vi.fn(),
    reinitializeViewModel: vi.fn(),
    runPostRenderMethods: vi.fn(),
  } as unknown as RenderersManager;
}

describe('CoreImage model', () => {
  it('uses the top-left corner as position and keeps the centre', () => {
    const image = new CoreImage(BITMAP, new Vec2(10, 10), new Vec2(4, 3));

    expect(image.position).toEqual(new Vec2(6, 7));
    expect(image.center).toEqual(new Vec2(10, 10));
  });

  it('moves and resizes from its corners', () => {
    const image = new CoreImage(BITMAP, new Vec2(10, 10), new Vec2(4, 3));

    image.moveRelative(new Vec2(1, -2));
    expect(image.center).toEqual(new Vec2(11, 8));

    image.resize(new Vec2(0, 0), new Vec2(10, 4));
    expect(image.center).toEqual(new Vec2(5, 2));
    expect(image.bottomRight).toEqual(new Vec2(10, 4));
  });
});

describe('DrawingEntitiesManager images', () => {
  it('adds an image to the model and undoes the add', () => {
    const manager = new DrawingEntitiesManager();
    const renderersManager = createRenderersManagerMock();
    const command = manager.addImage(BITMAP, new Vec2(10, 10), new Vec2(4, 3));

    command.execute(renderersManager);
    expect(manager.images.size).toBe(1);
    expect(manager.hasDrawingEntities).toBe(true);

    command.invert(renderersManager);
    expect(manager.images.size).toBe(0);
  });

  it('deletes an image through deleteDrawingEntity and restores it on invert', () => {
    const manager = new DrawingEntitiesManager();
    const renderersManager = createRenderersManagerMock();
    manager
      .addImage(BITMAP, new Vec2(10, 10), new Vec2(4, 3))
      .operations[0].execute(renderersManager);
    const [image] = manager.images.values();

    const deleteCommand = manager.deleteDrawingEntity(image);
    deleteCommand.operations[0].execute(renderersManager);
    expect(manager.images.size).toBe(0);

    deleteCommand.operations[0].invert(renderersManager);
    expect(manager.images.get(image.id)).toBe(image);
  });

  it('moves a selected image and restores it on invert', () => {
    const manager = new DrawingEntitiesManager();
    const renderersManager = createRenderersManagerMock();
    manager
      .addImage(BITMAP, new Vec2(10, 10), new Vec2(4, 3))
      .operations[0].execute(renderersManager);
    const [image] = manager.images.values();
    image.turnOnSelection();

    const moveCommand = manager.moveSelectedDrawingEntities(new Vec2(2, 0));
    moveCommand.execute(renderersManager);
    expect(image.center).toEqual(new Vec2(12, 10));

    moveCommand.invert(renderersManager);
    expect(image.center).toEqual(new Vec2(10, 10));
  });

  it('copies an image with its size through filterSelection', () => {
    const source = new DrawingEntitiesManager();
    const renderersManager = createRenderersManagerMock();
    source
      .addImage(BITMAP, new Vec2(10, 10), new Vec2(4, 3))
      .operations[0].execute(renderersManager);
    const [image] = source.images.values();
    image.turnOnSelection();

    const copy = source.filterSelection();
    const [copied] = copy.images.values();

    expect(copy.images.size).toBe(1);
    expect(copied.bitmap).toBe(BITMAP);
    expect(copied.center).toEqual(new Vec2(10, 10));
    expect(copied.getState().halfSize).toEqual(new Vec2(4, 3));
  });
});

describe('MacromoleculesConverter images', () => {
  const createEditor = () =>
    new CoreEditor({
      canvas: createPolymerEditorCanvas(),
      theme: {},
      renderersContainer: createRenderersManager(),
    });

  it('keeps an image position through a micro -> macro -> micro round trip', () => {
    const editor = createEditor();
    const struct = new Struct();
    struct.images.add(
      new MicromoleculesImage(BITMAP, new Vec2(10, 20), new Vec2(4, 3)),
    );

    struct.scale(2);
    MacromoleculesConverter.convertStructToDrawingEntities(
      struct,
      editor.drawingEntitiesManager,
    );
    const [macroImage] = editor.drawingEntitiesManager.images.values();
    expect(macroImage.center.x).toBeCloseTo(20);
    expect(macroImage.center.y).toBeCloseTo(40);

    const restored = new Struct();
    MacromoleculesConverter.convertDrawingEntitiesToStruct(
      editor.drawingEntitiesManager,
      restored,
    );
    restored.scale(0.5);

    const [microImage] = restored.images.values();
    expect(restored.images.size).toBe(1);
    expect(microImage.center().x).toBeCloseTo(10);
    expect(microImage.center().y).toBeCloseTo(20);
    expect(microImage.getBottomRightPosition().x).toBeCloseTo(14);
    expect(microImage.getBottomRightPosition().y).toBeCloseTo(23);
  });
});

describe('KET save of macro images', () => {
  it('writes a macro image exactly once', () => {
    const manager = new DrawingEntitiesManager();
    manager.addImage(BITMAP, new Vec2(10, 10), new Vec2(4, 3));
    const serializer = new KetSerializer();
    const serialized = serializer.serialize(
      manager.micromoleculesHiddenEntities.clone(),
      manager,
    );
    const parsed = JSON.parse(serialized);
    const imageNodes = parsed.root.nodes.filter(
      (node: { type: string }) => node.type === 'image',
    );

    expect(imageNodes).toHaveLength(1);
  });
});
