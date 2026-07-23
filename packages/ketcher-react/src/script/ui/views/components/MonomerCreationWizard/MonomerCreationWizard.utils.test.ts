import { type BaseMonomer, KetMonomerClass } from 'ketcher-core';
import { getEditInstanceInitialValues } from './MonomerCreationWizard.utils';

const createMonomer = (
  props: BaseMonomer['monomerItem']['props'],
  label = props.MonomerCode ?? 'T',
) =>
  ({
    monomerItem: {
      label,
      props,
    },
  } as BaseMonomer);

describe('getEditInstanceInitialValues', () => {
  it('loads amino acid fields for Edit Instance with copies for user-editable aliases', () => {
    const values = getEditInstanceInitialValues(
      createMonomer({
        MonomerClass: KetMonomerClass.AminoAcid,
        MonomerCode: 'C',
        MonomerName: 'Cysteine',
        Name: 'Cysteine',
        MonomerNaturalAnalogCode: 'C',
        aliasHELM: 'C',
        aliasBILN: 'C',
        aliasAxoLabs: 'IgnoredAxoLabs',
        idtAliases: {
          base: 'IgnoredIDT',
        },
        modificationTypes: ['Natural amino acid'],
      }),
    );

    expect(values).toEqual({
      type: KetMonomerClass.AminoAcid,
      symbol: 'C_Copy',
      name: 'Cysteine_Copy',
      naturalAnalogue: 'C',
      aliasHELM: 'C_Copy',
      aliasBILN: 'C_Copy',
    });
  });

  it('does not load natural analogue, AxoLabs alias, or modification types for a phosphate', () => {
    const values = getEditInstanceInitialValues(
      createMonomer({
        MonomerClass: KetMonomerClass.Phosphate,
        MonomerCode: 'sP',
        MonomerName: 'Phosporothioate',
        Name: 'Phosporothioate',
        MonomerNaturalAnalogCode: 'P',
        aliasHELM: 'sp',
        aliasBILN: 'sp',
        aliasAxoLabs: 'sp',
      }),
    );

    expect(values).toEqual({
      type: KetMonomerClass.Phosphate,
      symbol: 'sP_Copy',
      name: 'Phosporothioate_Copy',
      naturalAnalogue: '',
      aliasHELM: 'sp_Copy',
      aliasBILN: 'sp_Copy',
    });
  });
});
