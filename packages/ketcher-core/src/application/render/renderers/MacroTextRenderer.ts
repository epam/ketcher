import { Coordinates } from 'application/editor/shared/coordinates';
import { provideEditorSettings } from 'application/editor/editorSettings';
import type { Text } from 'domain/entities/text';
import type { D3SvgElementSelection } from 'application/render/types';

type LexicalTextNode = { text?: string };
type LexicalParagraph = { children?: LexicalTextNode[] };

export class MacroTextRenderer {
  private rootElement?: D3SvgElementSelection<SVGTextElement, void>;

  constructor(
    private readonly text: Text,
    private readonly id: number,
  ) {}

  public show(canvas: D3SvgElementSelection<SVGGElement, void>) {
    const position = Coordinates.modelToCanvas(this.text.position);
    const scale = provideEditorSettings().macroModeScale;
    const fontSize = Math.max(
      8,
      Math.abs(this.text.pos[1].y - this.text.pos[0].y) * scale * 0.8,
    );
    const paragraphs = this.getParagraphs();

    const textElement = canvas
      .append('text')
      .attr('data-testid', 'macro-text-label')
      .attr('data-text-id', this.id)
      .attr('x', position.x)
      .attr('y', position.y + fontSize)
      .attr('font-size', fontSize)
      .attr('font-family', 'Arial, sans-serif')
      .attr('fill', '#000000');

    this.rootElement = textElement as never as D3SvgElementSelection<
      SVGTextElement,
      void
    >;

    paragraphs.forEach((paragraph, index) => {
      this.rootElement
        ?.append('tspan')
        .attr('x', position.x)
        .attr('dy', index === 0 ? 0 : fontSize)
        .text(paragraph);
    });
  }

  public remove() {
    this.rootElement?.remove();
    this.rootElement = undefined;
  }

  private getParagraphs(): string[] {
    try {
      const parsed = JSON.parse(this.text.content) as {
        root?: { children?: LexicalParagraph[] };
      };

      return (
        parsed.root?.children
          ?.map((paragraph) =>
            paragraph.children?.map((node) => node.text ?? '').join(''),
          )
          .filter((paragraph): paragraph is string => paragraph != null) ?? []
      );
    } catch (_error) {
      return [];
    }
  }
}
