import { RNABase } from 'domain/entities/RNABase';
import { Phosphate } from 'domain/entities/Phosphate';
import { Sugar } from 'domain/entities/Sugar';
import assert from 'assert';
import {
  getPhosphateFromSugar,
  getRnaBaseFromSugar,
  isValidNucleoside,
  isValidNucleotide,
} from 'domain/helpers/monomers';
import { SubChainNode } from 'domain/entities/monomer-chains/types';
import { CoreEditor } from 'application/editor/internal';
import { Vec2 } from 'domain/entities/vec2';
import {
  getRnaPartLibraryItem,
  getSugarBySequenceType,
} from 'domain/helpers/rna';
import { RNA_DNA_NON_MODIFIED_PART } from 'domain/constants/monomers';
import { BaseMonomer } from 'domain/entities/BaseMonomer';

export class Nucleotide {
  constructor(
    public sugar: Sugar,
    public rnaBase: RNABase,
    public phosphate: Phosphate,
  ) {}

  static fromSugar(sugar: Sugar, needValidation = true) {
    if (needValidation) {
      assert(
        isValidNucleotide(sugar),
        'Nucleotide is not valid. Please check nucleotide parts connections.',
      );

      const isNucleoside = isValidNucleoside(sugar);
      assert(
        !isNucleoside,
        'Nucleotide is nucleoside because it is a last sugar+base of rna chain',
      );
    }

    return new Nucleotide(
      sugar,
      getRnaBaseFromSugar(sugar) as RNABase,
      getPhosphateFromSugar(sugar) as Phosphate,
    );
  }

  static createOnCanvas(rnaBaseName: string, position: Vec2) {
    const editor = CoreEditor.provideEditorInstance();
    const rnaBaseLibraryItem = getRnaPartLibraryItem(editor, rnaBaseName);
    const phosphateLibraryItem = getRnaPartLibraryItem(
      editor,
      RNA_DNA_NON_MODIFIED_PART.PHOSPHATE,
    );
    const sugarName = getSugarBySequenceType(editor.sequenceTypeEnterMode);
    assert(sugarName);

    const sugarLibraryItem = getRnaPartLibraryItem(editor, sugarName);

    assert(sugarLibraryItem);
    assert(rnaBaseLibraryItem);
    assert(phosphateLibraryItem);

    const { command: modelChanges, monomers } =
      editor.drawingEntitiesManager.addRnaPreset({
        sugar: sugarLibraryItem,
        sugarPosition: position,
        rnaBase: rnaBaseLibraryItem,
        rnaBasePosition: position,
        phosphate: phosphateLibraryItem,
        phosphatePosition: position,
      });

    const sugar = monomers.find((monomer) => monomer instanceof Sugar) as Sugar;

    return { modelChanges, node: Nucleotide.fromSugar(sugar, false) };
  }

  public isMonomerTypeDifferentForChaining(monomerToChain: SubChainNode) {
    return this.sugar.isMonomerTypeDifferentForChaining(monomerToChain);
  }

  public get SubChainConstructor() {
    return this.sugar.SubChainConstructor;
  }

  public get monomer() {
    return this.sugar;
  }

  public get monomers(): BaseMonomer[] {
    return [this.sugar, this.rnaBase, this.phosphate];
  }

  public get firstMonomerInNode() {
    return this.sugar;
  }

  public get lastMonomerInNode() {
    return this.phosphate;
  }

  public get renderer() {
    return this.monomer.renderer;
  }

  public get modified() {
    return (
      this.rnaBase.isModification ||
      this.sugar.isModification ||
      this.phosphate.isModification
    );
  }
}
