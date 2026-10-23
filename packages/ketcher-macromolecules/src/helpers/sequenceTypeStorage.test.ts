import { KetcherLogger, SequenceType } from 'ketcher-core';
import { SEQUENCE_TYPE_STORAGE_KEY } from 'src/constants';
import {
  getPersistedSequenceType,
  persistSequenceType,
} from './sequenceTypeStorage';

describe('sequenceTypeStorage', () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it('defaults to RNA when nothing is persisted', () => {
    expect(getPersistedSequenceType()).toBe(SequenceType.RNA);
  });

  it('persists and restores the selected polymer type', () => {
    persistSequenceType(SequenceType.PEPTIDE);
    expect(getPersistedSequenceType()).toBe(SequenceType.PEPTIDE);

    persistSequenceType(SequenceType.DNA);
    expect(getPersistedSequenceType()).toBe(SequenceType.DNA);
  });

  it('falls back to RNA when the stored value is invalid', () => {
    window.localStorage.setItem(
      SEQUENCE_TYPE_STORAGE_KEY,
      JSON.stringify('NOT_A_TYPE'),
    );
    expect(getPersistedSequenceType()).toBe(SequenceType.RNA);
  });

  it('falls back to RNA when the stored value is malformed JSON', () => {
    const loggerSpy = jest
      .spyOn(KetcherLogger, 'error')
      .mockImplementation(() => undefined);
    // Raw, non-JSON string (bypassing JSON.stringify) simulates a corrupted or
    // manually-edited value that makes JSON.parse throw inside getItem.
    window.localStorage.setItem(SEQUENCE_TYPE_STORAGE_KEY, 'not-json{');

    expect(getPersistedSequenceType()).toBe(SequenceType.RNA);
    expect(loggerSpy).toHaveBeenCalled();

    loggerSpy.mockRestore();
  });
});
