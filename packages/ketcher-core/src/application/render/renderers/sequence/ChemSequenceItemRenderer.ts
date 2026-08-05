import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import { isMonomerSgroupWithAttachmentPoints } from '../../../../utilities/monomers';
import { sequenceRendererStore } from 'application/render/renderers/sequence/SequenceRendererStore';
import type { D3SvgElementSelection } from 'application/render/types';

export class ChemSequenceItemRenderer extends BaseSequenceItemRenderer {
  get symbolToDisplay(): string {
    // Antisense terminal phosphates are displayed as "p" (or "pp"/"p p" when
    // paired) instead of the default linker symbol "@". This is a sequence-mode
    // display concern only and does not change the underlying node/monomer
    // structure, so editing and flex mode remain identical to master.
    if (this.isAntisensePhosphateCell) {
      const phosphateSymbol =
        sequenceRendererStore.sequenceViewModel?.getAntisensePhosphateSymbol(
          this.twoStrandedNode,
        );
      if (phosphateSymbol) {
        return phosphateSymbol;
      }
    }

    return '@';
  }

  private get isAntisensePhosphateCell(): boolean {
    return this.twoStrandedNode?.antisenseNode === this.node;
  }

  protected get symbolXOffset(): number {
    if (this.isAntisensePhosphateCell) {
      return (
        sequenceRendererStore.sequenceViewModel?.getAntisensePhosphateSymbolXOffset(
          this.twoStrandedNode,
        ) ?? 0
      );
    }

    return 0;
  }

  protected get symbolLetterSpacing(): number {
    // Space multi-glyph phosphate symbols ("pp") to the 20px column grid so each
    // phosphate lands in its own column. Courier New 20px advances ~12px/glyph.
    if (this.isAntisensePhosphateCell && this.symbolToDisplay.length > 1) {
      return 8;
    }

    return 0;
  }

  protected drawModification() {
    // intentional no-op: this monomer type does not have a modification glyph
  }

  public show() {
    if (
      this.node.monomer.monomerItem.props.isMicromoleculeFragment &&
      !isMonomerSgroupWithAttachmentPoints(this.node.monomer)
    ) {
      return;
    }

    super.show();
  }

  protected appendRootElement() {
    this.rootElement = super.appendRootElement();
    this.rootElement?.attr('data-symbol-type', 'CHEM');

    return this.rootElement as never as D3SvgElementSelection<
      SVGGElement,
      void
    >;
  }
}
