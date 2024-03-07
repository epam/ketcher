import { RNABase } from 'domain/entities/RNABase';
import { Sugar } from 'domain/entities/Sugar';
import assert from 'assert';
import {
  getRnaBaseFromSugar,
  isValidNucleoside,
  isValidNucleotide,
} from 'domain/helpers/monomers';
import { SubChainNode } from 'domain/entities/monomer-chains/types';
import { Vec2 } from 'domain/entities/vec2';
import { CoreEditor, EditorHistory } from 'application/editor/internal';
import { AttachmentPointName } from 'domain/types';
import { Command } from 'domain/entities/Command';
import { getRnaPartLibraryItem } from 'domain/helpers/rna';
import { RNA_NON_MODIFIED_PART } from 'domain/constants/monomers';

export class Nucleoside {
  constructor(public sugar: Sugar, public rnaBase: RNABase) {}

  static fromSugar(sugar: Sugar, needValidation = true) {
    if (needValidation) {
      assert(
        isValidNucleoside(sugar),
        'Created nucleoside is not valid. Please check nucleotide parts connections.',
      );

      const isNucleotide = isValidNucleotide(sugar);
      assert(!isNucleotide, 'Created nucleoside is nucleotide.');
    }

    return new Nucleoside(sugar, getRnaBaseFromSugar(sugar) as RNABase);
  }

  static createOnCanvas(rnaBaseName: string, position: Vec2) {
    const editor = CoreEditor.provideEditorInstance();
    const history = new EditorHistory(editor);
    const rnaBaseLibraryItem = getRnaPartLibraryItem(editor, rnaBaseName);
    const sugarLibraryItem = getRnaPartLibraryItem(
      editor,
      RNA_NON_MODIFIED_PART.SUGAR,
    );

    assert(sugarLibraryItem);
    assert(rnaBaseLibraryItem);

    const modelChanges = new Command();

    modelChanges.merge(
      editor.drawingEntitiesManager.addMonomer(sugarLibraryItem, position),
    );
    modelChanges.merge(
      editor.drawingEntitiesManager.addMonomer(rnaBaseLibraryItem, position),
    );

    const sugar = modelChanges.operations[0].monomer as Sugar;
    const rnaBase = modelChanges.operations[1].monomer as RNABase;

    modelChanges.merge(
      editor.drawingEntitiesManager.createPolymerBond(
        sugar,
        rnaBase,
        AttachmentPointName.R3,
        AttachmentPointName.R1,
      ),
    );

    editor.renderersContainer.update(modelChanges);
    history.update(modelChanges);

    return Nucleoside.fromSugar(sugar, false);
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
    return [this.sugar, this.rnaBase];
  }

  public get firstMonomerInNode() {
    return this.sugar;
  }

  public get lastMonomerInNode() {
    return this.sugar;
  }

  public get renderer() {
    return this.monomer.renderer;
  }
}
