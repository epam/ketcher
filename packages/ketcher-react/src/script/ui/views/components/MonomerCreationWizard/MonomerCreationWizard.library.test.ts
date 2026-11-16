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
  const savedItem: MonomerItemType = {
    label: 'A',
    struct: new Struct(),
    props: {
      id: 'original',
      MonomerName: 'A',
      Name: 'New name',
      MonomerNaturalAnalogCode: 'A',
      MonomerClass: KetMonomerClass.AminoAcid,
    },
  };
  const update = jest.fn();
  const conversion = jest.fn();
  const dispatch = jest.fn();
  const scheduleReplacement = jest.fn();
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
      monomersLibrary: [savedItem],
      scheduleMonomerWizardInstanceReplacement: scheduleReplacement,
    });
  });

  afterEach(() => jest.restoreAllMocks());

  it('supersedes the library entry when the code and the type are unchanged, retaining properties without controls', async () => {
    await saveLibraryMonomer(
      ketcher,
      {
        monomerTemplate: { ...template, alias: 'A', fullName: 'New name' },
        monomerRef: 'monomerTemplate-new-id',
      },
      original,
    );
    const [ket, ref] = update.mock.calls[0];
    expect(ref).toBe('monomerTemplate-original');
    expect(JSON.parse(ket)['monomerTemplate-original']).toMatchObject({
      id: 'original',
      alias: 'A',
      fullName: 'New name',
      aliasAxoLabs: 'original-axo',
      idtAliases: { base: 'original-idt' },
    });
    expect(JSON.parse(persist.mock.calls[0][0])).toEqual({
      data: ket,
      editedMonomerRef: ref,
    });
    expect(dispatch).toHaveBeenCalledWith('sdf');
  });

  it('adds a distinct monomer when the code changed, leaving the original alone', async () => {
    await saveLibraryMonomer(
      ketcher,
      { monomerTemplate: template, monomerRef: 'monomerTemplate-new-id' },
      original,
    );
    const [ket, ref] = update.mock.calls[0];
    expect(ref).toBeUndefined();
    const saved = JSON.parse(ket)['monomerTemplate-new-id'];
    expect(saved).toMatchObject({ id: 'new-id', alias: 'Renamed' });
    expect(saved).not.toHaveProperty('aliasAxoLabs');
    expect(saved).not.toHaveProperty('idtAliases');
    expect(persist.mock.calls[0][0]).toBe(ket);
  });

  it('adds a distinct monomer when the type changed, leaving the original alone', async () => {
    await saveLibraryMonomer(
      ketcher,
      {
        monomerTemplate: {
          ...template,
          alias: 'A',
          class: KetMonomerClass.CHEM,
        },
        monomerRef: 'monomerTemplate-new-id',
      },
      original,
    );
    const [ket, ref] = update.mock.calls[0];
    expect(ref).toBeUndefined();
    expect(JSON.parse(ket)['monomerTemplate-new-id']).toMatchObject({
      id: 'new-id',
      alias: 'A',
      class: KetMonomerClass.CHEM,
    });
  });

  it('rejects a changed code that another monomer of the same class already uses', async () => {
    (provideEditorInstance as jest.Mock).mockReturnValue({
      monomersLibraryParsedJson: {
        'monomerTemplate-original': { ...template, id: 'original', alias: 'A' },
      },
      checkIfMonomerSymbolClassPairExists: () => true,
      updateMonomersLibrary: update,
      monomersLibrary: [savedItem],
      scheduleMonomerWizardInstanceReplacement: scheduleReplacement,
    });
    await expect(
      saveLibraryMonomer(
        ketcher,
        { monomerTemplate: template, monomerRef: 'monomerTemplate-new-id' },
        original,
      ),
    ).rejects.toThrow('A monomer with this code already exists.');
    expect(update).not.toHaveBeenCalled();
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

  it('queues the replacement of the original monomer instances on the canvas', async () => {
    await saveLibraryMonomer(
      ketcher,
      {
        monomerTemplate: { ...template, alias: 'A' },
        monomerRef: 'monomerTemplate-new-id',
      },
      original,
    );
    expect(scheduleReplacement).toHaveBeenCalledWith({
      monomerClass: KetMonomerClass.AminoAcid,
      symbol: 'A',
      newMonomerItem: savedItem,
    });
  });

  it('leaves the canvas alone when duplicating', async () => {
    await saveLibraryMonomer(ketcher, {
      monomerTemplate: { ...template, alias: 'A_Copy' },
      monomerRef: 'monomerTemplate-new-id',
    });
    expect(scheduleReplacement).not.toHaveBeenCalled();
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
