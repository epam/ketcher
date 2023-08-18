import { Selection } from 'd3';
import { Sugar } from 'domain/entities/Sugar';
import { BaseMonomerRenderer } from 'application/render/renderers/BaseMonomerRenderer';

const SUGAR_SELECTED_ELEMENT_ID = '#sugar-selection';

export class SugarRenderer extends BaseMonomerRenderer {
  constructor(public monomer: Sugar, scale?: number) {
    super(monomer, SUGAR_SELECTED_ELEMENT_ID, scale);
  }

  protected appendBody(
    rootElement: Selection<SVGGElement, this, HTMLElement, never>,
    theme,
  ) {
    return rootElement
      .append('use')
      .data([this])
      .attr('href', '#sugar')
      .style('cursor', 'pointer')
      .attr(
        'fill',
        theme.monomer.color[
          this.monomer.monomerItem.props.MonomerNaturalAnalogCode
        ].regular,
      );
  }
}
