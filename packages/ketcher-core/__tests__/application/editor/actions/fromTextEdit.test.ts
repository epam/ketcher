import { fromTextEdit } from 'application/editor/actions/text';
import { Render } from 'application/render';
import { ReStruct } from 'application/render/restruct';
import type { RenderOptions } from 'application/render/render.types';
import { Struct, Text, Vec2 } from 'domain/entities';

describe('fromTextEdit', () => {
  let restruct: ReStruct;

  beforeEach(() => {
    const options = {
      scale: 40,
      width: 100,
      height: 100,
    } as unknown as RenderOptions;
    const render = new Render(document as unknown as HTMLElement, options);
    restruct = new ReStruct(new Struct(), render);
  });

  const addText = (content: string) =>
    restruct.molecule.texts.add(
      new Text({ content, position: new Vec2(0, 0), pos: [] }),
    );

  it('creates a text when a new edit has content and a position', () => {
    const action = fromTextEdit(restruct, {
      id: null,
      originalContent: '',
      nextContent: 'abc',
      position: new Vec2(1, 1),
      pos: [],
    });

    expect(action).not.toBeNull();
    expect(restruct.molecule.texts.size).toBe(1);
  });

  it('does nothing for a new edit without content', () => {
    expect(
      fromTextEdit(restruct, {
        id: null,
        originalContent: '',
        nextContent: '',
        position: new Vec2(1, 1),
        pos: [],
      }),
    ).toBeNull();
  });

  it('deletes an existing text whose content was cleared', () => {
    const id = addText('abc');

    fromTextEdit(restruct, { id, originalContent: 'abc', nextContent: '' });

    expect(restruct.molecule.texts.has(id)).toBe(false);
  });

  it('updates an existing text with new content', () => {
    const id = addText('abc');

    fromTextEdit(restruct, { id, originalContent: 'abc', nextContent: 'xyz' });

    expect(restruct.molecule.texts.get(id)?.content).toBe('xyz');
  });

  it('does nothing when the content did not change', () => {
    const id = addText('abc');

    expect(
      fromTextEdit(restruct, {
        id,
        originalContent: 'abc',
        nextContent: 'abc',
      }),
    ).toBeNull();
  });
});
