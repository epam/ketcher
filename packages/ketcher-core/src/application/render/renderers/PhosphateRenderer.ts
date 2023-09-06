import { Selection } from 'd3';
import { Phosphate } from 'domain/entities/Phosphate';
import { BaseMonomerRenderer } from 'application/render/renderers/BaseMonomerRenderer';

const PHOSPHATE_SELECTED_ELEMENT_ID = '#phosphate-selection';

export class PhosphateRenderer extends BaseMonomerRenderer {
  constructor(public monomer: Phosphate, scale?: number) {
    super(monomer, PHOSPHATE_SELECTED_ELEMENT_ID, scale);
  }

  protected appendBody(
    rootElement: Selection<SVGGElement, this, HTMLElement, never>,
    theme,
  ) {
    return rootElement
      .append('use')
      .data([this])
      .attr('href', '#phosphate')
      .style('cursor', 'pointer')
      .attr(
        'fill',
        theme.monomer.color[
          this.monomer.monomerItem.props.MonomerNaturalAnalogCode
        ].regular,
      );
  }
}
