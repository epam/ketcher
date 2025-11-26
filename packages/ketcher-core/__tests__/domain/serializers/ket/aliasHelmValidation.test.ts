import { KetSerializer, MAX_ALIAS_HELM_LENGTH } from 'domain/serializers/ket';
import { KetcherLogger } from 'utilities';
import {
  IKetMacromoleculesContent,
  KetTemplateType,
} from 'application/formatters/types/ket';

jest.mock('utilities', () => ({
  KetcherLogger: {
    error: jest.fn(),
  },
}));

describe('aliasHELM validation', () => {
  const ket = new KetSerializer();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('MAX_ALIAS_HELM_LENGTH should be 22', () => {
    expect(MAX_ALIAS_HELM_LENGTH).toBe(22);
  });

  it('should skip monomer with aliasHELM longer than 22 characters and log error', () => {
    const longAliasHELM = '12345678901234567890123'; // 23 characters
    const monomersLibrary = {
      root: {
        templates: [{ $ref: 'monomerTemplate-test' }],
        nodes: [],
        connections: [],
      },
      'monomerTemplate-test': {
        type: KetTemplateType.MONOMER_TEMPLATE,
        id: 'test-monomer',
        alias: '_CHEM1',
        aliasHELM: longAliasHELM,
        naturalAnalogShort: '',
        atoms: [],
        bonds: [],
        root: { nodes: [] },
      },
    } as unknown as IKetMacromoleculesContent;

    const result = ket.convertMonomersLibrary(monomersLibrary);

    expect(result).toHaveLength(0);
    expect(KetcherLogger.error).toHaveBeenCalledWith(
      expect.stringContaining('aliasHELM'),
    );
    expect(KetcherLogger.error).toHaveBeenCalledWith(
      expect.stringContaining('exceeds the maximum allowed length'),
    );
    expect(KetcherLogger.error).toHaveBeenCalledWith(
      expect.stringContaining('22'),
    );
    expect(KetcherLogger.error).toHaveBeenCalledWith(
      expect.stringContaining('skipped'),
    );
  });

  it('should accept monomer with aliasHELM exactly 22 characters', () => {
    const validAliasHELM = '1234567890123456789012'; // 22 characters
    const monomersLibrary = {
      root: {
        templates: [{ $ref: 'monomerTemplate-test' }],
        nodes: [],
        connections: [],
      },
      'monomerTemplate-test': {
        type: KetTemplateType.MONOMER_TEMPLATE,
        id: 'test-monomer',
        alias: 'Test',
        aliasHELM: validAliasHELM,
        naturalAnalogShort: '',
        atoms: [],
        bonds: [],
        root: { nodes: [] },
      },
    } as unknown as IKetMacromoleculesContent;

    const result = ket.convertMonomersLibrary(monomersLibrary);

    expect(result).toHaveLength(1);
    expect(KetcherLogger.error).not.toHaveBeenCalled();
  });

  it('should accept monomer with aliasHELM shorter than 22 characters', () => {
    const shortAliasHELM = 'Short';
    const monomersLibrary = {
      root: {
        templates: [{ $ref: 'monomerTemplate-test' }],
        nodes: [],
        connections: [],
      },
      'monomerTemplate-test': {
        type: KetTemplateType.MONOMER_TEMPLATE,
        id: 'test-monomer',
        alias: 'Test',
        aliasHELM: shortAliasHELM,
        naturalAnalogShort: '',
        atoms: [],
        bonds: [],
        root: { nodes: [] },
      },
    } as unknown as IKetMacromoleculesContent;

    const result = ket.convertMonomersLibrary(monomersLibrary);

    expect(result).toHaveLength(1);
    expect(KetcherLogger.error).not.toHaveBeenCalled();
  });

  it('should accept monomer without aliasHELM', () => {
    const monomersLibrary = {
      root: {
        templates: [{ $ref: 'monomerTemplate-test' }],
        nodes: [],
        connections: [],
      },
      'monomerTemplate-test': {
        type: KetTemplateType.MONOMER_TEMPLATE,
        id: 'test-monomer',
        alias: 'Test',
        naturalAnalogShort: '',
        atoms: [],
        bonds: [],
        root: { nodes: [] },
      },
    } as unknown as IKetMacromoleculesContent;

    const result = ket.convertMonomersLibrary(monomersLibrary);

    expect(result).toHaveLength(1);
    expect(KetcherLogger.error).not.toHaveBeenCalled();
  });

  it('should skip only invalid monomers and keep valid ones', () => {
    const monomersLibrary = {
      root: {
        templates: [
          { $ref: 'monomerTemplate-valid' },
          { $ref: 'monomerTemplate-invalid' },
          { $ref: 'monomerTemplate-also-valid' },
        ],
        nodes: [],
        connections: [],
      },
      'monomerTemplate-valid': {
        type: KetTemplateType.MONOMER_TEMPLATE,
        id: 'valid-monomer',
        alias: 'Valid',
        aliasHELM: 'ValidHELM',
        naturalAnalogShort: '',
        atoms: [],
        bonds: [],
        root: { nodes: [] },
      },
      'monomerTemplate-invalid': {
        type: KetTemplateType.MONOMER_TEMPLATE,
        id: 'invalid-monomer',
        alias: 'Invalid',
        aliasHELM: '12345678901234567890123', // 23 characters - too long
        naturalAnalogShort: '',
        atoms: [],
        bonds: [],
        root: { nodes: [] },
      },
      'monomerTemplate-also-valid': {
        type: KetTemplateType.MONOMER_TEMPLATE,
        id: 'also-valid-monomer',
        alias: 'AlsoValid',
        naturalAnalogShort: '',
        atoms: [],
        bonds: [],
        root: { nodes: [] },
      },
    } as unknown as IKetMacromoleculesContent;

    const result = ket.convertMonomersLibrary(monomersLibrary);

    expect(result).toHaveLength(2);
    expect(result[0].label).toBe('Valid');
    expect(result[1].label).toBe('AlsoValid');
    expect(KetcherLogger.error).toHaveBeenCalledTimes(1);
  });

  it('error message should contain monomer alias when available', () => {
    const longAliasHELM = '12345678901234567890123'; // 23 characters
    const monomersLibrary = {
      root: {
        templates: [{ $ref: 'monomerTemplate-test' }],
        nodes: [],
        connections: [],
      },
      'monomerTemplate-test': {
        type: KetTemplateType.MONOMER_TEMPLATE,
        id: 'test-id',
        alias: '_CHEM1',
        aliasHELM: longAliasHELM,
        naturalAnalogShort: '',
        atoms: [],
        bonds: [],
        root: { nodes: [] },
      },
    } as unknown as IKetMacromoleculesContent;

    ket.convertMonomersLibrary(monomersLibrary);

    expect(KetcherLogger.error).toHaveBeenCalledWith(
      expect.stringContaining('_CHEM1'),
    );
  });

  it('error message should contain monomer id when alias is empty', () => {
    const longAliasHELM = '12345678901234567890123'; // 23 characters
    const monomersLibrary = {
      root: {
        templates: [{ $ref: 'monomerTemplate-test' }],
        nodes: [],
        connections: [],
      },
      'monomerTemplate-test': {
        type: KetTemplateType.MONOMER_TEMPLATE,
        id: 'my-test-id',
        aliasHELM: longAliasHELM,
        naturalAnalogShort: '',
        atoms: [],
        bonds: [],
        root: { nodes: [] },
      },
    } as unknown as IKetMacromoleculesContent;

    ket.convertMonomersLibrary(monomersLibrary);

    expect(KetcherLogger.error).toHaveBeenCalledWith(
      expect.stringContaining('my-test-id'),
    );
  });
});
