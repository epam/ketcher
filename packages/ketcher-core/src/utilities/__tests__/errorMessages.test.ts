import {
  atomsForBondNotFoundMessage,
  entityNotFoundMessage,
} from '../errorMessages';

describe('entityNotFoundMessage', () => {
  it('builds a message from the entity name and id', () => {
    expect(entityNotFoundMessage('Atom', 5)).toBe('Atom 5 not found');
  });

  it('builds a message for a different entity name', () => {
    expect(entityNotFoundMessage('Bond', 1)).toBe('Bond 1 not found');
  });
});

describe('atomsForBondNotFoundMessage', () => {
  it('builds a message including the bond id and both atom ids', () => {
    expect(atomsForBondNotFoundMessage(3, 1, 2)).toBe(
      'Atom(s) for bond 3 not found: begin=1, end=2',
    );
  });
});
