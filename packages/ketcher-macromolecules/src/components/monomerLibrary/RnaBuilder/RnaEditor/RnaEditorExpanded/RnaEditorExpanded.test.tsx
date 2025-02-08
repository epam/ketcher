import { Entities } from 'ketcher-core';
import { fireEvent, render, screen } from '@testing-library/react';
import { RnaEditorExpanded } from 'components/monomerLibrary/RnaBuilder/RnaEditor/RnaEditorExpanded/RnaEditorExpanded';
import { EmptyFunction } from 'helpers';

jest.mock('hooks', () => ({
  ...jest.requireActual('hooks'),
  useLayoutMode: () => 'sequence-layout-mode',
}));

describe('Test Rna Editor Expanded component', () => {
  it('should render correctly in edit mode', async () => {
    render(
      withThemeAndStoreProvider(
        <RnaEditorExpanded isEditMode onDuplicate={EmptyFunction} />,
        {
          rnaBuilder: {
            activePreset: {
              name: '',
              nameInList: '',
              sugar: undefined,
              phosphate: undefined,
              base: undefined,
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

    expect(rnaEditorExpanded).toMatchSnapshot();
  });

  it('should render correctly in edit mode with modification of sequence', async () => {
    render(
      withThemeAndStoreProvider(
        <RnaEditorExpanded isEditMode onDuplicate={EmptyFunction} />,
        {
          editor: { editor: { isSequenceEditInRNABuilderMode: true } },
          rnaBuilder: {
            activePreset: {},
            sequenceSelectionName: '2 nucleotides',
            sequenceSelection: [
              {
                type: Entities.Nucleotide,
                baseLabel: 'A',
                sugarLabel: 'R',
                phosphateLabel: 'P',
                nodeIndexOverall: 0,
                hasR1Connection: false,
              },
              {
                type: Entities.Nucleotide,
                baseLabel: 'C',
                sugarLabel: 'R',
                phosphateLabel: 'P',
                nodeIndexOverall: 1,
                hasR1Connection: true,
              },
            ],
            presetsDefault: [],
            presetsCustom: [],
          },
        },
      ),
    );

    const rnaEditorExpanded = screen.getByTestId('rna-editor-expanded');

    expect(rnaEditorExpanded).toMatchSnapshot();
  });

  it('should render correctly in view mode', async () => {
    const onDuplicateHandler = jest.fn();

    render(
      withThemeAndStoreProvider(
        <RnaEditorExpanded
          isEditMode={false}
          onDuplicate={onDuplicateHandler}
        />,
        {
          rnaBuilder: {
            activePreset: {
              name: 'MyRna',
              sugar: {
                props: {
                  MonomerName: '',
                },
              },
              phosphate: {
                props: {
                  MonomerName: '',
                },
              },
              base: {
                props: {
                  MonomerName: '',
                },
              },
              nameInList: 'MyRna',
            },
            presetsDefault: [],
            presetsCustom: [],
          },
        },
      ),
    );

    const rnaEditorExpanded = screen.getByTestId('rna-editor-expanded');
    const editBtn = screen.getByTestId('edit-btn');
    const duplicateBtn = screen.getByTestId('duplicate-btn');

    fireEvent.click(editBtn);
    fireEvent.click(duplicateBtn);

    expect(onDuplicateHandler).toBeCalled();
    expect(rnaEditorExpanded).toMatchSnapshot();
  });
});
