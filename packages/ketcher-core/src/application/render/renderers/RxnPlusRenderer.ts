import { BaseRenderer } from 'application/render/renderers/BaseRenderer';
import { D3SvgElementSelection } from 'application/render/types';
import { Coordinates, provideEditorSettings } from 'application/editor';
import { RxnPlus } from 'domain/entities/CoreRxnPlus';
import { Vec2 } from 'domain/entities';

export class RxnPlusRenderer extends BaseRenderer {
  private selectionElement:
    | D3SvgElementSelection<SVGRectElement, void>
    | undefined;

  constructor(public rxnPlus: RxnPlus) {
    super(rxnPlus);
    this.rxnPlus.setRenderer(this);
  }

  private get scaledPosition() {
    return Coordinates.modelToCanvas(this.rxnPlus.position);
  }

  private get halfOfLineLength() {
    const macroModeScale = provideEditorSettings().macroModeScale;

    return macroModeScale / 5;
  }

  private setSelectionContourAttributes(
    selectionContourElement: D3SvgElementSelection<SVGRectElement, void>,
    position = new Vec2(0, 0),
  ) {
    const macroModeScale = provideEditorSettings().macroModeScale;

    return selectionContourElement
      .attr('x', position.x - macroModeScale / 4)
      .attr('y', position.y - macroModeScale / 4)
      .attr('width', macroModeScale / 2)
      .attr('height', macroModeScale / 2)
      .attr('rx', macroModeScale / 8);
  }

  public show() {
    this.rootElement = this.canvas
      .insert('g', `.monomer`)
      .data([this])
      .attr('data-testid', 'rxn-arrow')
      .attr(
        'transform',
        `translate(${this.scaledPosition.x}, ${this.scaledPosition.y})`,
      ) as never as D3SvgElementSelection<SVGGElement, void>;

    const halfOfLineLength = this.halfOfLineLength;
    const pathDAttr = `M0,${-halfOfLineLength}L0,${halfOfLineLength}M${-halfOfLineLength},0L${halfOfLineLength},0`;

    this.rootElement
      .append('path')
      .attr('d', pathDAttr)
      .attr('fill', 'none')
      .attr('stroke', '#000')
      .attr('stroke-width', 2);

    this.appendHoverAreaElement();
    this.drawSelection();
  }

  protected appendHover(): D3SvgElementSelection<SVGUseElement, void> | void {
    if (!this.rootElement) {
      return;
    }

    this.hoverElement = this.rootElement
      .insert('rect', ':first-child')
      .attr('fill', 'none')
      .attr('stroke', '#0097A8')
      .attr('stroke-width', 1.2)
      .attr('class', 'dynamic-element');

    this.setSelectionContourAttributes(this.hoverElement);
  }

  protected appendHoverAreaElement(): void {
    if (!this.rootElement) {
      return;
    }

    this.hoverAreaElement = this.rootElement
      .append('rect')
      .attr('fill', 'none')
      .attr('stroke', 'none')
      .attr('pointer-events', 'all')
      .attr('class', 'dynamic-element');

    this.setSelectionContourAttributes(this.hoverAreaElement);

    this.hoverAreaElement
      ?.on('mouseover', () => {
        this.appendHover();
      })
      .on('mouseout', () => {
        this.removeHover();
      });
  }

  public drawSelection() {
    if (!this.rootElement) {
      return;
    }
    if (this.rxnPlus.selected) {
      this.appendSelection();
    } else {
      this.removeSelection();
    }
  }

  public appendSelection(): void {
    if (!this.rootElement) {
      return;
    }

    this.selectionElement = this.canvas
      ?.insert('rect', ':first-child')
      .attr('fill', '#57ff8f')
      .attr('stroke', '#57ff8f')
      .attr('class', 'dynamic-element');

    this.setSelectionContourAttributes(
      this.selectionElement,
      this.scaledPosition,
    );
  }

  public removeSelection() {
    this.selectionElement?.remove();
    this.selectionElement = undefined;
  }

  public move() {
    if (!this.rootElement) {
      return;
    }

    this.remove();
    this.show();
  }

  protected removeHover(): void {
    this.hoverElement?.remove();
    this.hoverElement = undefined;
  }

  public remove() {
    super.remove();
    this.removeHover();
    this.removeSelection();
  }

  public moveSelection(): void {}
}
