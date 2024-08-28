import { Selection } from 'd3';
import { BaseMonomerRenderer } from 'application/render/renderers';
import { AmbiguousMonomer } from 'domain/entities/AmbiguousMonomer';
import { MONOMER_SYMBOLS_IDS } from 'application/render/renderers/constants';

const NUMBER_OF_MONOMERS_CIRCLE_Y_OFFSET = 7;

export class AmbiguousMonomerRenderer extends BaseMonomerRenderer {
  private monomerSymbolElementsIds: {
    selected: string;
    hover: string;
    body: string;
    variant?: string;
  };

  constructor(public monomer: AmbiguousMonomer, scale?: number) {
    const monomerClass = AmbiguousMonomer.getMonomerClass(monomer.monomers);
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
    const isMonomersAmountTenOrMore = this.monomer.monomers.length >= 10;
    const numberOfMonomersElement = this.rootElement
      ?.append('g')
      .attr(
        'transform',
        `translate(${
          this.center.x -
          this.scaledMonomerPosition.x -
          (isMonomersAmountTenOrMore ? 2 : 0)
        }, ${
          this.center.y -
          this.scaledMonomerPosition.y +
          NUMBER_OF_MONOMERS_CIRCLE_Y_OFFSET
        })`,
      )
      .attr('pointer-events', 'none');

    numberOfMonomersElement
      ?.append('foreignObject')
      .attr('width', '20px')
      .attr('height', '20px')
      .attr('x', isMonomersAmountTenOrMore ? '-3' : '-4')
      .attr('y', '-4')
      .append('xhtml:div')
      .attr(
        'style',
        `
        width: ${isMonomersAmountTenOrMore ? '10px' : '8px'};
        height: 8px;
        border-radius: ${isMonomersAmountTenOrMore ? '20px' : '50%'};
        border: 0.5px solid #cceaee;
      `,
      );

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
