import { BaseMonomer } from './BaseMonomer';
import { ChemSubChain } from 'domain/entities/monomer-chains/ChemSubChain';
import { SubChainNode } from 'domain/entities/monomer-chains/types';
import { Vec2 } from 'domain/entities/vec2';
import { Struct } from 'domain/entities/struct';
import { monomerFactory } from 'application/editor/operations/monomer/monomerFactory';
import {
  KetAmbiguousMonomerTemplateSubType,
  KetMonomerClass,
} from 'application/formatters';
import {
  ambiguousMapping,
  MONOMER_CLASS_TO_CONSTRUCTOR,
} from 'domain/constants/monomers';
import { IVariantMonomer } from 'domain/entities/types';
import { AmbiguousMonomerType, AttachmentPointName } from 'domain/types';
import { PeptideSubChain } from 'domain/entities/monomer-chains/PeptideSubChain';
import { RnaSubChain } from 'domain/entities/monomer-chains/RnaSubChain';

export const DEFAULT_VARIANT_MONOMER_LABEL = '%';

export class AmbiguousMonomer extends BaseMonomer implements IVariantMonomer {
  public monomers: BaseMonomer[];
  public monomerClass: KetMonomerClass;
  public subtype: KetAmbiguousMonomerTemplateSubType;
  constructor(
    public variantMonomerItem: AmbiguousMonomerType,
    position?: Vec2,
    generateId = true,
  ) {
    let variantMonomerLabel: string;
    if (
      variantMonomerItem.subtype ===
        KetAmbiguousMonomerTemplateSubType.MIXTURE ||
      (variantMonomerItem.label && variantMonomerItem.label.length > 1)
    ) {
      variantMonomerLabel =
        ambiguousMapping[variantMonomerItem.id] ||
        DEFAULT_VARIANT_MONOMER_LABEL;
    } else {
      variantMonomerLabel = variantMonomerItem.label;
    }

    super(
      {
        label: variantMonomerLabel,
        props: {
          MonomerNaturalAnalogCode: '',
          MonomerName: variantMonomerLabel,
          Name: variantMonomerLabel,
        },
        attachmentPoints: AmbiguousMonomer.getAttachmentPoints(
          variantMonomerItem.monomers,
        ),
        struct: new Struct(),
        isAmbiguous: true,
      },
      position,
      { generateId },
    );
    this.monomers = variantMonomerItem.monomers;
    this.monomerClass = AmbiguousMonomer.getMonomerClass(
      variantMonomerItem.monomers,
    );
    this.subtype = variantMonomerItem.subtype;
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

  public get monomerCaps() {
    let monomerCaps: Partial<Record<AttachmentPointName, string>> | undefined;

    this.monomers.forEach((monomer) => {
      if (monomer.monomerItem.props.MonomerCaps) {
        if (!monomerCaps) {
          monomerCaps = { ...monomer.monomerItem.props.MonomerCaps };
        } else {
          for (const [attachmentPointName, label] of Object.entries(
            monomer.monomerItem.props.MonomerCaps,
          )) {
            if (!monomerCaps[attachmentPointName]) {
              delete monomerCaps[attachmentPointName];
            } else if (monomerCaps[attachmentPointName] !== label) {
              monomerCaps[attachmentPointName] = '';
            }
          }
        }
      }
    });

    return monomerCaps;
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
    const monomerClassToSubchainConstructor = {
      [KetMonomerClass.CHEM]: ChemSubChain,
      [KetMonomerClass.AminoAcid]: PeptideSubChain,
      [KetMonomerClass.RNA]: RnaSubChain,
      [KetMonomerClass.DNA]: RnaSubChain,
    };

    return monomerClassToSubchainConstructor[this.monomerClass] || ChemSubChain;
  }

  public isMonomerTypeDifferentForChaining(monomerToChain: SubChainNode) {
    return MONOMER_CLASS_TO_CONSTRUCTOR[
      this.monomerClass
    ].prototype.isMonomerTypeDifferentForChaining.call(this, monomerToChain);
  }
}
