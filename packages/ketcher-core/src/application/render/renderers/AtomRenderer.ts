import { BaseRenderer } from 'application/render';
import { select } from 'd3';
import { Atom } from 'domain/entities/CoreAtom';
import { Coordinates } from 'application/editor/shared/coordinates';
import { CoreEditor } from 'application/editor';

export class AtomRenderer extends BaseRenderer {
  constructor(public atom: Atom) {
    super(atom);
  }

  get scaledPosition() {
    return Coordinates.modelToView(this.atom.position);
  }

  private appendRootElement() {
    return this.canvasWrapper
      .append('g')
      .data([this])
      .attr(
        'transform',
        `translate(${this.scaledPosition.x}, ${this.scaledPosition.y})`,
      );
  }

  private appendBody() {
    return this.canvas
      .append('circle')
      .attr('r', 1)
      .attr('cx', 0)
      .attr('cy', 0);
  }

  private appendHoverArea() {
    const editor = CoreEditor.provideEditorInstance();

    return this.rootElement
      .append('circle')
      .data([this])
      .attr('r', 10)
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('stroke', '#0097a8')
      .attr('stroke-width', '1.2')
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .attr('opacity', '0')
      .on('mouseenter', () => {
        this.showHover();
      })
      .on('mouseleave', () => {
        this.hideHover();
      })
      .on('mouseup', (event) => {
        editor.events.mouseUpAtom.dispatch(event);
      });
  }

  public showHover() {
    this.hoverElement.attr('opacity', '1');
  }

  public hideHover() {
    this.hoverElement.attr('opacity', '0');
  }

  show() {
    this.rootElement = this.appendRootElement();
    this.bodyElement = this.appendBody();
    this.hoverElement = this.appendHoverArea();
  }
}
