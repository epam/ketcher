import { RNABase } from 'domain/entities/RNABase';
import { Sugar } from 'domain/entities/Sugar';
import assert from 'assert';
import {
  getNextMonomerInChain,
  getRnaBaseFromSugar,
  isValidNucleoside,
  isValidNucleotide,
} from 'domain/helpers/monomers';
import { SubChainNode } from 'domain/entities/monomer-chains/types';
import { Vec2 } from 'domain/entities/vec2';
import { Coordinates, CoreEditor } from 'application/editor/internal';
import { AttachmentPointName } from 'domain/types';
import { Command } from 'domain/entities/Command';
import { getRnaPartLibraryItem } from 'domain/helpers/rna';
import { BaseMonomer } from 'domain/entities/BaseMonomer';
import { AmbiguousMonomer } from 'domain/entities/AmbiguousMonomer';
import { SugarRenderer } from 'application/render';
import { RNA_DNA_NON_MODIFIED_PART } from 'domain/constants/monomers';
import { KetMonomerClass } from 'application/formatters';
import { SnakeLayoutCellWidth } from 'domain/constants';

export class Nucleoside {
  constructor(
    public sugar: Sugar,
    public rnaBase: RNABase | AmbiguousMonomer,
  ) {}

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

  static createOnCanvas(
    rnaBaseName: string,
    position: Vec2,
    sugarName: RNA_DNA_NON_MODIFIED_PART = RNA_DNA_NON_MODIFIED_PART.SUGAR_RNA,
    coreEditorId: string,
    isAntisense = false,
  ) {
    const editor = CoreEditor.provideEditorInstance(coreEditorId);
    const isDnaSugar = sugarName === RNA_DNA_NON_MODIFIED_PART.SUGAR_DNA;
    const rnaBaseLibraryItem = getRnaPartLibraryItem(
      editor,
      rnaBaseName,
      KetMonomerClass.Base,
      isDnaSugar,
    );
    const sugarLibraryItem = getRnaPartLibraryItem(
      editor,
      sugarName,
      KetMonomerClass.Sugar,
    );

    assert(sugarLibraryItem);
    assert(rnaBaseLibraryItem);

    const topLeftItemPosition = position;
    const bottomItemPosition = position.add(
      Coordinates.canvasToModel(
        new Vec2(0, SnakeLayoutCellWidth + SugarRenderer.monomerSize.height),
      ),
    );
    const modelChanges = new Command();

    modelChanges.merge(
      editor.drawingEntitiesManager.addMonomer(
        { ...sugarLibraryItem, isAntisense },
        isAntisense ? bottomItemPosition : topLeftItemPosition,
      ),
    );
    modelChanges.merge(
      editor.drawingEntitiesManager.addMonomer(
        { ...rnaBaseLibraryItem, isAntisense },
        isAntisense ? topLeftItemPosition : bottomItemPosition,
      ),
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

    return { modelChanges, node: Nucleoside.fromSugar(sugar, false) };
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

  public get modified() {
    // TODO move isNotLastNode to separate getter because it is not modification
    //  It was added here because it needs to show similar icon as for phosphates modifications
    const isNotLastNode = !!getNextMonomerInChain(this.sugar);

    return (
      this.rnaBase.isModification || this.sugar.isModification || isNotLastNode
    );
  }
}
