import reducer, {
  initAbbreviationLookup,
  showAbbreviationLookup,
  closeAbbreviationLookup,
} from './index';

describe('Abbreviation Lookup reducer', () => {
  it('Should return initial value', () => {
    const randomAction = { type: 'RANDOM' };

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const state = reducer(undefined, randomAction as any);
    expect(state).toEqual({ isOpen: false });
  });

  it('Should set initial char for lookup value', () => {
    const initialState = { isOpen: false };
    const state = reducer(initialState, initAbbreviationLookup('K'));
    expect(state).toEqual({ isOpen: false, lookupValue: 'K' });
  });

  it('Should update lookup value and open lookup', () => {
    const initialState = { isOpen: false, lookupValue: 'K' };
    const state = reducer(initialState, showAbbreviationLookup('A'));
    expect(state).toEqual({ isOpen: true, lookupValue: 'KA' });
  });

  it('Should close lookup and clear lookup value', () => {
    const initialState = { isOpen: true, lookupValue: 'KA' };
    const state = reducer(initialState, closeAbbreviationLookup());
    expect(state).toEqual({ isOpen: false });
  });
});
