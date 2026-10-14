import { vi } from 'vitest';

import { AbbreviationLookupContainer } from './AbbreviationLookup.container';
import { render, screen } from '@testing-library/react';

vi.mock('react-redux', () => {
  return {
    useSelector: (fn) => fn(),
  };
});

const { ABBREVIATION_CONTENT, mockedUseOptions, mockedIsOpen } = vi.hoisted(
  () => ({
    ABBREVIATION_CONTENT: 'ABBREVIATION_CONTENT',
    mockedUseOptions: vi.fn().mockImplementation(() => []),
    mockedIsOpen: { value: false },
  }),
);
vi.mock('./AbbreviationLookup', () => {
  return {
    AbbreviationLookup: () => <div>{ABBREVIATION_CONTENT}</div>,
  };
});

vi.mock('./hooks/useOptions', () => {
  return {
    useOptions: () => mockedUseOptions(),
  };
});

vi.mock('../../state/abbreviationLookup/selectors', () => ({
  selectIsAbbreviationLookupOpen: () => mockedIsOpen.value,
}));

describe('AbbreviationLookupContainer', () => {
  it('Should not render Abbreviation Lookup if it is not open', () => {
    mockedIsOpen.value = false;
    render(<AbbreviationLookupContainer />);
    const abbreviation = screen.queryByText(ABBREVIATION_CONTENT);
    expect(abbreviation).not.toBeInTheDocument();
  });

  it('Should render Abbreviation Lookup if it is open', () => {
    mockedIsOpen.value = true;
    render(<AbbreviationLookupContainer />);
    const abbreviation = screen.queryByText(ABBREVIATION_CONTENT);
    expect(abbreviation).toBeInTheDocument();
  });

  it('Should call useOptions', () => {
    render(<AbbreviationLookupContainer />);
    expect(mockedUseOptions).toHaveBeenCalled();
  });
});
