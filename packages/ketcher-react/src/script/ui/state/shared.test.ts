import * as ketcherCore from 'ketcher-core';
import type { CoreEditor } from 'ketcher-core';
import {
  getFastaSequenceInputFormat,
  isLongSequenceFasta,
  load,
} from './shared';

describe('isLongSequenceFasta', () => {
  it('does not classify 1000 nucleotides at the threshold as long', () => {
    expect(isLongSequenceFasta(`>sequence\n${'A'.repeat(1000)}`)).toBe(false);
  });

  it('classifies 1001 nucleotides as long', () => {
    expect(isLongSequenceFasta(`>sequence\n${'A'.repeat(1001)}`)).toBe(true);
  });

  it('counts multiple nucleotide FASTA records together', () => {
    expect(
      isLongSequenceFasta(
        `>strand1\n${'A'.repeat(500)}\n>strand2\n${'C'.repeat(500)}`,
      ),
    ).toBe(false);
    expect(
      isLongSequenceFasta(
        `>strand1\n${'A'.repeat(501)}\n>strand2\n${'C'.repeat(501)}`,
      ),
    ).toBe(true);
  });

  it('counts protein FASTA residues as one monomer each', () => {
    expect(isLongSequenceFasta(`>protein\n${'E'.repeat(3000)}`)).toBe(false);
    expect(isLongSequenceFasta(`>protein\n${'E'.repeat(3001)}`)).toBe(true);
  });

  it('does not count the FASTA header as sequence content', () => {
    expect(isLongSequenceFasta(`>sequence ${'A'.repeat(4000)}\nACGT`)).toBe(
      false,
    );
  });

  it('does not classify a non-FASTA string as a long sequence', () => {
    expect(isLongSequenceFasta('C'.repeat(3001))).toBe(false);
  });
});

describe('getFastaSequenceInputFormat', () => {
  it('uses the DNA FASTA format for nucleotide sequences containing thymine', () => {
    expect(getFastaSequenceInputFormat('>dna\nACGT')).toBe(
      'chemical/x-dna-fasta',
    );
  });

  it('defaults ambiguous nucleotide FASTA to DNA', () => {
    expect(getFastaSequenceInputFormat(`>dna\n${'A'.repeat(1001)}`)).toBe(
      'chemical/x-dna-fasta',
    );
  });

  it('uses the RNA FASTA format for uracil sequences without thymine', () => {
    expect(getFastaSequenceInputFormat('>rna\nACGU')).toBe(
      'chemical/x-rna-fasta',
    );
  });

  it('uses the peptide FASTA format for protein sequences', () => {
    expect(getFastaSequenceInputFormat('>protein\nEFILPQ')).toBe(
      'chemical/x-peptide-fasta',
    );
  });
});

