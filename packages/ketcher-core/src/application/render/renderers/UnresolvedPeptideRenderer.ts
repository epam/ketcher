/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import { BaseMonomerRenderer } from 'application/render/renderers/BaseMonomerRenderer';
import { UnresolvedMonomer } from 'domain/entities';
import { Selection } from 'd3';

const UNRESOLVED_PEPTIDE_HOVERED_ELEMENT_ID = '#unresolved-peptide-hover';
const UNRESOLVED_PEPTIDE_SYMBOL_ELEMENT_ID = '#unresolved-peptide';
const UNRESOLVED_PEPTIDE_AUTOCHAIN_PREVIEW_ELEMENT_ID =
  '#unresolved-peptide-autochain-preview';

export class UnresolvedPeptideRenderer extends BaseMonomerRenderer {
  public CHAIN_START_TERMINAL_INDICATOR_TEXT = 'N';
  public CHAIN_END_TERMINAL_INDICATOR_TEXT = 'C';

  constructor(public monomer: UnresolvedMonomer, scale?: number) {
    super(
      monomer,
      UNRESOLVED_PEPTIDE_HOVERED_ELEMENT_ID,
      UNRESOLVED_PEPTIDE_SYMBOL_ELEMENT_ID,
      UNRESOLVED_PEPTIDE_AUTOCHAIN_PREVIEW_ELEMENT_ID,
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
      .attr('href', UNRESOLVED_PEPTIDE_SYMBOL_ELEMENT_ID);
  }

  show(theme) {
    super.show(theme);
    this.appendEnumeration();
  }

  public get enumerationElementPosition() {
    return { x: 10, y: -1 };
  }

  public get beginningElementPosition() {
    return { x: -6, y: 10 };
  }

  protected get modificationConfig() {
    return undefined;
  }
}
