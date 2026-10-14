import { vi } from 'vitest';

import { fireEvent, render, screen } from '@testing-library/react';
import { Struct } from 'ketcher-core';
import { TemplateDialog } from './TemplateDialog';

const { mockSerialize, mockDispatch } = vi.hoisted(() => ({
  mockSerialize: vi.fn(),
  mockDispatch: vi.fn(),
}));

vi.mock('ketcher-core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('ketcher-core')>();
  return {
    ...actual,
    SdfSerializer: vi.fn(function () {
      return {
        serialize: mockSerialize,
      };
    }),
    KetcherLogger: {
      error: vi.fn(),
    },
  };
});

vi.mock('react-redux', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-redux')>()),
  useDispatch: () => mockDispatch,
}));

vi.mock('../../views/components', () => ({
  Dialog: ({ children, footerContent }) => (
    <div>
      {children}
      {footerContent}
    </div>
  ),
}));

vi.mock('../../component/view/savebutton', () => ({
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

vi.mock('./TemplateTable', () => ({ default: () => null }));
vi.mock('components', () => ({ Icon: () => null }));
vi.mock('./useSaltsAndSolvets', () => ({ default: () => [] }));

const defaultProps = {
  filter: '',
  group: 'User Templates',
  lib: [],
  selected: null,
  tab: 0,
  initialTab: 0,
  saltsAndSolvents: [],
  functionalGroups: [],
  onAttach: vi.fn(),
  onCancel: vi.fn(),
  onChangeGroup: vi.fn(),
  onDelete: vi.fn(),
  onFilter: vi.fn(),
  onOk: vi.fn(),
  onSelect: vi.fn(),
  onTabChange: vi.fn(),
};

describe('TemplateDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
