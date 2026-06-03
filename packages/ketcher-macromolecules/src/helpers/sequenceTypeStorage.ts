import { KetcherLogger, SequenceType } from 'ketcher-core';
import { localStorageWrapper } from './localStorage';
import { SEQUENCE_TYPE_STORAGE_KEY } from '../constants';

const isSequenceType = (value: unknown): value is SequenceType =>
  value === SequenceType.RNA ||
  value === SequenceType.DNA ||
  value === SequenceType.PEPTIDE;

// Read the last polymer type chosen on the sequence-type switcher from
// localStorage, falling back to RNA when nothing valid is stored (#9780).
// `localStorageWrapper.getItem` runs `JSON.parse`, which throws on a malformed
// value (manual edit / partial write), so the read is guarded to avoid
// crashing the switcher's mount effect.
export const getPersistedSequenceType = (): SequenceType => {
  let stored: unknown;
  try {
    stored = localStorageWrapper.getItem(SEQUENCE_TYPE_STORAGE_KEY);
  } catch (error) {
    KetcherLogger.error(
      'sequenceTypeStorage.ts::getPersistedSequenceType',
      error,
    );
    return SequenceType.RNA;
  }
  return isSequenceType(stored) ? stored : SequenceType.RNA;
};

export const persistSequenceType = (sequenceType: SequenceType): void => {
  localStorageWrapper.setItem(SEQUENCE_TYPE_STORAGE_KEY, sequenceType);
};
