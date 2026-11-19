import { parseStruct } from 'application/utils';
import { isMolfileWithQueryFeatures } from 'application/formatters/constants';
import { MolfileV2000Formatter } from 'application/formatters/molfileV2000Formatter';
import { ServerFormatter } from 'application/formatters/serverFormatter';
import { SupportedFormat } from 'application/formatters/structFormatter.types';
import type { Ketcher } from 'application/ketcher';
import { Struct } from 'domain/entities';
import type { StructService } from 'domain/services';

// The molfile from #9905: an aromatic query on atom 2
const queryMolfile =
  '\n  -INDIGO-04292612402D\n\n  2  1  0  0  0  0  0  0  0  0999 V2000\n' +
  '    4.5369   -4.2375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n' +
  '    5.4029   -3.7375    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n' +
  '  1  2  1  0  0  0  0\nM  MRV SMA   2 [#6;a]\nM  END\n';
const plainMolfile = queryMolfile.replace('M  MRV SMA   2 [#6;a]\n', '');

const ketcherInstance = {
  editor: { options: () => ({}) },
} as unknown as Ketcher;
const structService = {} as StructService;

describe('isMolfileWithQueryFeatures', () => {
  it('is true for a V2000 molfile with MRV query lines', () => {
    expect(isMolfileWithQueryFeatures(SupportedFormat.mol, queryMolfile)).toBe(
      true,
    );
  });

  it('is false for a V2000 molfile without query lines', () => {
    expect(isMolfileWithQueryFeatures(SupportedFormat.mol, plainMolfile)).toBe(
      false,
    );
  });

  it('is false for other formats', () => {
    expect(
      isMolfileWithQueryFeatures(SupportedFormat.molV3000, queryMolfile),
    ).toBe(false);
  });
});

describe('parseStruct (#9905)', () => {
  let serverParse: jest.SpyInstance;
  let jsParse: jest.SpyInstance;

  beforeEach(() => {
    serverParse = jest
      .spyOn(ServerFormatter.prototype, 'getStructureFromStringAsync')
      .mockResolvedValue(new Struct());
    jsParse = jest
      .spyOn(MolfileV2000Formatter.prototype, 'getStructureFromStringAsync')
      .mockResolvedValue(new Struct());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('loads a molfile with query features through Indigo', async () => {
    await parseStruct(queryMolfile, structService, ketcherInstance);

    expect(serverParse).toHaveBeenCalledWith(queryMolfile);
    expect(jsParse).not.toHaveBeenCalled();
  });

  it('keeps loading a plain V2000 molfile with the JS parser', async () => {
    await parseStruct(plainMolfile, structService, ketcherInstance);

    expect(jsParse).toHaveBeenCalledWith(plainMolfile);
    expect(serverParse).not.toHaveBeenCalled();
  });
});
