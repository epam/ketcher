import { CoreText } from 'domain/entities/CoreText';
import { Vec2 } from 'domain/entities/vec2';
import {
  parseTextLines,
  TextRenderer,
} from 'application/render/renderers/TextRenderer';
import { createPolymerEditorCanvas } from '../../helpers/dom';

const CONTENT =
  '{\"root\":{\"children\":[{\"children\":[{\"format\":1,\"text\":\"Hello\",\"type\":\"text\"}],\"type\":\"paragraph\"},{\"children\":[{\"format\":0,\"text\":\"World\",\"type\":\"text\"}],\"type\":\"paragraph\"}],\"type\":\"root\"}}';

describe('TextRenderer', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('parses each paragraph into runs with bold and italic flags', () => {
    const lines = parseTextLines(CONTENT);

    expect(lines).toHaveLength(2);
    expect(lines[0][0]).toEqual({ text: 'Hello', bold: true, italic: false });
    expect(lines[1][0].text).toBe('World');
  });

  it('falls back to one empty line for invalid content', () => {
    expect(parseTextLines('not json')).toEqual([
      [{ text: '', bold: false, italic: false }],
    ]);
  });

  it('draws one line per paragraph inside a text group', () => {
    createPolymerEditorCanvas();
    new TextRenderer(new CoreText(CONTENT, new Vec2(2, 2))).show();

    const group = document.querySelector('[data-testid="text"]');
    const lineTexts = [...(group?.querySelectorAll('text tspan') ?? [])].map(
      (node) => node.textContent,
    );

    expect(lineTexts).toContain('Hello');
    expect(lineTexts).toContain('World');
  });
});
