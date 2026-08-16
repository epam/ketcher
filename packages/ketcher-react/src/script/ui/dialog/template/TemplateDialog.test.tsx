import { fireEvent, render, screen } from '@testing-library/react';
import { Struct } from 'ketcher-core';
import { TemplateDialog } from './TemplateDialog';

const mockSerialize = jest.fn();
const mockDispatch = jest.fn();

jest.mock('ketcher-core', () => ({
  ...jest.requireActual('ketcher-core'),
  SdfSerializer: jest.fn().mockImplementation(() => ({
    serialize: mockSerialize,
  })),
  KetcherLogger: {
    error: jest.fn(),
  },
}));

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}));

jest.mock('../../views/components', () => ({
  Dialog: ({ children, footerContent }) => (
    <div>
      {children}
      {footerContent}
    </div>
  ),
}));

jest.mock('../../component/view/savebutton', () => ({
  SaveButton: ({ children, getData, onError }) => (
    <button
      type="button"
      onClick={() => {
        try {
          getData();
        } catch (e) {
          onError(e);
        }
      }}
    >
      {children}
    </button>
  ),
}));

jest.mock('./TemplateTable', () => () => null);
jest.mock('components', () => ({ Icon: () => null }));
jest.mock('./useSaltsAndSolvets', () => () => []);

const defaultProps = {
  filter: '',
  group: 'User Templates',
  lib: [],
  selected: null,
  tab: 0,
  initialTab: 0,
  saltsAndSolvents: [],
  functionalGroups: [],
  onAttach: jest.fn(),
  onCancel: jest.fn(),
  onChangeGroup: jest.fn(),
  onDelete: jest.fn(),
  onFilter: jest.fn(),
  onOk: jest.fn(),
  onSelect: jest.fn(),
  onTabChange: jest.fn(),
};

describe('TemplateDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not serialize a reaction with an R-Group fragment when opened', () => {
    const struct = new Struct();
    struct.name = 'Reaction with R-Group fragment';
    const template = {
      struct,
      props: {
        atomid: 0,
        bondid: 0,
        group: 'User Templates',
        name: 'Reaction with R-Group fragment',
      },
    };
    mockSerialize.mockImplementation(() => {
      throw new Error(
        'Reactions with r-groups are not supported at the moment',
      );
    });

    expect(() =>
      render(<TemplateDialog {...defaultProps} lib={[template]} />),
    ).not.toThrow();
    expect(mockSerialize).not.toHaveBeenCalled();

    mockSerialize.mockReturnValue('serialized template');
    fireEvent.click(screen.getByRole('button', { name: 'Save to SDF' }));

    expect(mockSerialize).toHaveBeenCalledWith([template]);
  });

  it('dispatches a snackbar notification when serialization fails on Save to SDF', () => {
    const serializationError = new Error('Serialization failed');
    mockSerialize.mockImplementation(() => {
      throw serializationError;
    });

    render(<TemplateDialog {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: 'Save to SDF' }));

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'SHOW_SNACKBAR_NOTIFICATION',
        data: 'Some templates could not be exported.',
      }),
    );
  });
});
