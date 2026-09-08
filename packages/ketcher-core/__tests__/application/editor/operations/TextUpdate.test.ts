import { TextUpdate } from 'application/editor/operations/Text/TextUpdate';
import { Render } from 'application/render';
import { ReStruct } from 'application/render/restruct';
import type { RenderOptions } from 'application/render/render.types';
import { Struct, Text, Vec2 } from 'domain/entities';

describe('TextUpdate', () => {
  let restruct: ReStruct;

  beforeEach(() => {
    const struct = new Struct();
    const options = {
      scale: 40,
      width: 100,
      height: 100,
    } as unknown as RenderOptions;
    const render = new Render(document as unknown as HTMLElement, options);
    restruct = new ReStruct(struct, render);
  });

  it('updates text content and can be inverted after execution', () => {
    const textId = restruct.molecule.texts.add(
      new Text({ content: 'old content', position: new Vec2(0, 0), pos: [] }),
    );
    const update = new TextUpdate(textId, 'new content');

    update.execute(restruct);

    expect(restruct.molecule.texts.get(textId)?.content).toBe('new content');

    const inverted = update.invert();
    inverted.execute(restruct);

    expect(restruct.molecule.texts.get(textId)?.content).toBe('old content');
  });

  it('keeps operation safe when invert is called before previousContent is captured', () => {
    const textId = restruct.molecule.texts.add(
      new Text({ content: 'old content', position: new Vec2(0, 0), pos: [] }),
    );
    const update = new TextUpdate(textId, 'new content');

    const inverted = update.invert();
    inverted.execute(restruct);

    expect(inverted.data.content).toBe('new content');
    expect(inverted.data.previousContent).toBe('new content');
    expect(restruct.molecule.texts.get(textId)?.content).toBe('old content');
  });
});
