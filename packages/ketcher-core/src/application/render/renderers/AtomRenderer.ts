import { BaseRenderer } from 'application/render/renderers/BaseRenderer';
import { Atom } from 'domain/entities/CoreAtom';
import { Coordinates } from 'application/editor/shared/coordinates';
import { CoreEditor, ZoomTool } from 'application/editor';
import { AtomLabel, ElementColor, Elements } from 'domain/constants';
import { D3SvgElementSelection } from 'application/render/types';
import { VALENCE_MAP } from 'application/render/restruct/constants';

export class AtomRenderer extends BaseRenderer {
  private selectionElement?: D3SvgElementSelection<SVGEllipseElement, void>;
  private textElement?: D3SvgElementSelection<SVGTextElement, void>;
  private radicalElement?: D3SvgElementSelection<SVGGElement, void>;

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
    if (
      (this.labelLength < 2 || !this.isLabelVisible) &&
      !this.atom.hasCharge
    ) {
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

  public get labelText() {
    return this.atom.properties.alias || this.atom.label;
  }

  private get isAtomTerminal() {
    const editor = CoreEditor.provideEditorInstance();
    const viewModel = editor.viewModel;
    const atomNeighborsHalfEdges = viewModel.atomsToHalfEdges.get(this.atom);

    return (
      !atomNeighborsHalfEdges?.length || atomNeighborsHalfEdges.length === 1
    );
  }

  public get isLabelVisible() {
    const editor = CoreEditor.provideEditorInstance();
    const viewModel = editor.viewModel;
    const atomNeighborsHalfEdges = viewModel.atomsToHalfEdges.get(this.atom);
    const isCarbon = this.atom.label === AtomLabel.C;
    const visibleTerminal = true;
    const isAtomTerminal = this.isAtomTerminal;
    const isAtomInMiddleOfChain = (atomNeighborsHalfEdges?.length || 0) >= 2;
    const hasCharge = this.atom.hasCharge;
    const hasRadical = this.atom.hasRadical;
    const hasAlias = this.atom.properties.alias;
    const hasExplicitValence = this.atom.hasExplicitValence;
    const hasExplicitIsotope = this.atom.hasExplicitIsotope;

    if (
      isCarbon &&
      !isAtomTerminal &&
      !hasCharge &&
      !hasRadical &&
      !hasAlias &&
      !hasExplicitValence &&
      !hasExplicitIsotope
    ) {
      return false;
    }

    if ((isAtomTerminal && visibleTerminal) || isAtomInMiddleOfChain) {
      return true;
    }

    return false;
  }

  public get labelLength() {
    let { hydrogenAmount } = this.atom.calculateValence();

    if (this.labelText.length > 1) {
      return this.labelText.length;
    }

    if (!this.shouldDisplayHydrogen) {
      hydrogenAmount = 0;
    }

    if (hydrogenAmount === 0) {
      return 1;
    }

    return hydrogenAmount === 1 ? 2 : 3;
  }

  private get labelColor() {
    return this.atom.properties.alias ? 'black' : ElementColor[this.atom.label];
  }

  public get labelBBoxes() {
    // TODO calculate label bboxes after creation of text element
    //  and store them in atom renderer to optimize performance
    if (!this.textElement) {
      return [];
    }

    const labelBboxes: DOMRect[] = [];
    const radicalElementBbox = this.radicalElement?.node()?.getBBox();

    this.textElement
      .selectAll<SVGTSpanElement, this>('tspan')
      .each(function (_atomRenderer, tspanIndex, tspans) {
        labelBboxes.push(tspans[tspanIndex].getBBox());
      });

    if (radicalElementBbox) {
      labelBboxes.push(radicalElementBbox);
    }

    return labelBboxes;
  }

  public get shouldDisplayHydrogen() {
    // Remove when rules for displaying hydrogen are implemented same as in molecules mode
    return this.atom.label !== AtomLabel.C || this.isAtomTerminal;
  }

  private appendLabel() {
    if (!this.isLabelVisible) {
      return;
    }

    let { hydrogenAmount } = this.atom.calculateValence();
    const shouldHydrogenBeOnLeft = this.shouldHydrogenBeOnLeft;

    if (!this.shouldDisplayHydrogen) {
      hydrogenAmount = 0;
    }

    const textElement = this.rootElement
      ?.append('text')
      .attr('y', 5)
      .attr('fill', this.labelColor)
      .attr(
        'style',
        'user-select: none; font-family: Arial; letter-spacing: 1.2px;',
      )
      .attr('font-size', '13px')
      .attr('pointer-events', 'none');

    if (!shouldHydrogenBeOnLeft) {
      textElement
        ?.append('tspan')
        .attr('dy', this.atom.hasExplicitIsotope ? 4 : 0)
        .text(this.atom.properties.alias || this.atom.label);
    }

    if (hydrogenAmount > 0) {
      textElement
        ?.append('tspan')
        .attr('dy', this.atom.hasExplicitIsotope ? 4 : 0)
        .text('H');
    }

    if (hydrogenAmount > 1) {
      textElement?.append('tspan').text(hydrogenAmount).attr('dy', 3);
    }

    if (shouldHydrogenBeOnLeft) {
      textElement
        ?.append('tspan')
        .text(this.atom.properties.alias || this.atom.label)
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

  private appendCharge() {
    if (this.atom.hasCharge) {
      const charge = this.atom.properties.charge as number;

      this.textElement
        ?.append('tspan')
        .text(
          (Math.abs(charge) > 1 ? Math.abs(charge) : '') +
            (charge > 0 ? '+' : '-'),
        )
        .attr('fill', this.labelColor)
        .attr('dy', -4);
    }
  }

  private appendRadical() {
    if (!this.atom.hasRadical) {
      return;
    }

    const radical = this.atom.properties.radical;

    this.radicalElement = this.rootElement?.append('g');

    switch (radical) {
      case 1:
        this.radicalElement
          ?.append('circle')
          .attr('cx', 3)
          .attr('cy', -10)
          .attr('r', 2)
          .attr('fill', this.labelColor);
        this.radicalElement
          ?.append('circle')
          .attr('cx', -3)
          .attr('cy', -10)
          .attr('r', 2)
          .attr('fill', this.labelColor);
        break;
      case 2:
        this.radicalElement
          ?.append('circle')
          .attr('cx', 0)
          .attr('cy', -10)
          .attr('r', 2)
          .attr('fill', this.labelColor);
        break;
      case 3:
        this.radicalElement
          ?.append('path')
          .attr('d', `M 0 -5 L 2 -10 L 4 -5 M -6 -5 L -4 -10 L -2 -5`)
          .attr('fill', 'none')
          .attr('stroke', this.labelColor)
          .attr('stroke-width', 1.4);
        break;
    }
  }

  private appendExplicitValence() {
    if (this.atom.hasExplicitValence) {
      const explicitValence = this.atom.properties.explicitValence as number;

      this.textElement
        ?.append('tspan')
        .text(`(${VALENCE_MAP[explicitValence]})`)
        .attr('fill', this.labelColor)
        .attr('letter-spacing', 0.2)
        .attr('dy', -4);
    }
  }

  private appendExplicitIsotope() {
    if (this.atom.hasExplicitIsotope) {
      const explicitIsotope = this.atom.properties.isotope as number;

      this.textElement
        ?.insert('tspan', ':first-child')
        .text(explicitIsotope)
        .attr('fill', this.labelColor)
        .attr('letter-spacing', 0.2)
        .attr('dy', -4);
    }
  }

  private appendAtomProperties() {
    this.appendExplicitIsotope();
    this.appendCharge();
    this.appendRadical();
    this.appendExplicitValence();
  }

  show() {
    this.rootElement = this.appendRootElement();
    this.bodyElement = this.appendBody();
    this.textElement = this.appendLabel();
    this.appendAtomProperties();
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
