import { FormatterFactory } from 'application/formatters/formatterFactory';
import { MOLFILE_V2000_ATOM_BOND_LIMIT } from 'application/formatters/constants';
import { SupportedFormat } from 'application/formatters/structFormatter.types';
import { getStructure } from 'application/getStructure';
import { ketcherProvider } from 'application/ketcherProvider';
import { Atom, Struct, Vec2 } from 'domain/entities';
import type { StructService } from 'domain/services';

function createStruct(atomCount: number): Struct {
  const struct = new Struct();

  for (let i = 0; i < atomCount; i++) {
    struct.atoms.add(new Atom({ label: 'C', pp: new Vec2(i, 0) }));
  }

  return struct;
}

describe('getStructure: MDL Molfile V2000 size handling', () => {
  beforeEach(() => {
    jest
      .spyOn(ketcherProvider, 'getKetcher')
      .mockReturnValue({ editor: { serverSettings: {} } } as never);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  /*
   * Guards the wiring: getStructure must hand the structure to the factory,
   * otherwise oversized structures silently fall back to the JS V2000
   * serializer again (https://github.com/epam/ketcher/issues/6142).
   */
  it('saves an oversized structure through the server in auto mode', async () => {
    const convert = jest.fn().mockResolvedValue({ struct: 'SERVER-OUTPUT' });
    const factory = new FormatterFactory({
      convert,
      layout: jest.fn(),
    } as unknown as StructService);

    const result = await getStructure(
      'ketcher-id',
      factory,
      createStruct(MOLFILE_V2000_ATOM_BOND_LIMIT + 1),
      SupportedFormat.mol,
    );

    expect(result).toBe('SERVER-OUTPUT');
    expect(convert.mock.calls[0][1]).toMatchObject({
      'molfile-saving-mode': 'auto',
    });
  });

  it('keeps using the JS serializer for a structure within the limit', async () => {
    const convert = jest.fn().mockResolvedValue({ struct: 'SERVER-OUTPUT' });
    const factory = new FormatterFactory({
      convert,
      layout: jest.fn(),
    } as unknown as StructService);

    const result = await getStructure(
      'ketcher-id',
      factory,
      createStruct(2),
      SupportedFormat.mol,
    );

    expect(convert).not.toHaveBeenCalled();
    expect(result).toContain('V2000');
  });
});
