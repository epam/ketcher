import {
  exceedsMolfileV2000Limit,
  MOLFILE_V2000_ATOM_BOND_LIMIT,
} from 'application/formatters/constants';
import { FormatterFactory } from 'application/formatters/formatterFactory';
import { MolfileV2000Formatter } from 'application/formatters/molfileV2000Formatter';
import { SupportedFormat } from 'application/formatters/structFormatter.types';
import { Atom, Struct, Vec2 } from 'domain/entities';
import type { StructService } from 'domain/services';

function createStruct(atomCount: number): Struct {
  const struct = new Struct();

  for (let i = 0; i < atomCount; i++) {
    struct.atoms.add(new Atom({ label: 'C', pp: new Vec2(i, 0) }));
  }

  return struct;
}

function createStructServiceMock() {
  const convert = jest.fn().mockResolvedValue({ struct: 'SERVER-OUTPUT' });

  return {
    convert,
    structService: { convert, layout: jest.fn() } as unknown as StructService,
  };
}

describe('exceedsMolfileV2000Limit', () => {
  it('returns false at the V2000 limit boundary', () => {
    const struct = createStruct(MOLFILE_V2000_ATOM_BOND_LIMIT);

    expect(exceedsMolfileV2000Limit(struct)).toBe(false);
  });

  it('returns true when the atom count exceeds the limit', () => {
    const struct = createStruct(MOLFILE_V2000_ATOM_BOND_LIMIT + 1);

    expect(exceedsMolfileV2000Limit(struct)).toBe(true);
  });

  it('returns true when the bond count exceeds the limit', () => {
    const struct = createStruct(2);
    // emulate an oversized bond pool without building 1000 real bonds
    jest
      .spyOn(struct.bonds, 'size', 'get')
      .mockReturnValue(MOLFILE_V2000_ATOM_BOND_LIMIT + 1);

    expect(exceedsMolfileV2000Limit(struct)).toBe(true);
  });
});

describe('FormatterFactory: MDL Molfile V2000', () => {
  it('creates the JS V2000 formatter for a structure within the limit', () => {
    const { structService } = createStructServiceMock();

    const formatter = new FormatterFactory(structService).create(
      SupportedFormat.mol,
      {},
      false,
      createStruct(MOLFILE_V2000_ATOM_BOND_LIMIT),
    );

    expect(formatter).toBeInstanceOf(MolfileV2000Formatter);
  });

  it('creates a single server formatter in auto mode for an oversized structure', async () => {
    const { convert, structService } = createStructServiceMock();
    const struct = createStruct(MOLFILE_V2000_ATOM_BOND_LIMIT + 1);

    const formatter = new FormatterFactory(structService).create(
      SupportedFormat.mol,
      {},
      false,
      struct,
    );

    expect(formatter).not.toBeInstanceOf(MolfileV2000Formatter);
    await expect(formatter.getStringFromStructureAsync(struct)).resolves.toBe(
      'SERVER-OUTPUT',
    );
    // 'auto' makes Indigo upgrade the oversized structure to V3000
    expect(convert.mock.calls[0][1]).toMatchObject({
      'molfile-saving-mode': 'auto',
    });
  });

  it('keeps the plain V2000 server formatter when query properties are used', async () => {
    const { convert, structService } = createStructServiceMock();
    const struct = createStruct(MOLFILE_V2000_ATOM_BOND_LIMIT + 1);

    const formatter = new FormatterFactory(structService).create(
      SupportedFormat.mol,
      {},
      true,
      struct,
    );

    await formatter.getStringFromStructureAsync(struct);

    expect(convert.mock.calls[0][1]).not.toMatchObject({
      'molfile-saving-mode': 'auto',
    });
  });
});
