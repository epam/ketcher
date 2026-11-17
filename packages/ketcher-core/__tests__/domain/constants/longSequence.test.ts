import { isLongSequenceMonomerCount } from 'domain/constants/longSequence';

describe('isLongSequenceMonomerCount', () => {
  it('uses a strict threshold of more than 3000 monomers', () => {
    expect(isLongSequenceMonomerCount(2999)).toBe(false);
    expect(isLongSequenceMonomerCount(3000)).toBe(false);
    expect(isLongSequenceMonomerCount(3001)).toBe(true);
  });
});
