import {
  type BaseMonomer,
  type CoreEditor,
  KetMonomerClass,
} from 'ketcher-core';
import {
  ensureMonomersLibraryLoadedForSubmit,
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
  }) as BaseMonomer;

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
      editMode: 'instance',
      originalType: KetMonomerClass.AminoAcid,
      originalSymbol: 'C',
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
      symbol: 'C_Copy',
      name: 'Cysteine_Copy',
      naturalAnalogue: 'C',
      aliasHELM: 'C_Copy',
      aliasBILN: 'C_Copy',
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

  it.each([
    [KetMonomerClass.Base, 'Base', ['R1']],
    [KetMonomerClass.Sugar, 'Sugar', ['R1', 'R3']],
    [KetMonomerClass.Phosphate, 'Phosphate', ['R2']],
  ] as const)(
    'collects default required attachment points for a %s in an RNA preset without explicit connections',
    (monomerClass, id, attachmentPoints) => {
      const values = getEditAllInstancesInitialValues(
        createMonomer({
          id,
          MonomerClass: monomerClass,
          MonomerCode: id,
          MonomerName: id,
          MonomerNaturalAnalogCode: id,
          Name: id,
        }),
        {
          root: {
            templates: [{ $ref: 'monomerGroupTemplate-A' }],
          },
          'monomerGroupTemplate-A': {
            type: 'monomerGroupTemplate',
            class: KetMonomerClass.RNA,
            templates: [
              { $ref: 'monomerTemplate-Base' },
              { $ref: 'monomerTemplate-Sugar' },
              { $ref: 'monomerTemplate-Phosphate' },
            ],
          },
          'monomerTemplate-Base': {
            class: KetMonomerClass.Base,
          },
          'monomerTemplate-Sugar': {
            class: KetMonomerClass.Sugar,
          },
          'monomerTemplate-Phosphate': {
            class: KetMonomerClass.Phosphate,
          },
        },
      );

      expect(values.presetRequirements).toEqual({
        type: monomerClass,
        attachmentPoints,
      });
    },
  );

  it('does not require sugar attachment points for default preset connections to absent components', () => {
    const values = getEditAllInstancesInitialValues(
      createMonomer({
        id: 'Sugar',
        MonomerClass: KetMonomerClass.Sugar,
        MonomerCode: 'Sugar',
        MonomerName: 'Sugar',
        MonomerNaturalAnalogCode: 'Sugar',
        Name: 'Sugar',
      }),
      {
        root: {
          templates: [{ $ref: 'monomerGroupTemplate-A' }],
        },
        'monomerGroupTemplate-A': {
          type: 'monomerGroupTemplate',
          class: KetMonomerClass.RNA,
          templates: [
            { $ref: 'monomerTemplate-Base' },
            { $ref: 'monomerTemplate-Sugar' },
          ],
        },
        'monomerTemplate-Base': {
          class: KetMonomerClass.Base,
        },
        'monomerTemplate-Sugar': {
          class: KetMonomerClass.Sugar,
        },
      },
    );

    expect(values.presetRequirements).toEqual({
      type: KetMonomerClass.Sugar,
      attachmentPoints: ['R3'],
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

describe('ensureMonomersLibraryLoadedForSubmit', () => {
  // Regression/guard test for #10326: submit-time validation reads the
  // default monomers library for symbol/HELM/BILN alias uniqueness and RNA
  // preset code uniqueness, but that library is lazily fetched. This
  // guards the ordering without mounting MonomerCreationWizard itself (see
  // this function's own comment in MonomerCreationWizard.utils.ts).
  it('awaits the default monomers library before reading it', async () => {
    const order: string[] = [];
    let resolveDefaultLoad!: () => void;
    const defaultLoadGate = new Promise<void>((resolve) => {
      resolveDefaultLoad = resolve;
    });

    const fakeEditor = {
      ensureDefaultMonomersLibraryLoaded: jest.fn(async () => {
        await defaultLoadGate;
        order.push('default-library-loaded');
      }),
      get monomersLibraryParsedJson() {
        order.push('monomer-library-read');
        return { root: { templates: [] } };
      },
    } as unknown as Pick<
      CoreEditor,
      'ensureDefaultMonomersLibraryLoaded' | 'monomersLibraryParsedJson'
    >;

    const resultPromise = ensureMonomersLibraryLoadedForSubmit(fakeEditor);

    // Let the call run up to its first await (on
    // ensureDefaultMonomersLibraryLoaded). It must not have read the
    // monomer library yet.
    await Promise.resolve();
    await Promise.resolve();
    expect(order).toEqual([]);

    resolveDefaultLoad();
    const result = await resultPromise;

    expect(order).toEqual(['default-library-loaded', 'monomer-library-read']);
    expect(result).toEqual({ root: { templates: [] } });
  });
});
