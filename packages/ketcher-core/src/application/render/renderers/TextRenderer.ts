import { BaseRenderer } from 'application/render/renderers/BaseRenderer';
import type { D3SvgElementSelection } from 'application/render/types';
import { Coordinates } from 'application/editor/shared/coordinates';
import { provideEditorSettings } from 'application/editor/editorSettings';
import type { CoreText } from 'domain/entities/CoreText';
import { Vec2 } from 'domain/entities/vec2';
import {
  SELECTION_COLOR,
  SELECTION_OUTLINE_COLOR,
} from 'application/render/renderers/constants';

const HOVER_COLOR = '#0097A8';
const BOLD_FLAG = 1;
const ITALIC_FLAG = 2;
const LINE_HEIGHT_RATIO = 1.25;

export interface TextRun {
  text: string;
  bold: boolean;
  italic: boolean;
}

export function parseTextLines(content: string): TextRun[][] {
  let root: { children?: unknown[] } | undefined;
  try {
    root = JSON.parse(content).root;
  } catch {
    return [[{ text: '', bold: false, italic: false }]];
  }

  const paragraphs = (root?.children ?? []) as Array<{ children?: unknown[] }>;
  const lines = paragraphs.map((paragraph) =>
    (
      (paragraph.children ?? []) as Array<{
        type?: string;
        text?: string;
        format?: number;
      }>
    )
      .filter((node) => node.type === 'text')
      .map((node) => ({
        text: node.text ?? '',
        bold: ((node.format ?? 0) & BOLD_FLAG) !== 0,
        italic: ((node.format ?? 0) & ITALIC_FLAG) !== 0,
      })),
  );

  return lines.length > 0
    ? lines
    : [[{ text: '', bold: false, italic: false }]];
}

export class TextRenderer extends BaseRenderer {
  private selectionElement:
    D3SvgElementSelection<SVGRectElement, void> | undefined;

  constructor(public text: CoreText) {
    super(text);
    this.text.setBaseRenderer(this as BaseRenderer);
  }

  private get fontSize() {
    return provideEditorSettings().macroModeScale * 0.4;
  }

  private get canvasPosition() {
    return Coordinates.modelToCanvas(this.text.position);
  }

  private get contourPadding() {
    return provideEditorSettings().macroModeScale / 4;
  }

  private get contourGeometry() {
    const { x, y } = this.canvasPosition;
    const width = this.text.size.x * provideEditorSettings().macroModeScale;
    const height = this.text.size.y * provideEditorSettings().macroModeScale;
    const padding = this.contourPadding;

    return {
      x: x - padding,
      y: y - padding,
      width: width + padding * 2,
      height: height + padding * 2,
    };
  }

  private setContourAttributes(
    contourElement: D3SvgElementSelection<SVGRectElement, void>,
  ) {
    const { x, y, width, height } = this.contourGeometry;

    return contourElement
      .attr('x', x)
      .attr('y', y)
      .attr('width', width)
      .attr('height', height)
      .attr('rx', this.contourPadding / 2);
  }

  public show() {
    this.rootElement = this.canvas
      .insert('g', `.monomer`)
      .data([this])
      .attr('data-testid', 'text') as never as D3SvgElementSelection<
      SVGGElement,
      void
    >;

    this.appendLines();
    this.measure();
    this.appendHoverAreaElement();
    this.drawSelection();
    this.rootElement.selectAll('*').datum(this);
  }

  private appendLines() {
    if (!this.rootElement) {
      return;
    }

    const { x, y } = this.canvasPosition;
    const fontSize = this.fontSize;
    const lineHeight = fontSize * LINE_HEIGHT_RATIO;
    const textElement = this.rootElement
      .append('text')
      .attr('font-size', fontSize)
      .attr('font-family', 'Arial, sans-serif')
      .attr('fill', '#000');

    parseTextLines(this.text.content).forEach((runs, lineIndex) => {
      const line = textElement
        .append('tspan')
        .attr('x', x)
        .attr('y', y + fontSize + lineIndex * lineHeight);

      runs.forEach((run) => {
        line
          .append('tspan')
          .attr('font-weight', run.bold ? 'bold' : 'normal')
          .attr('font-style', run.italic ? 'italic' : 'normal')
          .text(run.text);
      });
    });
  }

  private measure() {
    const node = this.rootElement?.node() as
      SVGGraphicsElement | null | undefined;
    if (typeof node?.getBBox !== 'function') {
      return;
    }
    const box = node.getBBox();
    const macroModeScale = provideEditorSettings().macroModeScale;

    if (box && box.width > 0) {
      this.text.setSize(
        new Vec2(box.width / macroModeScale, box.height / macroModeScale),
      );
    }
  }

  public drawSelection() {
    if (!this.rootElement) {
      return;
    }

    if (this.text.selected) {
      this.appendSelection();
    } else {
      this.removeSelection();
    }
  }

  private appendSelection() {
    if (!this.rootElement) {
      return;
    }

    this.selectionElement = this.canvas
      .insert('rect', ':first-child')
      .attr('fill', SELECTION_COLOR)
      .attr('stroke', SELECTION_COLOR)
      .attr('class', 'dynamic-element') as never as D3SvgElementSelection<
      SVGRectElement,
      void
    >;

    this.setContourAttributes(this.selectionElement);
  }

  private removeSelection() {
    this.selectionElement?.remove();
    this.selectionElement = undefined;
  }

  protected appendHover(): void {
    if (!this.rootElement) {
      return;
    }

    this.hoverElement = this.rootElement
      .insert('rect', ':first-child')
      .attr('fill', 'none')
      .attr('stroke', HOVER_COLOR)
      .attr('stroke-width', 1.2)
      .attr('class', 'dynamic-element') as never as D3SvgElementSelection<
      SVGRectElement,
      void
    >;

    this.setContourAttributes(this.hoverElement);
    this.hoverElement.datum(this);
  }

  protected removeHover(): void {
    this.hoverElement?.remove();
    this.hoverElement = undefined;
  }

  protected appendHoverAreaElement(): void {
    if (!this.rootElement) {
      return;
    }

    this.hoverAreaElement = this.rootElement
      .append('rect')
      .attr('fill', 'none')
      .attr('stroke', SELECTION_OUTLINE_COLOR)
      .attr('stroke-opacity', 0)
      .attr('pointer-events', 'all')
      .attr('class', 'dynamic-element') as never as D3SvgElementSelection<
      SVGRectElement,
      void
    >;

    this.setContourAttributes(this.hoverAreaElement);

    this.hoverAreaElement
      ?.on('mouseover', () => {
        this.appendHover();
      })
      .on('mouseout', () => {
        this.removeHover();
      });
  }

  public moveSelection() {}

  public remove() {
    super.remove();
    this.removeHover();
    this.removeSelection();
  }
}
