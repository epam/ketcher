import type { Struct } from 'domain/entities';
import type { KetSerializer } from 'domain/serializers';
import { ChemicalMimeType, type StructService } from 'domain/services';
import { ServerFormatter } from 'application/formatters/serverFormatter';
import { SupportedFormat } from 'application/formatters/structFormatter.types';

describe('ServerFormatter', () => {
  const smiles = 'CCO';

  function createFormatter(preferCoordlessSmilesConversion = false) {
    const parsedStruct = {
      rescale: jest.fn(),
    } as unknown as Struct;
    const ketSerializer = {
      deserialize: jest.fn().mockReturnValue(parsedStruct),
    } as unknown as KetSerializer;
    const structService = {
      convert: jest.fn().mockResolvedValue({ struct: 'ket' }),
      layout: jest.fn().mockResolvedValue({ struct: 'ket' }),
    } as unknown as StructService;

    return {
      parsedStruct,
      structService,
      formatter: new ServerFormatter(
        structService,
        ketSerializer,
        SupportedFormat.smiles,
        undefined,
        { preferCoordlessSmilesConversion },
      ),
    };
  }

  it('uses layout for coordless smiles by default', async () => {
    const { formatter, parsedStruct, structService } = createFormatter();

    const result = await formatter.getStructureFromStringAsync(smiles);

    expect(result).toBe(parsedStruct);
    expect(structService.layout).toHaveBeenCalledWith(
      {
        struct: smiles,
        output_format: ChemicalMimeType.KET,
      },
      undefined,
    );
    expect(structService.convert).not.toHaveBeenCalled();
    expect(parsedStruct.rescale).toHaveBeenCalledTimes(1);
  });

  it('uses convert for coordless smiles when fast fragment import is enabled', async () => {
    const { formatter, parsedStruct, structService } = createFormatter(true);

    const result = await formatter.getStructureFromStringAsync(smiles);

    expect(result).toBe(parsedStruct);
    expect(structService.convert).toHaveBeenCalledWith(
      {
        struct: smiles,
        output_format: ChemicalMimeType.KET,
      },
      undefined,
    );
    expect(structService.layout).not.toHaveBeenCalled();
    expect(parsedStruct.rescale).not.toHaveBeenCalled();
  });
});
