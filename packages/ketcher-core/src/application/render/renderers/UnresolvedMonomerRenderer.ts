import { BaseMonomerRenderer } from 'application/render/renderers/BaseMonomerRenderer';
import { UnresolvedMonomer } from 'domain/entities';
import { Selection } from 'd3';

const UNRESOLVED_MONOMER_SELECTED_ELEMENT_ID = '#unresolved-monomer-selection';
const UNRESOLVED_MONOMER_HOVERED_ELEMENT_ID = '#unresolved-monomer-hover';
const UNRESOLVED_MONOMER_SYMBOL_ELEMENT_ID = '#unresolved-monomer';

export class UnresolvedMonomerRenderer extends BaseMonomerRenderer {
  constructor(public monomer: UnresolvedMonomer, scale?: number) {
    super(
      monomer,
      UNRESOLVED_MONOMER_SELECTED_ELEMENT_ID,
      UNRESOLVED_MONOMER_HOVERED_ELEMENT_ID,
      UNRESOLVED_MONOMER_SYMBOL_ELEMENT_ID,
      scale,
    );
  }

  public get textColor() {
    return 'white';
  }

  protected appendBody(
    rootElement: Selection<SVGGElement, void, HTMLElement, never>,
  ) {
    return rootElement
      .append('use')
      .data([this])
      .attr('href', UNRESOLVED_MONOMER_SYMBOL_ELEMENT_ID);
  }

  show(theme) {
    super.show(theme);
  }

  public get enumerationElementPosition() {
    return undefined;
  }

  public get beginningElementPosition() {
    return undefined;
  }
}
