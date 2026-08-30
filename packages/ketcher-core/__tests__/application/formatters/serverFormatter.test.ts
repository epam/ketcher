import { ServerFormatter } from 'application/formatters/serverFormatter';
import { SupportedFormat } from 'application/formatters/structFormatter.types';
import type { StructService } from 'domain/services';
import type { KetSerializer } from 'domain/serializers/ket/ketSerializer';

describe('ServerFormatter', () => {
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
