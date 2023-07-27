import { fireEvent, render, screen } from '@testing-library/react';
import { RnaEditorExpanded } from 'components/monomerLibrary/RnaBuilder/RnaEditor/RnaEditorExpanded/RnaEditorExpanded';
import { EmptyFunction } from 'helpers';

describe('Test Rna Editor Expanded component', () => {
  it('should render correctly in edit mode', async () => {
    const onCancelHandler = jest.fn();
    const onSaveHandler = jest.fn();

    render(
      withThemeAndStoreProvider(
        <RnaEditorExpanded
          isEditMode
          onCancel={onCancelHandler}
          onChangeName={EmptyFunction}
          onDuplicate={EmptyFunction}
          onEdit={EmptyFunction}
          onSave={onSaveHandler}
        />,
        {
          rnaBuilder: {
            activePreset: {
              name: 'MyRna',
              sugar: {},
              phosphate: {},
              base: {},
            },
          },
        },
      ),
    );

    const rnaEditorExpanded = screen.getByTestId('rna-editor-expanded');
    const cancelBtn = screen.getByTestId('cancel-btn');
    const addToPresetsBtn = screen.getByTestId('add-to-presets-btn');

    fireEvent.click(addToPresetsBtn);
    fireEvent.click(cancelBtn);

    expect(onSaveHandler).toBeCalled();
    expect(onCancelHandler).toBeCalled();
    expect(rnaEditorExpanded).toMatchSnapshot();
  });

  it('should render correctly in view mode', async () => {
    const onDuplicateHandler = jest.fn();
    const onEditHandler = jest.fn();

    render(
      withThemeAndStoreProvider(
        <RnaEditorExpanded
          isEditMode={false}
          onCancel={EmptyFunction}
          onChangeName={EmptyFunction}
          onDuplicate={onDuplicateHandler}
          onEdit={onEditHandler}
          onSave={EmptyFunction}
        />,
        {
          rnaBuilder: {
            activePreset: {
              name: 'MyRna',
              sugar: {},
              phosphate: {},
              base: {},
              presetInList: {},
            },
          },
        },
      ),
    );

    const rnaEditorExpanded = screen.getByTestId('rna-editor-expanded');
    const editBtn = screen.getByTestId('edit-btn');
    const duplicateBtn = screen.getByTestId('duplicate-btn');

    fireEvent.click(editBtn);
    fireEvent.click(duplicateBtn);

    expect(onEditHandler).toBeCalled();
    expect(onDuplicateHandler).toBeCalled();
    expect(rnaEditorExpanded).toMatchSnapshot();
  });
});