describe('loading a long FASTA sequence', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('preserves the current canvas when FASTA conversion fails', async () => {
    const macromoleculesEditor = {
      isMacromoleculesMode: true,
      isLongSequence: false,
      zoomToStructuresIfNeeded: jest.fn(),
    };
    const deleteCanvas = jest
      .spyOn(ketcherCore, 'deleteAllEntitiesOnCanvas')
      .mockImplementation();
    const parseAndAdd = jest
      .spyOn(ketcherCore, 'parseAndAddMacromoleculesOnCanvas')
      .mockRejectedValue(new Error('FASTA conversion failed'));
    jest
      .spyOn(ketcherCore.ketcherProvider, 'getCoreEditor')
      .mockReturnValue(macromoleculesEditor as unknown as CoreEditor);

    const dispatch = jest.fn();
    const getState = () => ({
      editor: { ketcherId: 'test-editor', errorHandler: jest.fn() },
      server: {},
      options: { getServerSettings: () => ({}) },
    });

    await load(`>sequence\n${'A'.repeat(1001)}`)(dispatch, getState);

    expect(deleteCanvas).not.toHaveBeenCalled();
    expect(parseAndAdd).toHaveBeenCalledWith(
      `>sequence\n${'A'.repeat(1001)}`,
      {},
      false,
      'chemical/x-dna-fasta',
      true,
      macromoleculesEditor,
    );
    expect(dispatch).toHaveBeenCalled();
  });

  it('loads long FASTA when Macromolecules mode is already active', async () => {
    const macromoleculesEditor: {
      isMacromoleculesMode?: boolean;
      isLongSequence: boolean;
      zoomToStructuresIfNeeded: jest.Mock;
      modeEvents: {
        switchToMacromoleculesMode: { dispatch: jest.Mock };
      };
    } = {
      isLongSequence: false,
      zoomToStructuresIfNeeded: jest.fn(),
      modeEvents: {
        switchToMacromoleculesMode: { dispatch: jest.fn() },
      },
    };
    const parseAndAdd = jest
      .spyOn(ketcherCore, 'parseAndAddMacromoleculesOnCanvas')
      .mockResolvedValue();
    macromoleculesEditor.isMacromoleculesMode = true;
    jest.spyOn(ketcherCore, 'provideEditorInstance').mockImplementation(() => {
      throw new Error('The active editor singleton must not be used');
    });
    jest
      .spyOn(ketcherCore.ketcherProvider, 'getCoreEditor')
      .mockReturnValue(macromoleculesEditor as unknown as CoreEditor);

    const dispatch = jest.fn();
    const getState = () => ({
      editor: { ketcherId: 'test-editor', errorHandler: jest.fn() },
      server: {},
      options: { getServerSettings: () => ({}) },
    });

    await load(`>sequence\n${'A'.repeat(1001)}`)(dispatch, getState);

    expect(
      macromoleculesEditor.modeEvents.switchToMacromoleculesMode.dispatch,
    ).not.toHaveBeenCalled();
    expect(parseAndAdd).toHaveBeenCalledWith(
      `>sequence\n${'A'.repeat(1001)}`,
      {},
      false,
      'chemical/x-dna-fasta',
      true,
      macromoleculesEditor,
    );
    expect(ketcherCore.provideEditorInstance).not.toHaveBeenCalled();
  });

  it('switches the editor registered for the loading Ketcher id', async () => {
    const listeners = new Set<() => void>();
    const switchToMacromoleculesMode = jest.fn(() => {
      listeners.forEach((listener) => listener());
    });
    const macromoleculesEditor = {
      isMacromoleculesMode: false,
      isLongSequence: false,
      zoomToStructuresIfNeeded: jest.fn(),
      modeEvents: {
        switchToMacromoleculesMode: { dispatch: switchToMacromoleculesMode },
        macromoleculesModeActivated: {
          add: (listener: () => void) => listeners.add(listener),
          remove: (listener: () => void) => listeners.delete(listener),
        },
      },
    };
    const parseAndAdd = jest
      .spyOn(ketcherCore, 'parseAndAddMacromoleculesOnCanvas')
      .mockResolvedValue();
    jest
      .spyOn(ketcherCore.ketcherProvider, 'getCoreEditor')
      .mockReturnValue(macromoleculesEditor as unknown as CoreEditor);

    const dispatch = jest.fn();
    const getState = () => ({
      editor: { ketcherId: 'target-editor', errorHandler: jest.fn() },
      server: {},
      options: { getServerSettings: () => ({}) },
    });

    await load(`>sequence\n${'A'.repeat(1001)}`)(dispatch, getState);

    expect(switchToMacromoleculesMode).toHaveBeenCalledTimes(1);
    expect(parseAndAdd).toHaveBeenCalledWith(
      `>sequence\n${'A'.repeat(1001)}`,
      {},
      false,
      'chemical/x-dna-fasta',
      true,
      macromoleculesEditor,
    );
  });

  it('does not continue loading when another editor activates Macromolecules mode', async () => {
    const createModeActivatedEvent = () => {
      const listeners = new Set<() => void>();
      return {
        add: (listener: () => void) => listeners.add(listener),
        remove: (listener: () => void) => listeners.delete(listener),
        dispatch: () => listeners.forEach((listener) => listener()),
      };
    };
    const foreignModeActivated = createModeActivatedEvent();
    const targetModeActivated = createModeActivatedEvent();
    const foreignEditor = {
      modeEvents: { macromoleculesModeActivated: foreignModeActivated },
    };
    const macromoleculesEditor = {
      isMacromoleculesMode: false,
      isLongSequence: false,
      zoomToStructuresIfNeeded: jest.fn(),
      modeEvents: {
        switchToMacromoleculesMode: {
          dispatch: () =>
            foreignEditor.modeEvents.macromoleculesModeActivated.dispatch(),
        },
        macromoleculesModeActivated: targetModeActivated,
      },
    };
    const parseAndAdd = jest
      .spyOn(ketcherCore, 'parseAndAddMacromoleculesOnCanvas')
      .mockResolvedValue();
    jest
      .spyOn(ketcherCore.ketcherProvider, 'getCoreEditor')
      .mockReturnValue(macromoleculesEditor as unknown as CoreEditor);

    const dispatch = jest.fn();
    const getState = () => ({
      editor: { ketcherId: 'target-editor', errorHandler: jest.fn() },
      server: {},
      options: { getServerSettings: () => ({}) },
    });

    const loading = load(`>sequence\n${'A'.repeat(1001)}`)(dispatch, getState);
    await Promise.resolve();

    expect(parseAndAdd).not.toHaveBeenCalled();

    targetModeActivated.dispatch();
    await loading;

    expect(parseAndAdd).toHaveBeenCalledTimes(1);
  });
});
