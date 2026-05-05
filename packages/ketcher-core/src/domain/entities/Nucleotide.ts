import { provideEditorInstance } from 'application/editor/editorSingleton';
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
import { Coordinates } from 'application/editor/shared/coordinates';
import { Vec2 } from 'domain/entities/vec2';
import { getRnaPartLibraryItem } from 'domain/helpers/rna';
import {
  KetMonomerClass,
  RNA_DNA_NON_MODIFIED_PART,
} from 'domain/constants/monomers';
import { BaseMonomer } from 'domain/entities/BaseMonomer';
import { AmbiguousMonomer } from 'domain/entities/AmbiguousMonomer';
import { SnakeLayoutCellWidth } from 'domain/constants';
import { getMonomerSize } from 'application/render/renderers/monomerSizeState';

export class Nucleotide {
  private readonly monomersCache: BaseMonomer[] = [];
  constructor(
    public readonly sugar: Sugar | AmbiguousMonomer,
    public readonly rnaBase: RNABase | AmbiguousMonomer,
    public readonly phosphate: Phosphate,
  ) {
    this.monomersCache = [sugar, rnaBase, phosphate];
  }

  toString() {
    return (
      `sugar: ${this.sugar.constructor.name}, ` +
      `rnaBase: ${this.rnaBase.constructor.name}, ` +
      `phosphate: ${this.phosphate.constructor.name}`
    );
  }

  static fromSugar(sugar: Sugar | AmbiguousMonomer, needValidation = true) {
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
    const editor = provideEditorInstance();
    const isDnaSugar = sugarName === RNA_DNA_NON_MODIFIED_PART.SUGAR_DNA;
    const rnaBaseLibraryItem = getRnaPartLibraryItem(
      editor,
      rnaBaseName,
      KetMonomerClass.Base,
      isDnaSugar,
    );
    const phosphateLibraryItem = getRnaPartLibraryItem(
      editor,
      RNA_DNA_NON_MODIFIED_PART.PHOSPHATE,
    );
    const sugarLibraryItem = getRnaPartLibraryItem(
      editor,
      sugarName,
      KetMonomerClass.Sugar,
    );

    assert(sugarLibraryItem);
    assert(rnaBaseLibraryItem);
    assert(phosphateLibraryItem);

    const topLeftItemPosition = position;
    const bottomItemPosition = position.add(
      Coordinates.canvasToModel(
        new Vec2(0, SnakeLayoutCellWidth + getMonomerSize().height),
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
          Coordinates.canvasToModel(new Vec2(SnakeLayoutCellWidth, 0)),
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
    return this.firstMonomerInNode;
  }

  public get monomers(): BaseMonomer[] {
    return this.monomersCache;
  }

  public get firstMonomerInNode() {
    return this.isFiveEndPhosphate ? this.phosphate : this.sugar;
  }

  public get lastMonomerInNode() {
    return this.isFiveEndPhosphate ? this.sugar : this.phosphate;
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

  public get isFiveEndPhosphate() {
    return (
      this.sugar.attachmentPointsToBonds.R1?.getAnotherEntity(this.sugar) ===
        this.phosphate &&
      this.phosphate.attachmentPointsToBonds.R2?.getAnotherEntity(
        this.phosphate,
      ) === this.sugar
    );
  }
}
