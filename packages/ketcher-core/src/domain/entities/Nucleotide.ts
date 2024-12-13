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
import { Coordinates, CoreEditor } from 'application/editor/internal';
import { Vec2 } from 'domain/entities/vec2';
import { getRnaPartLibraryItem } from 'domain/helpers/rna';
import { RNA_DNA_NON_MODIFIED_PART } from 'domain/constants/monomers';
import { BaseMonomer } from 'domain/entities/BaseMonomer';
import { AmbiguousMonomer } from 'domain/entities/AmbiguousMonomer';
import { SugarRenderer } from 'application/render';
import { CELL_WIDTH } from 'domain/entities/DrawingEntitiesManager';

export class Nucleotide {
  constructor(
    public sugar: Sugar,
    public rnaBase: RNABase | AmbiguousMonomer,
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

  static createOnCanvas(
    rnaBaseName: string,
    position: Vec2,
    sugarName: RNA_DNA_NON_MODIFIED_PART = RNA_DNA_NON_MODIFIED_PART.SUGAR_RNA,
  ) {
    const editor = CoreEditor.provideEditorInstance();
    const rnaBaseLibraryItem = getRnaPartLibraryItem(editor, rnaBaseName);
    const phosphateLibraryItem = getRnaPartLibraryItem(
      editor,
      RNA_DNA_NON_MODIFIED_PART.PHOSPHATE,
    );
    const sugarLibraryItem = getRnaPartLibraryItem(editor, sugarName);

    assert(sugarLibraryItem);
    assert(rnaBaseLibraryItem);
    assert(phosphateLibraryItem);

    const topLeftItemPosition = position;
    const bottomItemPosition = position.add(
      Coordinates.canvasToModel(
        new Vec2(0, CELL_WIDTH + SugarRenderer.monomerSize.height),
      ),
    );

    const { command: modelChanges, monomers } =
      editor.drawingEntitiesManager.addRnaPreset({
        sugar: sugarLibraryItem,
        sugarPosition: topLeftItemPosition,
        rnaBase: rnaBaseLibraryItem,
        rnaBasePosition: bottomItemPosition,
        phosphate: phosphateLibraryItem,
        phosphatePosition: topLeftItemPosition.add(
          Coordinates.canvasToModel(new Vec2(CELL_WIDTH, 0)),
        ),
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
