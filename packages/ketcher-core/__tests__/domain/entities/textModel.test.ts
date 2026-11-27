import type { RenderersManager } from 'application/render/renderers/RenderersManager';
import { CoreEditor } from 'application/editor';
import { MacromoleculesConverter } from 'application/editor/MacromoleculesConverter';
import { CoreText } from 'domain/entities/CoreText';
import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import { Struct } from 'domain/entities/struct';
import { Text as MicromoleculesText } from 'domain/entities/text';
import { Vec2 } from 'domain/entities/vec2';
import { KetSerializer } from 'domain/serializers/ket';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../helpers/dom';

const CONTENT =
  '{\"root\":{\"children\":[{\"children\":[{\"format\":1,\"text\":\"Hello\",\"type\":\"text\"}],\"type\":\"paragraph\"},{\"children\":[{\"format\":0,\"text\":\"World\",\"type\":\"text\"}],\"type\":\"paragraph\"}],\"type\":\"root\"}}';

function createRenderersManagerMock() {
  return {
    addText: vi.fn(),
    deleteText: vi.fn(),
    redrawDrawingEntity: vi.fn(),
    reinitializeViewModel: vi.fn(),
    runPostRenderMethods: vi.fn(),
  } as unknown as RenderersManager;
}

describe('CoreText model and manager', () => {
  it('moves and reports its position', () => {
    const text = new CoreText(CONTENT, new Vec2(1, 2));
    text.moveRelative(new Vec2(3, 4));
    expect(text.position).toEqual(new Vec2(4, 6));
  });

  it('adds, deletes and restores a text', () => {
    const manager = new DrawingEntitiesManager();
    const renderersManager = createRenderersManagerMock();
    manager.addText(CONTENT, new Vec2(1, 1)).execute(renderersManager);
    expect(manager.texts.size).toBe(1);

    const [text] = manager.texts.values();
    const deleteCommand = manager.deleteDrawingEntity(text);
    deleteCommand.operations[0].execute(renderersManager);
    expect(manager.texts.size).toBe(0);

    deleteCommand.operations[0].invert(renderersManager);
    expect(manager.texts.get(text.id)).toBe(text);
  });

  it('updates the content and undoes the update', () => {
    const manager = new DrawingEntitiesManager();
    const renderersManager = createRenderersManagerMock();
    manager.addText(CONTENT, new Vec2(1, 1)).execute(renderersManager);
    const [text] = manager.texts.values();

    const updateCommand = manager.updateText(text, 'changed');
    updateCommand.execute(renderersManager);
    expect(text.content).toBe('changed');

    updateCommand.invert(renderersManager);
    expect(text.content).toBe(CONTENT);
  });
});

describe('text conversion and KET save', () => {
  it('keeps content and position through micro -> macro -> micro', () => {
    const editor = new CoreEditor({
      canvas: createPolymerEditorCanvas(),
      theme: {},
      renderersContainer: createRenderersManager(),
    });
    const struct = new Struct();
    struct.texts.add(
      new MicromoleculesText({
        content: CONTENT,
        position: new Vec2(10, 20),
        pos: [],
      }),
    );

    MacromoleculesConverter.convertStructToDrawingEntities(
      struct,
      editor.drawingEntitiesManager,
    );
    const [macroText] = editor.drawingEntitiesManager.texts.values();
    expect(macroText.content).toBe(CONTENT);

    const restored = new Struct();
    MacromoleculesConverter.convertDrawingEntitiesToStruct(
      editor.drawingEntitiesManager,
      restored,
    );
    const [microText] = restored.texts.values();
    expect(restored.texts.size).toBe(1);
    expect(microText.content).toBe(CONTENT);
    expect(microText.position).toEqual(new Vec2(10, 20));
  });

  it('writes a macro text exactly once', () => {
    const manager = new DrawingEntitiesManager();
    manager.addText(CONTENT, new Vec2(1, 1));
    const serializer = new KetSerializer();
    const parsed = JSON.parse(
      serializer.serialize(
        manager.micromoleculesHiddenEntities.clone(),
        manager,
      ),
    );
    const textNodes = parsed.root.nodes.filter(
      (node: { type: string }) => node.type === 'text',
    );

    expect(textNodes).toHaveLength(1);
  });
});

describe('text copies keep the text', () => {
  it('mergeInto copies a text into the clone used by export', () => {
    const source = new DrawingEntitiesManager();
    source.addText(CONTENT, new Vec2(1, 1));
    const { mergedDrawingEntities } = source.mergeInto(
      new DrawingEntitiesManager(),
    );

    expect(mergedDrawingEntities.texts.size).toBe(1);
  });

  it('filterSelection copies a selected text', () => {
    const source = new DrawingEntitiesManager();
    source.addText(CONTENT, new Vec2(1, 1));
    const [text] = source.texts.values();
    text.turnOnSelection();

    const filtered = source.filterSelection();

    expect(filtered.texts.size).toBe(1);
    expect([...filtered.texts.values()][0].content).toBe(CONTENT);
  });
});
