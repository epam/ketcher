import { ServerFormatter } from 'application/formatters/serverFormatter';
import { SupportedFormat } from 'application/formatters/structFormatter.types';
import { ketcherProvider } from 'application/ketcherProvider';
import { Atom, Struct } from 'domain/entities';
import type { StructService } from 'domain/services';
import type { KetSerializer } from 'domain/serializers/ket/ketSerializer';
import { pickStandardServerOptions } from 'infrastructure/services/struct/remoteStructService';

describe('pickStandardServerOptions', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each(['daylight', 'chemaxon'])(
    'passes the %s SMILES saving format to Indigo services',
    (smilesSavingFormat) => {
      jest.spyOn(ketcherProvider, 'getKetcher').mockReturnValue({
        editor: { options: () => ({ ignoreChiralFlag: false }) },
      } as never);

      expect(
        pickStandardServerOptions('ketcher-id', {
          'smiles-saving-format': smilesSavingFormat,
        }),
      ).toMatchObject({ 'smiles-saving-format': smilesSavingFormat });
    },
  );
});

describe('ServerFormatter', () => {
  const createFormatter = (format: SupportedFormat) => {
    const convert = jest.fn().mockResolvedValue({ struct: 'C1=CC=CC=C1' });
    const structService = {
      convert,
      layout: jest.fn(),
    } as unknown as StructService;
    const ketSerializer = {
      serialize: jest.fn().mockReturnValue('{}'),
    } as unknown as KetSerializer;
    const formatter = new ServerFormatter(structService, ketSerializer, format);

    return { convert, formatter };
  };

  it('requests Daylight output when saving SMILES with an R-group label', async () => {
    const { convert, formatter } = createFormatter(SupportedFormat.smiles);
    const struct = new Struct();
    struct.atoms.add(new Atom({ label: 'R#', rglabel: 1 }));

    await formatter.getStringFromStructureAsync(struct);

    expect(convert).toHaveBeenCalledWith(
      expect.objectContaining({ output_format: 'chemical/x-daylight-smiles' }),
      expect.objectContaining({ 'smiles-saving-format': 'daylight' }),
    );
  });

  it('requests Daylight output for structures without R-group labels', async () => {
    const { convert, formatter } = createFormatter(SupportedFormat.smiles);
    const struct = new Struct();
    struct.atoms.add(new Atom({ label: 'C' }));

    await formatter.getStringFromStructureAsync(struct);

    expect(convert).toHaveBeenCalledWith(
      expect.objectContaining({ output_format: 'chemical/x-daylight-smiles' }),
      expect.objectContaining({ 'smiles-saving-format': 'daylight' }),
    );
  });

  it('requests Chemaxon output when saving extended SMILES', async () => {
    const { convert, formatter } = createFormatter(SupportedFormat.smilesExt);
    const struct = new Struct();
    struct.atoms.add(new Atom({ label: 'R#', rglabel: 1 }));

    await formatter.getStringFromStructureAsync(struct);

    expect(convert).toHaveBeenCalledWith(
      expect.objectContaining({
        output_format: 'chemical/x-chemaxon-cxsmiles',
      }),
      expect.objectContaining({ 'smiles-saving-format': 'chemaxon' }),
    );
  });

  it('uses convert (not layout) for IDT input', () => {
    const convert = jest.fn();
    const layout = jest.fn();
    const structService = { convert, layout } as unknown as StructService;
    const formatter = new ServerFormatter(
      structService,
      {} as unknown as KetSerializer,
      SupportedFormat.idt,
    );

    const result = formatter.getCallingMethod('A*C*G*T', SupportedFormat.idt);

    expect(result.method).toBe(convert);
    expect(result.struct).toBe('A*C*G*T');
  });

  it.each([
    ['trailing CRLF', 'P\r\n\r\n'],
    ['trailing LF', 'P\n\n\n'],
    ['trailing CR', 'P\r\r\r'],
    ['leading newlines', '\n\nP'],
  ])('trims %s from SMILES input', (_caseName, stringifiedStruct) => {
    const convert = jest.fn();
    const layout = jest.fn();
    const structService = { convert, layout } as unknown as StructService;
    const formatter = new ServerFormatter(
      structService,
      {} as unknown as KetSerializer,
      SupportedFormat.smiles,
    );

    const result = formatter.getCallingMethod(
      stringifiedStruct,
      SupportedFormat.smiles,
    );

    // Indigo re-detects the format from the content and reads a multi-line
    // string as a molfile/rxnfile, failing with "RXN loader: bad header P"
    expect(result.method).toBe(layout);
    expect(result.struct).toBe('P');
  });

  it('keeps using convert for extended SMILES with coordinates', () => {
    const convert = jest.fn();
    const layout = jest.fn();
    const structService = { convert, layout } as unknown as StructService;
    const formatter = new ServerFormatter(
      structService,
      {} as unknown as KetSerializer,
      SupportedFormat.smiles,
    );

    const result = formatter.getCallingMethod(
      'CC |(0.0,0.0,0.0;1.0,0.0,0.0)|\n\n',
      SupportedFormat.smiles,
    );

    expect(result.method).toBe(convert);
    expect(result.struct).toBe('CC |(0.0,0.0,0.0;1.0,0.0,0.0)|');
  });
});
