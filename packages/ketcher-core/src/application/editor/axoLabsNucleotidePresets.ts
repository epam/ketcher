import {
  type IKetMacromoleculesContent,
  type IKetMonomerGroupTemplate,
  type IKetMonomerTemplate,
  KetMonomerGroupTemplateClass,
  KetTemplateType,
} from 'application/formatters/types/ket';
import { KetMonomerClass } from 'domain/constants/monomers';

type AxoLabsNucleotideComponents = {
  sugar: string;
  base: string;
  phosphate: string;
};

const AXOLABS_NUCLEOTIDES: Record<string, AxoLabsNucleotideComponents> = {
  dA: { sugar: 'dR', base: 'A', phosphate: 'P' },
  dC: { sugar: 'dR', base: 'C', phosphate: 'P' },
  dG: { sugar: 'dR', base: 'G', phosphate: 'P' },
  dT: { sugar: 'dR', base: 'T', phosphate: 'P' },
  a: { sugar: 'mR', base: 'A', phosphate: 'P' },
  c: { sugar: 'mR', base: 'C', phosphate: 'P' },
  g: { sugar: 'mR', base: 'G', phosphate: 'P' },
  u: { sugar: 'mR', base: 'U', phosphate: 'P' },
  Cm: { sugar: 'MOE', base: 'C', phosphate: 'P' },
  Ab: { sugar: 'lna', base: 'A', phosphate: 'P' },
  Cb: { sugar: 'lna', base: 'C', phosphate: 'P' },
  Gb: { sugar: 'lna', base: 'G', phosphate: 'P' },
  Tb: { sugar: 'lna', base: 'T', phosphate: 'P' },
  '(5Mc)': { sugar: 'mR', base: '5meC', phosphate: 'P' },
};

const getTemplateRefsByClassAndAlias = (library: IKetMacromoleculesContent) => {
  const refs = new Map<string, string>();

  library.root.templates.forEach(({ $ref }) => {
    const template = library[$ref] as IKetMonomerTemplate | undefined;
    if (template?.type !== KetTemplateType.MONOMER_TEMPLATE) {
      return;
    }
    const key = `${template.class}:${template.alias}`;
    if (!refs.has(key)) {
      refs.set(key, $ref);
    }
  });

  return refs;
};

const getUsedPresetKeys = (library: IKetMacromoleculesContent) => {
  const aliases = new Set<string>();
  const ids = new Set<string>();

  library.root.templates.forEach(({ $ref }) => {
    const template = library[$ref] as IKetMonomerGroupTemplate | undefined;
    if (template?.type !== KetTemplateType.MONOMER_GROUP_TEMPLATE) {
      return;
    }
    if (template.aliasAxoLabs) {
      aliases.add(template.aliasAxoLabs);
    }
    ids.add(template.id);
  });

  return { aliases, ids };
};

export const addAxoLabsNucleotidePresets = (
  library: IKetMacromoleculesContent,
): IKetMacromoleculesContent => {
  const templateRefs = getTemplateRefsByClassAndAlias(library);
  const usedPresetKeys = getUsedPresetKeys(library);
  const extendedLibrary = {
    ...library,
    root: { ...library.root, templates: [...library.root.templates] },
  } as IKetMacromoleculesContent;

  Object.entries(AXOLABS_NUCLEOTIDES).forEach(
    ([aliasAxoLabs, { sugar, base, phosphate }]) => {
      const name = `${sugar}(${base})${phosphate}`;
      if (
        usedPresetKeys.aliases.has(aliasAxoLabs) ||
        usedPresetKeys.ids.has(name)
      ) {
        return;
      }

      const sugarRef = templateRefs.get(`${KetMonomerClass.Sugar}:${sugar}`);
      const baseRef = templateRefs.get(`${KetMonomerClass.Base}:${base}`);
      const phosphateRef = templateRefs.get(
        `${KetMonomerClass.Phosphate}:${phosphate}`,
      );
      if (!sugarRef || !baseRef || !phosphateRef) {
        return;
      }

      const ref = `monomerGroupTemplate-AxoLabs-${aliasAxoLabs}`;
      extendedLibrary[ref] = {
        type: KetTemplateType.MONOMER_GROUP_TEMPLATE,
        id: name,
        name,
        class: KetMonomerGroupTemplateClass.RNA,
        aliasAxoLabs,
        templates: [
          { $ref: sugarRef },
          { $ref: baseRef },
          { $ref: phosphateRef },
        ],
      };
      extendedLibrary.root.templates.push({ $ref: ref });
    },
  );

  return extendedLibrary;
};
