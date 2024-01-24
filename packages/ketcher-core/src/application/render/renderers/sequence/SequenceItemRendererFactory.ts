import { ConcreteMonomer } from 'domain/types';
import {
  Chem,
  Peptide,
  Phosphate,
  RNABase,
  Sugar,
  Vec2,
} from 'domain/entities';
import { PeptideSequenceItemRenderer } from 'application/render/renderers/sequence/PeptideSequenceItemRenderer';
import { ChemSequenceItemRenderer } from 'application/render/renderers/sequence/ChemSequenceItemRenderer';
import { RnaBaseSequenceItemRenderer } from 'application/render/renderers/sequence/RnaBaseSequenceItemRenderer';
import { PhosphateSequenceItemRenderer } from 'application/render/renderers/sequence/PhosphateSequenceItemRenderer';
import { SugarSequenceItemRenderer } from 'application/render/renderers/sequence/SugarSequenceItemRenderer';

export class SequenceItemRendererFactory {
  static fromMonomer(
    monomer: ConcreteMonomer,
    firstMonomerInChainPosition: Vec2,
    monomerIndexInChain: number,
    monomerNumberInSubChain: number,
  ) {
    let RendererClass;

    switch (monomer.constructor) {
      case Peptide:
        RendererClass = PeptideSequenceItemRenderer;
        break;
      case Chem:
        RendererClass = ChemSequenceItemRenderer;
        break;
      case RNABase:
        RendererClass = RnaBaseSequenceItemRenderer;
        break;
      case Phosphate:
        RendererClass = PhosphateSequenceItemRenderer;
        break;
      case Sugar:
        RendererClass = SugarSequenceItemRenderer;
        break;
      default:
        return null;
    }

    return new RendererClass(
      monomer,
      firstMonomerInChainPosition,
      monomerIndexInChain,
      monomerNumberInSubChain,
    );
  }
}
