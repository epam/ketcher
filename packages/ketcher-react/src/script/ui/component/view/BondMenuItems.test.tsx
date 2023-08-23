import { render, fireEvent, screen } from '@testing-library/react';
import BondMenuItems from '../../views/components/ContextMenu/menuItems/BondMenuItems';
import toolActions from '../../action/tools';

const toolsWithoutTitles = [
  'bonds',
  'arrows',
  'reaction-mapping-tools',
  'rgroup',
  'shapes',
];
const isToolWithTitle = (tool) => !toolsWithoutTitles.includes(tool);
const toolsWithTitles = Object.keys(toolActions).filter(isToolWithTitle);

describe.only('BondMenuItems', () => {
  it('should have a "title" property for each tool that is not hidden', () => {
    toolsWithTitles.forEach((toolKey) => {
      const tool = toolActions[toolKey];
      if (tool.title === undefined) {
        console.error(`Tool without title: ${toolKey}`);
      }
      expect(tool.title).toBeTruthy();
    });
  });

  it('renders menu items', () => {
    render(<BondMenuItems />);
    const editMenuItem = screen.getByRole('menuitem', { name: 'Edit...' });
    expect(editMenuItem).toBeInTheDocument();
  });

  it('calls the edit handler when Edit is clicked', () => {
    const mockHandleEdit = jest.fn();
    jest.mock(
      '../../views/components/ContextMenu/hooks/useBondEdit',
      () => () => [mockHandleEdit],
    );

    render(<BondMenuItems />);
    const editMenuItem = screen.getByRole('menuitem', { name: 'Edit...' });

    fireEvent.click(editMenuItem);
    expect(mockHandleEdit).toHaveBeenCalled();
  });

  it('calls handleSGroupAttach when Attach S-Group is clicked', () => {
    const mockHandleSGroupAttach = jest.fn();
    const mockSGroupAttachHidden = false;
    jest.mock(
      '../../views/components/ContextMenu/hooks/useBondSGroupAttach',
      () => () => [mockHandleSGroupAttach, mockSGroupAttachHidden],
    );

    render(<BondMenuItems />);
    const attachMenuItem = screen.getByRole('menuitem', {
      name: 'Attach S-Group...',
    });

    fireEvent.click(attachMenuItem);
    expect(mockHandleSGroupAttach).toHaveBeenCalled();
  });

  it('does not render menu items for tools without titles', () => {
    const mockTools = toolsWithoutTitles.reduce((tools, toolName) => {
      tools[toolName] = {};
      return tools;
    }, {});

    jest.mock('../../action/tools', () => ({
      __esModule: true,
      default: mockTools,
    }));

    render(<BondMenuItems />);

    toolsWithoutTitles.forEach((toolName) => {
      const toolMenuItem = screen.queryByRole('menuitem', {
        name: `Edit ${toolName}`,
      });
      expect(toolMenuItem).toBeNull();
    });
  });
});

// import { render, fireEvent, screen } from '@testing-library/react';
// import BondMenuItems from '../../views/components/ContextMenu/menuItems/BondMenuItems';

// jest.mock('../../views/components/ContextMenu/hooks/useBondEdit', () => () => [jest.fn()]);
// jest.mock('../../views/components/ContextMenu/hooks/useBondTypeChange', () => () => [jest.fn()]);
// jest.mock('../../views/components/ContextMenu/hooks/useBondSGroupAttach', () => () => [jest.fn(), false]);
// jest.mock('../../views/components/ContextMenu/hooks/useBondSGroupEdit', () => () => [jest.fn(), false, false]);
// jest.mock('../../views/components/ContextMenu/hooks/useDelete', () => () => jest.fn());

// jest.mock('src/script/ui/action/tools', () => ({
//   bond: {
//     tools1: { title: 'Tool 1' },
//     tools2: { title: 'Tool 2' },
//   },
// }));

// describe('BondMenuItems', () => {
//   it('renders menu items', () => {
//     render(<BondMenuItems />);
//     expect(screen.getByText('Edit...')).toBeInTheDocument();
//   });

//   it('calls the edit handler when Edit is clicked', () => {
//     const mockHandleEdit = jest.fn();
//     jest.mock('../../views/components/ContextMenu/hooks/useBondEdit', () => () => [mockHandleEdit]);

//     render(<BondMenuItems />);
//     const editMenuItem = screen.getByText('Edit...');

//     fireEvent.click(editMenuItem);
//     expect(mockHandleEdit).toHaveBeenCalled();
//   });

//   it('calls handleSGroupAttach when Attach S-Group is clicked', () => {
//     const mockHandleSGroupAttach = jest.fn();
//     const mockSGroupAttachHidden = false;
//     jest.mock('../../views/components/ContextMenu/hooks/useBondSGroupAttach', () => () => [
//       mockHandleSGroupAttach,
//       mockSGroupAttachHidden,
//     ]);

//     render(<BondMenuItems />);
//     const attachMenuItem = screen.getByText('Attach S-Group...');

//     fireEvent.click(attachMenuItem);
//     expect(mockHandleSGroupAttach).toHaveBeenCalled();
//   });

// });
