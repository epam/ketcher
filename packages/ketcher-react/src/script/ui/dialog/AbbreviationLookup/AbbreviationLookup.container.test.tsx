import { AbbreviationLookupContainer } from './AbbreviationLookup.container';
import { render, screen } from '@testing-library/react';

jest.mock('react-redux', () => {
  return {
    useSelector: (fn) => fn(),
  };
});

const ABBREVIATION_CONTENT = 'ABBREVIATION_CONTENT';
jest.mock('./AbbreviationLookup', () => {
  return {
    AbbreviationLookup: () => <div>{ABBREVIATION_CONTENT}</div>,
  };
});

const mockedUseOptions = jest.fn().mockImplementation(() => []);
jest.mock('./hooks/useOptions', () => {
  return {
    useOptions: () => mockedUseOptions(),
  };
});

let mockedIsOpen = false;
jest.mock('../../state/abbreviationLookup/selectors', () => ({
  selectIsAbbreviationLookupOpen: () => mockedIsOpen,
}));

describe('AbbreviationLookupContainer', () => {
  it('Should not render Abbreviation Lookup if it is not open', () => {
    mockedIsOpen = false;
    render(<AbbreviationLookupContainer />);
    const abbreviation = screen.queryByText(ABBREVIATION_CONTENT);
    expect(abbreviation).not.toBeInTheDocument();
  });

  it('Should render Abbreviation Lookup if it is open', () => {
    mockedIsOpen = true;
    render(<AbbreviationLookupContainer />);
    const abbreviation = screen.queryByText(ABBREVIATION_CONTENT);
    expect(abbreviation).toBeInTheDocument();
  });

  it('Should call useOptions', () => {
    render(<AbbreviationLookupContainer />);
    expect(mockedUseOptions).toHaveBeenCalled();
  });
});
