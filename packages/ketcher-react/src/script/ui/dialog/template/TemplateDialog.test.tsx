import { fireEvent, render, screen } from '@testing-library/react';
import { Struct } from 'ketcher-core';
import { TemplateDialog } from './TemplateDialog';

const mockSerialize = jest.fn();

jest.mock('ketcher-core', () => ({
  ...jest.requireActual('ketcher-core'),
  SdfSerializer: jest.fn().mockImplementation(() => ({
    serialize: mockSerialize,
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
    expect(mockSerialize).not.toHaveBeenCalled();

    mockSerialize.mockReturnValue('serialized template');
    fireEvent.click(screen.getByRole('button', { name: 'Save to SDF' }));

    expect(mockSerialize).toHaveBeenCalledWith([template]);
  });
});
