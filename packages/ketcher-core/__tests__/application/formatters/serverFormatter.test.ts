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
});
