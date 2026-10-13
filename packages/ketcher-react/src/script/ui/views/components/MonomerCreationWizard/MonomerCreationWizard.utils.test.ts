import { type BaseMonomer, KetMonomerClass, Vec2 } from 'ketcher-core';
import {
  getEditAllInstancesInitialValues,
  getEditInstanceInitialValues,
  getLibraryEditInitialValues,
  getLeavingAtomPositionTowardsNeighbor,
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
      aliasBILN: '',
      editMode: 'instance',
      originalType: KetMonomerClass.Phosphate,
      originalSymbol: 'sP',
    });
  });
});

describe('library editing initial values', () => {
  const item = createMonomer({
    id: 'original',
    Name: 'Cysteine',
    MonomerClass: KetMonomerClass.AminoAcid,
    MonomerCode: 'C',
    MonomerName: 'C',
    MonomerFullName: 'Cysteine',
    MonomerNaturalAnalogCode: 'C',
    aliasHELM: 'C',
    aliasBILN: 'C',
    modificationTypes: ['Natural amino acid'],
    aliasAxoLabs: 'custom-axo',
    idtAliases: { base: 'custom-idt' },
  }).monomerItem;

  it('preserves original properties and identity instead of creating a copy', () => {
    const values = getLibraryEditInitialValues(item);

    expect(values).toMatchObject({
      symbol: 'C',
      name: 'Cysteine',
      aliasHELM: 'C',
      aliasBILN: 'C',
      modificationTypes: ['Natural amino acid'],
      libraryOnly: true,
    });
    expect(values.originalMonomerItem).toBe(item);
    expect(values.modificationTypes).not.toBe(item.props.modificationTypes);
  });

  it('duplicates library items with suffixed fields, no original identity or modification types', () => {
    const values = getEditInstanceInitialValues(item);

    expect(values).toMatchObject({
      symbol: 'C_Copy',
      name: 'Cysteine_Copy',
      aliasHELM: 'C_Copy',
      aliasBILN: 'C_Copy',
    });
    expect(values).not.toHaveProperty('originalMonomerItem');
    expect(values).not.toHaveProperty('modificationTypes');
    expect(values).not.toHaveProperty('aliasAxoLabs');
    expect(values).not.toHaveProperty('idtAliases');
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

describe('getLeavingAtomPositionTowardsNeighbor', () => {
  it('places the leaving atom one bond length from the attachment atom, towards the neighbor', () => {
    const position = getLeavingAtomPositionTowardsNeighbor(
      new Vec2(31.19, 5.58),
      new Vec2(28.08, 5.58),
    );

    expect(position?.x).toBeCloseTo(30.19);
    expect(position?.y).toBeCloseTo(5.58);
  });

  it('keeps the direction of a diagonal bond', () => {
    const position = getLeavingAtomPositionTowardsNeighbor(
      new Vec2(0, 0),
      new Vec2(3, 4),
    );

    expect(position?.x).toBeCloseTo(0.6);
    expect(position?.y).toBeCloseTo(0.8);
  });

  it.each([0.5, 1, 1.5, 2])(
    'stops at the midpoint of a bond of length %d',
    (bondLength) => {
      const position = getLeavingAtomPositionTowardsNeighbor(
        new Vec2(0, 0),
        new Vec2(bondLength, 0),
      );

      expect(position?.x).toBeCloseTo(bondLength / 2);
      expect(position?.y).toBeCloseTo(0);
    },
  );

  it('keeps the leaving atoms of both ends of a standard bond off the neighbor atoms', () => {
    const sugarAtom = new Vec2(0, 0);
    const baseAtom = new Vec2(1, 0);

    const sugarLeavingAtom = getLeavingAtomPositionTowardsNeighbor(
      sugarAtom,
      baseAtom,
    );
    const baseLeavingAtom = getLeavingAtomPositionTowardsNeighbor(
      baseAtom,
      sugarAtom,
    );

    expect(sugarLeavingAtom?.x).toBeLessThanOrEqual(0.5);
    expect(baseLeavingAtom?.x).toBeGreaterThanOrEqual(0.5);
  });

  it('returns undefined when a position is missing or both atoms coincide', () => {
    expect(
      getLeavingAtomPositionTowardsNeighbor(undefined, new Vec2(1, 1)),
    ).toBeUndefined();
    expect(
      getLeavingAtomPositionTowardsNeighbor(new Vec2(1, 1), undefined),
    ).toBeUndefined();
    expect(
      getLeavingAtomPositionTowardsNeighbor(new Vec2(1, 1), new Vec2(1, 1)),
    ).toBeUndefined();
  });
});
