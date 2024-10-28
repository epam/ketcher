import { BaseRenderer } from 'application/render/renderers/BaseRenderer';
import { Atom } from 'domain/entities/CoreAtom';
import { Coordinates } from 'application/editor/shared/coordinates';
import { CoreEditor } from 'application/editor';
import { AtomLabel, ElementColor, Elements } from 'domain/constants';
import { D3SvgElementSelection } from 'application/render/types';

export class AtomRenderer extends BaseRenderer {
  private selectionElement?: D3SvgElementSelection<SVGCircleElement, void>;

  constructor(public atom: Atom) {
    super(atom);
    atom.setRenderer(this);
  }

  get scaledPosition() {
    return Coordinates.modelToCanvas(this.atom.position);
  }

  get center() {
    return this.scaledPosition;
  }

  private appendRootElement() {
    const editor = CoreEditor.provideEditorInstance();

    const rootElement = this.canvas
      .append('g')
      .data([this])
      .attr('pointer-events', 'all')
      .attr(
        'transform',
        `translate(${this.scaledPosition.x}, ${this.scaledPosition.y})`,
      ) as never as D3SvgElementSelection<SVGGElement, void>;

    rootElement
      ?.on('mouseover', () => {
        this.showHover();
      })
      .on('mouseleave', () => {
        this.hideHover();
      })
      .on('mouseup', (event) => {
        editor.events.mouseUpAtom.dispatch(event);
      });

    return rootElement;
  }

  private appendBody() {
    return this.rootElement
      ?.append('circle')
      .data([this])
      .attr('r', 0)
      .attr('cx', 0)
      .attr('cy', 0);
  }

  protected appendHover() {
    return this.rootElement
      ?.append('circle')
      .attr('r', 10)
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('stroke', '#0097a8')
      .attr('stroke-width', '1.2')
      .attr('fill', 'none')
      .attr('opacity', '0');
  }

  public showHover() {
    this.hoverElement?.attr('opacity', '1');
  }

  public hideHover() {
    this.hoverElement?.attr('opacity', '0');
  }

  private get shouldHydrogenBeOnLeft() {
    const viewModel = CoreEditor.provideEditorInstance().viewModel;
    const atomHaldEdges = viewModel.atomsToHalfEdges.get(this.atom);

    if (atomHaldEdges?.length === 0) {
      if (this.atom.label === AtomLabel.D || this.atom.label === AtomLabel.T) {
        return false;
      } else {
        const element = Elements.get(this.atom.label);

        return !element || Boolean(element.leftH);
      }
    }

    if (atomHaldEdges?.length === 1) {
      const firstHalfEdge = atomHaldEdges[0];

      return firstHalfEdge.direction.x > 0;
    }

    return false;
  }

  public get isLabelVisible() {
    const editor = CoreEditor.provideEditorInstance();
    const viewModel = editor.viewModel;
    const atomNeighborsHalfEdges = viewModel.atomsToHalfEdges.get(this.atom);
    const isCarbon = this.atom.label === AtomLabel.C;
    const visibleTerminal = true;
    const isAtomTerminal =
      !atomNeighborsHalfEdges?.length || atomNeighborsHalfEdges.length === 1;
    const isAtomInMiddleOfChain = (atomNeighborsHalfEdges?.length || 0) >= 2;

    if (isCarbon && !isAtomTerminal) {
      return false;
    }

    if ((isAtomTerminal && visibleTerminal) || isAtomInMiddleOfChain)
      return true;

    return false;
  }

  private appendLabel() {
    if (!this.isLabelVisible) {
      return;
    }

    const { hydrogenAmount } = this.atom.calculateValence();
    const shouldHydrogenBeOnLeft = this.shouldHydrogenBeOnLeft;

    const textElement = this.rootElement
      ?.append('text')
      .attr('y', 5)
      .attr('fill', ElementColor[this.atom.label])
      .attr(
        'style',
        'user-select: none; font-family: Arial; letter-spacing: 1.2px;',
      )
      .attr('font-size', '13px')
      .attr('pointer-events', 'none');

    if (!shouldHydrogenBeOnLeft) {
      textElement?.append('tspan').text(this.atom.label);
    }

    if (hydrogenAmount > 0) {
      textElement?.append('tspan').text('H');
    }

    if (hydrogenAmount > 1) {
      textElement?.append('tspan').text(hydrogenAmount).attr('dy', 5);
    }

    if (shouldHydrogenBeOnLeft) {
      textElement
        ?.append('tspan')
        .text(this.atom.label)
        .attr('dy', hydrogenAmount > 1 ? -5 : 0);
    }

    textElement?.attr(
      'text-anchor',
      shouldHydrogenBeOnLeft ? 'end' : hydrogenAmount > 0 ? 'start' : 'middle',
    );

    return textElement;
  }

  public appendSelection() {
    if (this.selectionElement) {
      this.selectionElement.attr('cx', this.center.x).attr('cy', this.center.y);
    } else {
      this.selectionElement = this.canvas
        ?.insert('circle', ':first-child')
        .attr('r', '13px')
        .attr('cx', this.center.x)
        .attr('cy', this.center.y)
        .attr('fill', '#57FF8F')
        .attr('class', 'dynamic-element');
    }
  }

  public removeSelection() {
    this.selectionElement?.remove();
    this.selectionElement = undefined;
  }

  public drawSelection() {
    if (!this.rootElement) {
      return;
    }
    if (this.atom.selected) {
      this.appendSelection();
    } else {
      this.removeSelection();
    }
  }

  public moveSelection() {
    if (!this.rootElement) {
      return;
    }

    this.drawSelection();
    this.move();
  }

  show() {
    this.rootElement = this.appendRootElement();
    this.bodyElement = this.appendBody();
    this.hoverElement = this.appendHover();
    this.appendLabel();
    this.drawSelection();
  }

  public move() {
    this.rootElement?.attr(
      'transform',
      `translate(${this.scaledPosition.x}, ${this.scaledPosition.y})`,
    );
  }

  public remove() {
    this.removeSelection();
    super.remove();
  }

  protected appendHoverAreaElement(): void {}

  protected removeHover(): void {}
}
