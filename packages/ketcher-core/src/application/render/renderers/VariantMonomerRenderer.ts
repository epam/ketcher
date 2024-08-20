import { Selection } from 'd3';
import { BaseMonomerRenderer } from 'application/render/renderers';
import { VariantMonomer } from 'domain/entities/VariantMonomer';
import { MONOMER_SYMBOLS_IDS } from 'application/render/renderers/constants';

const NUMBER_OF_MONOMERS_CIRCLE_RADIUS = 3;
const NUMBER_OF_MONOMERS_CIRCLE_Y_OFFSET = 7;

export class VariantMonomerRenderer extends BaseMonomerRenderer {
  private monomerSymbolElementsIds: {
    selected: string;
    hover: string;
    body: string;
    variant?: string;
  };

  constructor(public monomer: VariantMonomer, scale?: number) {
    const monomerClass = VariantMonomer.getMonomerClass(monomer.monomers);
    const monomerSymbolElementsIds = MONOMER_SYMBOLS_IDS[monomerClass];

    super(
      monomer,
      monomerSymbolElementsIds.selected,
      monomerSymbolElementsIds.hover,
      monomerSymbolElementsIds.body,
      scale,
    );

    this.monomerSymbolElementsIds = monomerSymbolElementsIds;
  }

  protected appendBody(
    rootElement: Selection<SVGGElement, void, HTMLElement, never>,
  ) {
    return rootElement
      .append('use')
      .data([this])
      .attr(
        'href',
        this.monomerSymbolElementsIds.variant ||
          this.monomerSymbolElementsIds.body,
      )
      .attr('fill', '#fff')
      .attr('stroke', '#585858')
      .attr('stroke-width', '1px')
      .attr('paint-order', 'fill');
  }

  protected get enumerationElementPosition() {
    return undefined;
  }

  protected get beginningElementPosition() {
    return undefined;
  }

  private appendNumberOfMonomers() {
    const numberOfMonomersElement = this.rootElement
      ?.append('g')
      .attr(
        'transform',
        `translate(${this.center.x - this.scaledMonomerPosition.x}, ${
          this.center.y -
          this.scaledMonomerPosition.y +
          NUMBER_OF_MONOMERS_CIRCLE_Y_OFFSET
        })`,
      )
      .attr('pointer-events', 'none');

    numberOfMonomersElement
      ?.append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', NUMBER_OF_MONOMERS_CIRCLE_RADIUS)
      .attr('fill', '#fff')
      .attr('stroke', '#CCEAEE')
      .attr('stroke-width', 0.5);

    numberOfMonomersElement
      ?.append('text')
      .attr('x', -1.6)
      .attr('y', 2.1)
      .attr('font-size', '6px')
      .attr('font-weight', 300)
      .text(this.monomer.monomers.length);
  }

  public show(theme) {
    super.show(theme);
    this.appendNumberOfMonomers();
  }
}
