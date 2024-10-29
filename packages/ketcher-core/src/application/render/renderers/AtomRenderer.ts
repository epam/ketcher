import { BaseRenderer } from 'application/render/renderers/BaseRenderer';
import { Atom } from 'domain/entities/CoreAtom';
import { Coordinates } from 'application/editor/shared/coordinates';
import { CoreEditor, ZoomTool } from 'application/editor';
import { AtomLabel, ElementColor, Elements } from 'domain/constants';
import { D3SvgElementSelection } from 'application/render/types';

export class AtomRenderer extends BaseRenderer {
  private selectionElement?: D3SvgElementSelection<SVGEllipseElement, void>;
  private textElement?: D3SvgElementSelection<SVGTextElement, void>;

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
      .insert('g', ':first-child')
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

  private appendSelectionContour() {
    if (this.labelLength < 2 || !this.isLabelVisible) {
      return this.rootElement
        ?.insert('circle', ':first-child')
        .attr('r', 10)
        .attr('cx', 0)
        .attr('cy', 0);
    } else {
      const labelBbox = this.textElement?.node()?.getBoundingClientRect();
      const labelX = labelBbox?.x || 0;
      const labelWidth = labelBbox?.width || 8;
      const labelHeight = labelBbox?.height || 8;
      const canvasBoundingClientRect = ZoomTool.instance.canvasWrapper
        .node()
        ?.getBoundingClientRect();
      const canvasX = canvasBoundingClientRect?.x || 0;
      const HOVER_PADDING = 4;
      const HOVER_RECTANGLE_RADIUS = 10;

      return this.rootElement
        ?.insert('rect', ':first-child')
        .attr('x', labelX - this.scaledPosition.x - canvasX - HOVER_PADDING)
        .attr('y', -(labelHeight / 2 + HOVER_PADDING))
        .attr('width', labelWidth + HOVER_PADDING * 2)
        .attr('height', labelHeight + HOVER_PADDING * 2)
        .attr('rx', HOVER_RECTANGLE_RADIUS)
        .attr('ry', HOVER_RECTANGLE_RADIUS);
    }
  }

  protected appendHover() {
    const selectionContourElement = this.appendSelectionContour();

    return (
      selectionContourElement
        ?.attr('stroke', '#0097a8')
        // selectionContourElement is union type here. For some reason for union selection types
        // ts shows error that first call of attr can return string.
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .attr('stroke-width', '1.2')
        .attr('fill', 'none')
        .attr('opacity', '0')
    );
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

  public get labelLength() {
    const { hydrogenAmount } = this.atom.calculateValence();

    if (hydrogenAmount === 0) {
      return 1;
    }

    return hydrogenAmount === 1 ? 2 : 3;
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
      textElement?.append('tspan').text(hydrogenAmount).attr('dy', 3);
    }

    if (shouldHydrogenBeOnLeft) {
      textElement
        ?.append('tspan')
        .text(this.atom.label)
        .attr('dy', hydrogenAmount > 1 ? -3 : 0);
    }

    textElement
      ?.attr(
        'text-anchor',
        shouldHydrogenBeOnLeft
          ? 'end'
          : hydrogenAmount > 0
          ? 'start'
          : 'middle',
      )
      .attr('x', shouldHydrogenBeOnLeft ? 5 : hydrogenAmount > 0 ? -5 : 0);

    return textElement;
  }

  public appendSelection() {
    if (!this.selectionElement) {
      const selectionContourElement = this.appendSelectionContour();

      this.selectionElement = selectionContourElement
        ?.attr('fill', '#57FF8F')
        // selectionContourElement is union type here. For some reason for union selection types
        // ts shows error that first call of attr can return string.
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
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
    this.textElement = this.appendLabel();
    this.hoverElement = this.appendHover();
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
