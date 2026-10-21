import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import { Struct } from 'domain/entities/struct';
import type { BaseMonomer } from 'domain/entities/BaseMonomer';
import type { KetSerializer } from 'domain/serializers/ket/ketSerializer';
import type { StructService } from 'domain/services';
import { ServerFormatter } from '../serverFormatter';
import { SupportedFormat } from '../structFormatter.types';

describe('ServerFormatter Mol V3000 monomer library context', () => {
  const convert = jest.fn().mockResolvedValue({ struct: 'molfile' });
  const serialize = jest.fn().mockReturnValue('serialized KET');
  const structService = { convert } as unknown as StructService;
  const ketSerializer = { serialize } as unknown as KetSerializer;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('skips library transfer for Mol V3000 when the exported canvas has no monomers', async () => {
    const formatter = new ServerFormatter(
      structService,
      ketSerializer,
      SupportedFormat.molV3000,
    );

    await formatter.getStringFromStructureAsync(
      new Struct(),
      new DrawingEntitiesManager(),
    );

    expect(convert).toHaveBeenCalledWith(
      expect.objectContaining({ struct: 'serialized KET' }),
      expect.objectContaining({ 'molfile-saving-mode': '3000' }),
      { skipMonomerLibraryTransfer: true },
    );
  });

  it('keeps the default library transfer for conversions without export context', async () => {
    const formatter = new ServerFormatter(
      structService,
      ketSerializer,
      SupportedFormat.helm,
    );

    await formatter.getStringFromStructureAsync(
      new Struct(),
      new DrawingEntitiesManager(),
    );

    expect(convert).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      undefined,
    );
  });

  it('keeps library transfer enabled for Mol V3000 exports containing monomers', async () => {
    const drawingEntitiesManager = new DrawingEntitiesManager();
    drawingEntitiesManager.monomers.set(1, {
      monomerItem: { props: { isMicromoleculeFragment: false } },
    } as unknown as BaseMonomer);
    const formatter = new ServerFormatter(
      structService,
      ketSerializer,
      SupportedFormat.molV3000,
    );

    await formatter.getStringFromStructureAsync(
      new Struct(),
      drawingEntitiesManager,
    );

    expect(convert).toHaveBeenCalledWith(expect.anything(), expect.anything(), {
      skipMonomerLibraryTransfer: false,
    });
  });
});
