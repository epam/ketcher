import { isUpdateSequenceConfirmationNeeded } from './updateSequenceConfirmation';

describe('isUpdateSequenceConfirmationNeeded', () => {
  it('is needed when more than one nucleotide is modified', () => {
    expect(isUpdateSequenceConfirmationNeeded(2, 0)).toBe(true);
  });

  it('is needed when one nucleotide is modified but others change too', () => {
    expect(isUpdateSequenceConfirmationNeeded(1, 1)).toBe(true);
  });

  it('is not needed for one nucleotide with no additional changes', () => {
    expect(isUpdateSequenceConfirmationNeeded(1, 0)).toBe(false);
  });

  it('is not needed for nothing', () => {
    expect(isUpdateSequenceConfirmationNeeded(0, 0)).toBe(false);
  });
});
