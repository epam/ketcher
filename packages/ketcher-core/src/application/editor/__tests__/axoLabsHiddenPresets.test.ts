import fs from 'fs';
import path from 'path';
import type {
  IKetMacromoleculesContent,
  IKetMonomerGroupTemplate,
} from 'application/formatters';

const library: IKetMacromoleculesContent = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/monomers.ket'), 'utf8'),
);

const getPresetsByAxoLabsAlias = (aliasAxoLabs: string) =>
  library.root.templates
    .map(({ $ref }) => library[$ref] as IKetMonomerGroupTemplate)
    .filter((template) => template?.aliasAxoLabs === aliasAxoLabs);

const DEOXY_RIBOSE = 'dR___Deoxy-Ribose';
const METHYL_RIBOSE = "mR___2'-O-Methyl-Ribose";
const MOE = "MOE___2'-O-Methoxyethyl ribose";
const LNA = 'lna___LNA (2,4-BNA)';

describe('AxoLabs hidden presets in the default library', () => {
  it.each([
    ['dA', DEOXY_RIBOSE, 'A___Adenine'],
    ['dC', DEOXY_RIBOSE, 'C___Cytosine'],
    ['dG', DEOXY_RIBOSE, 'G___Guanine'],
    ['dT', DEOXY_RIBOSE, 'T___Thymine'],
    ['a', METHYL_RIBOSE, 'A___Adenine'],
    ['c', METHYL_RIBOSE, 'C___Cytosine'],
    ['g', METHYL_RIBOSE, 'G___Guanine'],
    ['u', METHYL_RIBOSE, 'U___Uracil'],
    ['Cm', MOE, 'C___Cytosine'],
    ['Ab', LNA, 'A___Adenine'],
    ['Cb', LNA, 'C___Cytosine'],
    ['Gb', LNA, 'G___Guanine'],
    ['Tb', LNA, 'T___Thymine'],
    ['(5Mc)', METHYL_RIBOSE, '5meC___5-methylcytosine'],
  ])('%s is a hidden preset of %s and %s', (aliasAxoLabs, sugar, base) => {
    const presets = getPresetsByAxoLabsAlias(aliasAxoLabs);

    expect(presets).toHaveLength(1);
    expect(presets[0].hidden).toBe(true);
    expect(presets[0].templates).toEqual(
      [sugar, base, 'P___Phosphate'].map((id) => ({
        $ref: `monomerTemplate-${id}`,
      })),
    );
    presets[0].templates.forEach(({ $ref }) => {
      expect(library[$ref]).toBeDefined();
    });
  });
});
