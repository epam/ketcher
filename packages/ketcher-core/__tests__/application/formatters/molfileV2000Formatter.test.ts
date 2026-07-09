import { MolfileV2000Formatter } from 'application/formatters/molfileV2000Formatter';
import {
  exceedsMolfileV2000Limit,
  MOLFILE_V2000_ATOM_BOND_LIMIT,
} from 'application/formatters/constants';
import type { StructFormatter } from 'application/formatters/structFormatter.types';
import type { MolSerializer } from 'domain/serializers/mol/molSerializer';
import type { Struct } from 'domain/entities/struct';

const createStructStub = (atoms: number, bonds: number): Struct =>
  ({
    atoms: { size: atoms },
    bonds: { size: bonds },
  } as Struct);

describe('exceedsMolfileV2000Limit', () => {
  it('returns false at the V2000 limit boundary', () => {
    expect(
      exceedsMolfileV2000Limit(
        createStructStub(
          MOLFILE_V2000_ATOM_BOND_LIMIT,
          MOLFILE_V2000_ATOM_BOND_LIMIT,
        ),
      ),
    ).toBe(false);
  });

  it('returns true when atom count exceeds the limit', () => {
    expect(
      exceedsMolfileV2000Limit(
        createStructStub(MOLFILE_V2000_ATOM_BOND_LIMIT + 1, 0),
      ),
    ).toBe(true);
  });

  it('returns true when bond count exceeds the limit', () => {
    expect(
      exceedsMolfileV2000Limit(
        createStructStub(0, MOLFILE_V2000_ATOM_BOND_LIMIT + 1),
      ),
    ).toBe(true);
  });
});

describe('MolfileV2000Formatter', () => {
  const serialize = jest.fn().mockReturnValue('V2000-OUT');
  const molSerializer = { serialize } as unknown as MolSerializer;

  const getStringFromStructureAsync = jest.fn().mockResolvedValue('V3000-OUT');
  const getStructureFromStringAsync = jest.fn();
  const fallbackFormatter = {
    getStringFromStructureAsync,
    getStructureFromStringAsync,
  } as unknown as StructFormatter;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses the JS serializer within the V2000 limit', async () => {
    const formatter = new MolfileV2000Formatter(
      molSerializer,
      fallbackFormatter,
    );
    const struct = createStructStub(999, 999);

    await expect(formatter.getStringFromStructureAsync(struct)).resolves.toBe(
      'V2000-OUT',
    );
    expect(serialize).toHaveBeenCalledWith(struct);
    expect(getStringFromStructureAsync).not.toHaveBeenCalled();
  });

  it('delegates to the fallback formatter when atom count exceeds the limit', async () => {
    const formatter = new MolfileV2000Formatter(
      molSerializer,
      fallbackFormatter,
    );
    const struct = createStructStub(1000, 0);

    await expect(formatter.getStringFromStructureAsync(struct)).resolves.toBe(
      'V3000-OUT',
    );
    expect(getStringFromStructureAsync).toHaveBeenCalledWith(
      struct,
      undefined,
      undefined,
    );
    expect(serialize).not.toHaveBeenCalled();
  });

  it('delegates to the fallback formatter when bond count exceeds the limit', async () => {
    const formatter = new MolfileV2000Formatter(
      molSerializer,
      fallbackFormatter,
    );
    const struct = createStructStub(0, 1000);

    await expect(formatter.getStringFromStructureAsync(struct)).resolves.toBe(
      'V3000-OUT',
    );
    expect(getStringFromStructureAsync).toHaveBeenCalledWith(
      struct,
      undefined,
      undefined,
    );
    expect(serialize).not.toHaveBeenCalled();
  });

  it('falls back to the JS serializer when no fallback formatter is provided', async () => {
    const formatter = new MolfileV2000Formatter(molSerializer);
    const struct = createStructStub(1000, 0);

    await expect(formatter.getStringFromStructureAsync(struct)).resolves.toBe(
      'V2000-OUT',
    );
    expect(serialize).toHaveBeenCalledWith(struct);
  });

  it('forwards drawingEntitiesManager and selection to the fallback formatter', async () => {
    const formatter = new MolfileV2000Formatter(
      molSerializer,
      fallbackFormatter,
    );
    const struct = createStructStub(1000, 0);
    const drawingEntitiesManager = { id: 'dem' };
    const selection = { atoms: [1] };

    await formatter.getStringFromStructureAsync(
      struct,
      drawingEntitiesManager as never,
      selection as never,
    );

    expect(getStringFromStructureAsync).toHaveBeenCalledWith(
      struct,
      drawingEntitiesManager,
      selection,
    );
  });
});
