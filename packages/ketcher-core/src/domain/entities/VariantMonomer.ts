import { BaseMonomer } from './BaseMonomer';
import { ChemSubChain } from 'domain/entities/monomer-chains/ChemSubChain';
import { SubChainNode } from 'domain/entities/monomer-chains/types';
import { Vec2 } from 'domain/entities/vec2';
import { Struct } from 'domain/entities/struct';
import { monomerFactory } from 'application/editor/operations/monomer/monomerFactory';
import { KetMonomerClass } from 'application/formatters';
import { MONOMER_CLASS_TO_CONSTRUCTOR } from 'domain/constants/monomers';
import { IVariantMonomer } from 'domain/entities/types';
export const DEFAULT_VARIANT_MONOMER_LABEL = '%';

export class VariantMonomer extends BaseMonomer implements IVariantMonomer {
  public monomers: BaseMonomer[];
  public monomerClass: KetMonomerClass;
  constructor(monomers: BaseMonomer[], position: Vec2, label?: string) {
    const variantMonomerLabel = label || DEFAULT_VARIANT_MONOMER_LABEL;
    super(
      {
        label: variantMonomerLabel,
        props: {
          MonomerNaturalAnalogCode: '',
          MonomerName: variantMonomerLabel,
          Name: variantMonomerLabel,
        },
        attachmentPoints: VariantMonomer.getAttachmentPoints(monomers),
        struct: new Struct(),
      },
      position,
    );
    this.monomers = monomers;
    this.monomerClass = VariantMonomer.getMonomerClass(monomers);
  }

  public static getMonomerClass(monomers: BaseMonomer[]) {
    const [, , monomerClass] = monomerFactory(monomers[0].monomerItem);

    const containDifferentMonomerTypes = monomers.some((monomer) => {
      const [, , MonomerClassToCompare] = monomerFactory(monomer.monomerItem);

      return monomerClass !== MonomerClassToCompare;
    });

    if (containDifferentMonomerTypes) {
      return KetMonomerClass.CHEM;
    }

    return monomerClass;
  }

  private static getAttachmentPoints(monomers: BaseMonomer[]) {
    const monomersAttachmentPoints = monomers.map(
      (monomer) => monomer.listOfAttachmentPoints,
    );
    const possibleAttachmentPoints = monomersAttachmentPoints.flat();
    const attachmentPoints = possibleAttachmentPoints.filter(
      (attachmentPointName) => {
        return monomersAttachmentPoints.every((monomerAttachmentPoints) =>
          monomerAttachmentPoints.includes(attachmentPointName),
        );
      },
    );

    return attachmentPoints.map((attachmentPointName) => {
      return {
        label: attachmentPointName,
        leavingGroup: {
          atoms: [],
        },
        attachmentAtom: -1,
      };
    });
  }

  public getValidSourcePoint(_secondMonomer?: BaseMonomer) {
    return MONOMER_CLASS_TO_CONSTRUCTOR[
      this.monomerClass
    ].prototype.getValidSourcePoint.call(this, _secondMonomer);
  }

  public getValidTargetPoint(_firstMonomer: BaseMonomer) {
    return MONOMER_CLASS_TO_CONSTRUCTOR[
      this.monomerClass
    ].prototype.getValidTargetPoint.call(this, _firstMonomer);
  }

  public get SubChainConstructor() {
    return ChemSubChain;
  }

  public isMonomerTypeDifferentForChaining(monomerToChain: SubChainNode) {
    return ![ChemSubChain].includes(monomerToChain.SubChainConstructor);
  }
}
