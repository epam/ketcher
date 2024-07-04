import { IRnaPreset } from 'components/monomerLibrary/RnaBuilder/types';
import {
  IKetMonomerGroupTemplate,
  monomerFactory,
  MonomerItemType,
  setMonomerTemplatePrefix,
  KetMonomerClass,
  IRnaLabeledPreset,
} from 'ketcher-core';
import { getMonomerUniqueKey } from 'state/library';

interface RnaPresetsTemplatesType
  extends Pick<IKetMonomerGroupTemplate, 'templates' | 'idtAliases'>,
    Pick<IRnaLabeledPreset, 'default' | 'favorite' | 'name'> {}

export const getPresets = (
  monomers: ReadonlyArray<MonomerItemType>,
  rnaPresetsTemplates: ReadonlyArray<RnaPresetsTemplatesType>,
  isDefault?: boolean,
): IRnaPreset[] => {
  const monomerLibraryItemByMonomerIDMap = new Map<string, MonomerItemType>(
    monomers.map((monomer) => {
      const monomerID = setMonomerTemplatePrefix(getMonomerUniqueKey(monomer));
      return [monomerID, monomer];
    }),
  );

  return rnaPresetsTemplates.map(
    (rnaPresetsTemplate: RnaPresetsTemplatesType): IRnaPreset => {
      const rnaPartsMonomerLibraryItemByMonomerClassMap = new Map<
        KetMonomerClass,
        MonomerItemType
      >(
        rnaPresetsTemplate.templates.map((rnaPartsMonomerTemplateRef) => {
          // TODO: Do we need to check for existence? Suddenly there is `undefined`.
          const monomer = monomerLibraryItemByMonomerIDMap.get(
            rnaPartsMonomerTemplateRef.$ref,
          ) as MonomerItemType;
          const [, , monomerClass] = monomerFactory(monomer);
          return [monomerClass, monomer];
        }),
      );

      // TODO: Do we need to check for existence? Suddenly there is `undefined`.
      const ribose = rnaPartsMonomerLibraryItemByMonomerClassMap.get(
        KetMonomerClass.Sugar,
      ) as MonomerItemType;
      const rnaBase = rnaPartsMonomerLibraryItemByMonomerClassMap.get(
        KetMonomerClass.Base,
      ) as MonomerItemType;
      const phosphate = rnaPartsMonomerLibraryItemByMonomerClassMap.get(
        KetMonomerClass.Phosphate,
      ) as MonomerItemType;

      const result: IRnaPreset = {
        name: rnaPresetsTemplate.name,
        favorite: rnaPresetsTemplate.favorite,
        default: isDefault || rnaPresetsTemplate.default,
      };

      const monomers = [ribose, rnaBase, phosphate];

      for (const monomer of monomers) {
        const monomerClass = monomer?.props?.MonomerClass?.toLocaleLowerCase();
        if (!monomerClass) continue;
        result[monomerClass] = {
          ...monomer,
          label: monomer.props.MonomerName,
        };
      }

      if (!rnaPresetsTemplate.idtAliases) {
        return result;
      }

      return {
        ...result,
        idtAliases: rnaPresetsTemplate.idtAliases,
      };
    },
  );
};
