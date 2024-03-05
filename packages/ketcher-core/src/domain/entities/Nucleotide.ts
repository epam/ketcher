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
import { CoreEditor, EditorHistory } from 'application/editor';
import { MonomerItemType } from 'domain/types';
import { Vec2 } from 'domain/entities/vec2';

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

  static createOnCanvas(sugarName: string, position: Vec2) {
    const editor = CoreEditor.provideEditorInstance();
    const history = new EditorHistory(editor);
    const rnaBaseLibraryItem = editor.monomersLibrary.RNA.find(
      (libraryItem) => libraryItem.props.MonomerName === sugarName,
    );
    const sugarLibraryItem = editor.monomersLibrary.RNA.find(
      (libraryItem) => libraryItem.props.MonomerName === 'R',
    );
    const phosphateLibraryItem = editor.monomersLibrary.RNA.find(
      (libraryItem) => libraryItem.props.MonomerName === 'P',
    ) as MonomerItemType;

    const { command: modelChanges, monomers } =
      editor.drawingEntitiesManager.addRnaPreset({
        sugar: sugarLibraryItem,
        sugarPosition: position,
        rnaBase: rnaBaseLibraryItem,
        rnaBasePosition: position,
        phosphate: phosphateLibraryItem,
        phosphatePosition: position,
      });

    const sugar = monomers.find((monomer) => monomer instanceof Sugar);

    editor.renderersContainer.update(modelChanges);
    history.update(modelChanges);

    return Nucleotide.fromSugar(sugar, false);
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

  public get monomers() {
    return [this.sugar, this.rnaBase, this.phosphate];
  }

  public get firstMonomerInNode() {
    return this.sugar;
  }

  public get lastMonomerInNode() {
    return this.phosphate;
  }
}
