import { SequenceType } from 'ketcher-core';
import { localStorageWrapper } from './localStorage';
import { SEQUENCE_TYPE_STORAGE_KEY } from '../constants';

const isSequenceType = (value: unknown): value is SequenceType =>
  value === SequenceType.RNA ||
  value === SequenceType.DNA ||
  value === SequenceType.PEPTIDE;

// Read the last polymer type chosen on the sequence-type switcher from the
// browser cache, falling back to RNA when nothing valid is stored (#9780).
export const getPersistedSequenceType = (): SequenceType => {
  const stored: unknown = localStorageWrapper.getItem(
    SEQUENCE_TYPE_STORAGE_KEY,
  );
  return isSequenceType(stored) ? stored : SequenceType.RNA;
};

export const persistSequenceType = (sequenceType: SequenceType): void => {
  localStorageWrapper.setItem(SEQUENCE_TYPE_STORAGE_KEY, sequenceType);
};
