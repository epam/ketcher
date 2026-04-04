import { FormatterFactory } from 'application/formatters/formatterFactory';
import { SupportedFormat } from 'application/formatters/structFormatter.types';
import { KetFormatter } from 'application/formatters/ketFormatter';
import { MolfileV2000Formatter } from 'application/formatters/molfileV2000Formatter';
import { ServerFormatter } from 'application/formatters/serverFormatter';
import { StructService } from 'domain/services';

describe('FormatterFactory', () => {
  const createFactory = () => new FormatterFactory({} as StructService);

  it('creates local formatters only for ket and plain molfile v2000', () => {
    const factory = createFactory();

    expect(factory.create(SupportedFormat.ket)).toBeInstanceOf(KetFormatter);
    expect(factory.create(SupportedFormat.mol)).toBeInstanceOf(
      MolfileV2000Formatter,
    );
    expect(factory.create(SupportedFormat.mol, undefined, true)).toBeInstanceOf(
      ServerFormatter,
    );
  });

  it('creates Indigo-backed formatters for unsupported local serializers', () => {
    const factory = createFactory();

    expect(factory.create(SupportedFormat.molV3000)).toBeInstanceOf(
      ServerFormatter,
    );
    expect(factory.create(SupportedFormat.sdf)).toBeInstanceOf(ServerFormatter);
    expect(factory.create(SupportedFormat.sdfV3000)).toBeInstanceOf(
      ServerFormatter,
    );
    expect(factory.create(SupportedFormat.smiles)).toBeInstanceOf(
      ServerFormatter,
    );
    expect(factory.create(SupportedFormat.smilesExt)).toBeInstanceOf(
      ServerFormatter,
    );
  });
});
