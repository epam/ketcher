import { CoreEditor } from 'application/editor';
import { MacromoleculesConverter } from 'application/editor/MacromoleculesConverter';
import { SimpleObject, SimpleObjectMode } from 'domain/entities/simpleObject';
import { Struct } from 'domain/entities/struct';
import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import { Vec2 } from 'domain/entities/vec2';
import { KetSerializer } from 'domain/serializers/ket';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../helpers/dom';

describe('MacromoleculesConverter simple objects', () => {
  it('converts a loaded simple object into a macro entity and keeps it out of the hidden pool', () => {
    const editor = new CoreEditor({
      canvas: createPolymerEditorCanvas(),
      theme: {},
      renderersContainer: createRenderersManager(),
    });
    const struct = new Struct();
    struct.simpleObjects.add(
      new SimpleObject({
        mode: SimpleObjectMode.rectangle,
        pos: [
          { x: 0, y: 0 },
          { x: 2, y: 2 },
        ],
      }),
    );

    MacromoleculesConverter.convertStructToDrawingEntities(
      struct,
      editor.drawingEntitiesManager,
    );

    const manager = editor.drawingEntitiesManager;
    const [converted] = manager.simpleObjects.values();
    expect(manager.simpleObjects.size).toBe(1);
    expect(converted.mode).toBe(SimpleObjectMode.rectangle);
    expect(converted.pos).toEqual([
      expect.objectContaining({ x: 0, y: 0 }),
      expect.objectContaining({ x: 2, y: 2 }),
    ]);
    expect(manager.micromoleculesHiddenEntities.simpleObjects.size).toBe(0);
  });
  it('writes a macro simple object back into the micro struct once', () => {
    const manager = new DrawingEntitiesManager();
    manager.addSimpleObject(
      SimpleObjectMode.ellipse,
      new Vec2(1, 1),
      new Vec2(4, 3),
    );
    const struct = new Struct();

    MacromoleculesConverter.convertDrawingEntitiesToStruct(manager, struct);

    const [written] = struct.simpleObjects.values();
    expect(struct.simpleObjects.size).toBe(1);
    expect(written.mode).toBe(SimpleObjectMode.ellipse);
    expect(written.pos).toEqual([new Vec2(1, 1), new Vec2(4, 3)]);
  });
  it('serializes a macro simple object exactly once', () => {
    const manager = new DrawingEntitiesManager();
    manager.addSimpleObject(
      SimpleObjectMode.line,
      new Vec2(0, 0),
      new Vec2(2, 0),
    );

    const serialized = new KetSerializer().serialize(
      manager.micromoleculesHiddenEntities.clone(),
      manager,
    );
    const parsed = JSON.parse(serialized);
    const simpleObjectNodes = parsed.root.nodes.filter(
      (node: { type: string }) => node.type === 'simpleObject',
    );

    expect(simpleObjectNodes).toHaveLength(1);
  });
  it('keeps simple object positions through a micro -> macro -> micro round trip', () => {
    const editor = new CoreEditor({
      canvas: createPolymerEditorCanvas(),
      theme: {},
      renderersContainer: createRenderersManager(),
    });
    const struct = new Struct();
    struct.simpleObjects.add(
      new SimpleObject({
        mode: SimpleObjectMode.ellipse,
        pos: [
          { x: 10, y: 20 },
          { x: 30, y: 40 },
        ],
      }),
    );
    const scaleFactor = 2;

    struct.scale(scaleFactor);
    MacromoleculesConverter.convertStructToDrawingEntities(
      struct,
      editor.drawingEntitiesManager,
    );

    const restoredStruct = new Struct();
    MacromoleculesConverter.convertDrawingEntitiesToStruct(
      editor.drawingEntitiesManager,
      restoredStruct,
    );
    restoredStruct.scale(1 / scaleFactor);

    const [restored] = restoredStruct.simpleObjects.values();
    expect(restoredStruct.simpleObjects.size).toBe(1);
    expect(restored.mode).toBe(SimpleObjectMode.ellipse);
    expect(restored.pos[0].x).toBeCloseTo(10);
    expect(restored.pos[0].y).toBeCloseTo(20);
    expect(restored.pos[1].x).toBeCloseTo(30);
    expect(restored.pos[1].y).toBeCloseTo(40);
  });
  it('keeps a macro simple object through a KET copy and paste', () => {
    const manager = new DrawingEntitiesManager();
    manager.addSimpleObject(
      SimpleObjectMode.ellipse,
      new Vec2(1, 1),
      new Vec2(4, 3),
    );
    const serializer = new KetSerializer();
    const serialized = serializer.serialize(
      manager.micromoleculesHiddenEntities.clone(),
      manager,
    );

    const drawingEntitiesManager =
      serializer.deserializeToDrawingEntities(
        serialized,
      )?.drawingEntitiesManager;

    const [pasted] = [
      ...(drawingEntitiesManager?.simpleObjects.values() ?? []),
    ];
    expect(drawingEntitiesManager?.simpleObjects.size).toBe(1);
    expect(pasted.mode).toBe(SimpleObjectMode.ellipse);
    expect(pasted.pos).toEqual([new Vec2(1, 1), new Vec2(4, 3)]);
  });
});
