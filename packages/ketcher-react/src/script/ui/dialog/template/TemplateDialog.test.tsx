import { fireEvent, render, screen } from '@testing-library/react';
import { Struct } from 'ketcher-core';
import { TemplateDialog } from './TemplateDialog';

const mockSerializeWithSkipInvalid = jest.fn();
const mockDispatch = jest.fn();

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}));

jest.mock('ketcher-core', () => ({
  ...jest.requireActual('ketcher-core'),
  SdfSerializer: jest.fn().mockImplementation(() => ({
    serializeWithSkipInvalid: mockSerializeWithSkipInvalid,
  })),
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
  SaveButton: ({ children, getData }) => (
    <button type="button" onClick={getData}>
      {children}
    </button>
  ),
}));

jest.mock('./TemplateTable', () => () => null);
jest.mock('components', () => ({ Icon: () => null }));
jest.mock('./useSaltsAndSolvets', () => () => []);

describe('TemplateDialog', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockSerializeWithSkipInvalid.mockClear();
  });

  it('does not serialize templates when the dialog is opened', () => {
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

    expect(() =>
      render(
        <TemplateDialog
          filter=""
          group="User Templates"
          lib={[template]}
          selected={null}
          tab={0}
          initialTab={0}
          saltsAndSolvents={[]}
          functionalGroups={[]}
          onAttach={jest.fn()}
          onCancel={jest.fn()}
          onChangeGroup={jest.fn()}
          onDelete={jest.fn()}
          onFilter={jest.fn()}
          onOk={jest.fn()}
          onSelect={jest.fn()}
          onTabChange={jest.fn()}
        />,
      ),
    ).not.toThrow();
    expect(mockSerializeWithSkipInvalid).not.toHaveBeenCalled();
  });

  it('serializes templates individually on save and returns SDF string', () => {
    const struct = new Struct();
    struct.name = 'Valid template';
    const template = {
      struct,
      props: {
        atomid: 0,
        bondid: 0,
        group: 'User Templates',
        name: 'Valid template',
      },
    };
    mockSerializeWithSkipInvalid.mockReturnValue({
      sdf: 'serialized template',
      skipped: [],
    });

    render(
      <TemplateDialog
        filter=""
        group="User Templates"
        lib={[template]}
        selected={null}
        tab={0}
        initialTab={0}
        saltsAndSolvents={[]}
        functionalGroups={[]}
        onAttach={jest.fn()}
        onCancel={jest.fn()}
        onChangeGroup={jest.fn()}
        onDelete={jest.fn()}
        onFilter={jest.fn()}
        onOk={jest.fn()}
        onSelect={jest.fn()}
        onTabChange={jest.fn()}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Save to SDF' }));

    expect(mockSerializeWithSkipInvalid).toHaveBeenCalledWith([template]);
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('dispatches a snackbar notification when some items are skipped', () => {
    const struct = new Struct();
    struct.name = 'Invalid template';
    const template = {
      struct,
      props: {
        atomid: 0,
        bondid: 0,
        group: 'User Templates',
        name: 'Invalid template',
      },
    };
    mockSerializeWithSkipInvalid.mockReturnValue({
      sdf: '',
      skipped: [
        {
          name: 'Invalid template',
          reason: 'Reactions with r-groups are not supported at the moment',
        },
      ],
    });

    render(
      <TemplateDialog
        filter=""
        group="User Templates"
        lib={[template]}
        selected={null}
        tab={0}
        initialTab={0}
        saltsAndSolvents={[]}
        functionalGroups={[]}
        onAttach={jest.fn()}
        onCancel={jest.fn()}
        onChangeGroup={jest.fn()}
        onDelete={jest.fn()}
        onFilter={jest.fn()}
        onOk={jest.fn()}
        onSelect={jest.fn()}
        onTabChange={jest.fn()}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Save to SDF' }));

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'SHOW_SNACKBAR_NOTIFICATION',
        data: expect.stringContaining('Invalid template'),
      }),
    );
  });
});
