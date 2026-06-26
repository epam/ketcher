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
      createMonomer(
        {
          MonomerClass: KetMonomerClass.AminoAcid,
          MonomerName: 'C',
          Name: 'Cysteine',
          MonomerFullName: 'Cysteine',
          MonomerNaturalAnalogCode: 'C',
          aliasHELM: 'C',
          aliasBILN: 'C',
          aliasAxoLabs: 'IgnoredAxoLabs',
          idtAliases: {
            base: 'IgnoredIDT',
          },
          modificationTypes: ['Natural amino acid'],
        },
        'C',
      ),
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
      createMonomer(
        {
          MonomerClass: KetMonomerClass.Phosphate,
          MonomerName: 'sP',
          Name: 'Phosporothioate',
          MonomerFullName: 'Phosporothioate',
          MonomerNaturalAnalogCode: 'P',
          aliasHELM: 'sp',
          aliasBILN: 'sp',
          aliasAxoLabs: 'sp',
        },
        'sP',
      ),
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

  it('falls back to Name when MonomerFullName is absent', () => {
    const values = getEditInstanceInitialValues(
      createMonomer(
        {
          MonomerClass: KetMonomerClass.AminoAcid,
          MonomerName: 'C',
          Name: 'Cysteine',
          MonomerNaturalAnalogCode: 'C',
          aliasHELM: 'C',
          aliasBILN: 'C',
        },
        'C',
      ),
    );

    expect(values.name).toBe('Cysteine_Copy');
  });
});
