import { type BaseMonomer, KetMonomerClass } from 'ketcher-core';
import {
  getEditAllInstancesInitialValues,
  getEditInstanceInitialValues,
} from './MonomerCreationWizard.utils';

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
      editMode: 'instance',
      originalType: KetMonomerClass.AminoAcid,
      originalSymbol: 'C',
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
      editMode: 'instance',
      originalType: KetMonomerClass.Phosphate,
      originalSymbol: 'sP',
    });
  });
});

describe('getEditAllInstancesInitialValues', () => {
  it('loads existing monomer fields unchanged without AxoLabs or IDT aliases', () => {
    const values = getEditAllInstancesInitialValues(
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
      }),
    );

    expect(values).toEqual({
      type: KetMonomerClass.AminoAcid,
      symbol: 'C',
      name: 'Cysteine',
      naturalAnalogue: 'C',
      aliasHELM: 'C',
      aliasBILN: 'C',
      editMode: 'all',
      originalType: KetMonomerClass.AminoAcid,
      originalSymbol: 'C',
    });
  });

  it('collects required attachment points when an RNA component participates in presets', () => {
    const values = getEditAllInstancesInitialValues(
      createMonomer(
        {
          MonomerClass: KetMonomerClass.Sugar,
          MonomerCode: 'R',
          MonomerName: 'Ribose',
          Name: 'Ribose',
          MonomerNaturalAnalogCode: 'R',
        },
        'R',
      ),
      {
        root: {
          templates: [{ $ref: 'monomerGroupTemplate-A' }],
        },
        'monomerGroupTemplate-A': {
          type: 'monomerGroupTemplate',
          class: KetMonomerClass.RNA,
          templates: [{ $ref: 'monomerTemplate-Ribose___Ribose' }],
          connections: [
            {
              endpoint1: {
                templateId: 'monomerTemplate-Ribose___Ribose',
                attachmentPointId: 'R3',
              },
              endpoint2: {
                templateId: 'monomerTemplate-A___A',
                attachmentPointId: 'R1',
              },
            },
            {
              endpoint1: {
                templateId: 'monomerTemplate-P___P',
                attachmentPointId: 'R1',
              },
              endpoint2: {
                templateId: 'monomerTemplate-Ribose___Ribose',
                attachmentPointId: 'R1',
              },
            },
          ],
        },
      },
    );

    expect(values.presetRequirements).toEqual({
      type: KetMonomerClass.Sugar,
      attachmentPoints: ['R1', 'R3'],
    });
  });
});
