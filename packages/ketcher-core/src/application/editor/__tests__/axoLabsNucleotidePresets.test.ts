import fs from 'fs';
import path from 'path';
import type {
  IKetMacromoleculesContent,
  IKetMonomerGroupTemplate,
} from 'application/formatters';
import { KetTemplateType } from 'application/formatters/types/ket';
import { addAxoLabsNucleotidePresets } from '../axoLabsNucleotidePresets';

const loadDefaultLibrary = (): IKetMacromoleculesContent =>
  JSON.parse(
    fs.readFileSync(path.join(__dirname, '../data/monomers.ket'), 'utf8'),
  );

const getPresetByAxoLabsAlias = (
  library: IKetMacromoleculesContent,
  aliasAxoLabs: string,
) =>
  library.root.templates
    .map(({ $ref }) => library[$ref] as IKetMonomerGroupTemplate)
    .filter((template) => template?.aliasAxoLabs === aliasAxoLabs);

describe('addAxoLabsNucleotidePresets', () => {
  const library = loadDefaultLibrary();
  const extendedLibrary = addAxoLabsNucleotidePresets(library);

  it.each([
    ['dT', ['dR___Deoxy-Ribose', 'T___Thymine', 'P___Phosphate']],
    ['a', ["mR___2'-O-Methyl-Ribose", 'A___Adenine', 'P___Phosphate']],
    ['Cm', ["MOE___2'-O-Methoxyethyl ribose", 'C___Cytosine', 'P___Phosphate']],
    ['Cb', ['lna___LNA (2,4-BNA)', 'C___Cytosine', 'P___Phosphate']],
    [
      '(5Mc)',
      ["mR___2'-O-Methyl-Ribose", '5meC___5-methylcytosine', 'P___Phosphate'],
    ],
  ])('assembles %s from library components', (aliasAxoLabs, components) => {
    const presets = getPresetByAxoLabsAlias(extendedLibrary, aliasAxoLabs);

    expect(presets).toHaveLength(1);
    expect(presets[0].templates).toEqual(
      components.map((id) => ({ $ref: `monomerTemplate-${id}` })),
    );
  });

  it('does not duplicate codes that already have a library preset', () => {
    expect(getPresetByAxoLabsAlias(extendedLibrary, 'Am')).toHaveLength(1);
  });

  it('does not add a preset whose id is already taken by a library preset', () => {
    const libraryWithPreset = loadDefaultLibrary();
    libraryWithPreset['monomerGroupTemplate-dR(A)P'] = {
      type: KetTemplateType.MONOMER_GROUP_TEMPLATE,
      id: 'dR(A)P',
      name: 'dR(A)P',
      templates: [],
    };
    libraryWithPreset.root.templates.push({
      $ref: 'monomerGroupTemplate-dR(A)P',
    });

    const presets = addAxoLabsNucleotidePresets(libraryWithPreset);

    expect(getPresetByAxoLabsAlias(presets, 'dA')).toHaveLength(0);
    expect(getPresetByAxoLabsAlias(presets, 'dT')).toHaveLength(1);
  });

  it('does not mutate the source library', () => {
    const templatesCount = loadDefaultLibrary().root.templates.length;

    expect(library.root.templates).toHaveLength(templatesCount);
    expect(getPresetByAxoLabsAlias(library, 'dT')).toHaveLength(0);
  });

  it('skips codes whose components are missing from the library', () => {
    const emptyLibrary = {
      root: { templates: [], nodes: [], connections: [] },
    } as unknown as IKetMacromoleculesContent;

    expect(addAxoLabsNucleotidePresets(emptyLibrary).root.templates).toEqual(
      [],
    );
  });
});
