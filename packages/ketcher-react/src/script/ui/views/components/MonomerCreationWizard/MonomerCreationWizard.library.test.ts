import {
  type IKetMonomerTemplate,
  type Ketcher,
  KetMonomerClass,
  KetTemplateType,
  type MonomerItemType,
  provideEditorInstance,
  SettingsManager,
  Struct,
} from 'ketcher-core';
import { saveLibraryMonomer } from './MonomerCreationWizard.library';

jest.mock('ketcher-core', () => ({
  ...jest.requireActual('ketcher-core'),
  provideEditorInstance: jest.fn(),
}));

describe('saving library wizard changes', () => {
  const original: MonomerItemType = {
    label: 'A',
    struct: new Struct(),
    props: {
      id: 'original',
      MonomerName: 'A',
      Name: 'Alanine',
      MonomerNaturalAnalogCode: 'A',
      MonomerClass: KetMonomerClass.AminoAcid,
    },
  };
  const template: IKetMonomerTemplate = {
    type: KetTemplateType.MONOMER_TEMPLATE,
    id: 'new-id',
    class: KetMonomerClass.AminoAcid,
    classHELM: 'PEPTIDE',
    alias: 'Renamed',
    fullName: 'New name',
    naturalAnalogShort: 'A',
    atoms: [],
    bonds: [],
    root: { templates: [], nodes: [], connections: [] },
  };
  const update = jest.fn();
  const conversion = jest.fn();
  const dispatch = jest.fn();
  let persist: jest.SpyInstance;
  const ketcher = {
    id: 'test',
    ensureMonomersLibraryDataInSdfFormat: conversion,
    libraryUpdateEvent: { dispatch },
  } as unknown as Ketcher;

  beforeEach(() => {
    jest.clearAllMocks();
    persist = jest
      .spyOn(SettingsManager, 'addMonomerLibraryUpdate')
      .mockImplementation();
    conversion.mockResolvedValue('sdf');
    (provideEditorInstance as jest.Mock).mockReturnValue({
      monomersLibraryParsedJson: {
        'monomerTemplate-original': {
          ...template,
          id: 'original',
          alias: 'A',
          aliasAxoLabs: 'original-axo',
          idtAliases: { base: 'original-idt' },
        },
      },
      checkIfMonomerSymbolClassPairExists: () => false,
      updateMonomersLibrary: update,
    });
  });

  afterEach(() => jest.restoreAllMocks());

  it('saves a rename against the original identity, retaining properties without controls', async () => {
    await saveLibraryMonomer(
      ketcher,
      { monomerTemplate: template, monomerRef: 'monomerTemplate-new-id' },
      original,
    );
    const [ket, ref] = update.mock.calls[0];
    expect(ref).toBe('monomerTemplate-original');
    expect(JSON.parse(ket)['monomerTemplate-original']).toMatchObject({
      id: 'original',
      alias: 'Renamed',
      aliasAxoLabs: 'original-axo',
      idtAliases: { base: 'original-idt' },
    });
    expect(JSON.parse(persist.mock.calls[0][0])).toEqual({
      data: ket,
      editedMonomerRef: ref,
    });
    expect(dispatch).toHaveBeenCalledWith('sdf');
  });

  it('creates duplicates without inheriting the original unsupported properties', async () => {
    await saveLibraryMonomer(ketcher, {
      monomerTemplate: { ...template, alias: 'A_Copy' },
      monomerRef: 'monomerTemplate-new-id',
    });
    const [ket, ref] = update.mock.calls[0];
    expect(ref).toBeUndefined();
    const saved = JSON.parse(ket)['monomerTemplate-new-id'];
    expect(saved.alias).toBe('A_Copy');
    expect(saved).not.toHaveProperty('aliasAxoLabs');
    expect(saved).not.toHaveProperty('idtAliases');
    expect(saved).not.toHaveProperty('modificationTypes');
  });

  it('does not change or persist the library if conversion fails', async () => {
    conversion.mockRejectedValue(new Error('Conversion failed'));
    await expect(
      saveLibraryMonomer(
        ketcher,
        { monomerTemplate: template, monomerRef: 'monomerTemplate-new-id' },
        original,
      ),
    ).rejects.toThrow('Conversion failed');
    expect(update).not.toHaveBeenCalled();
    expect(persist).not.toHaveBeenCalled();
  });

  it('does not persist or notify when library collision validation fails', async () => {
    update.mockImplementationOnce(() => {
      throw new Error('Alias collision');
    });
    await expect(
      saveLibraryMonomer(
        ketcher,
        { monomerTemplate: template, monomerRef: 'monomerTemplate-new-id' },
        original,
      ),
    ).rejects.toThrow('Alias collision');
    expect(persist).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });
});
