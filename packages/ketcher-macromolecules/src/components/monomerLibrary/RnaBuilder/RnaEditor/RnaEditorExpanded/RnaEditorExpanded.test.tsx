import { Entities, MonomerOrAmbiguousType } from 'ketcher-core';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider as StoreProvider } from 'react-redux';
import { ThemeProvider } from '@emotion/react';
import { createTheme } from '@mui/material/styles';
import { merge } from 'lodash';
import { RnaEditorExpanded } from 'components/monomerLibrary/RnaBuilder/RnaEditor/RnaEditorExpanded/RnaEditorExpanded';
import { EmptyFunction } from 'helpers';
import { configureAppStore } from 'state';
import {
  setActiveRnaBuilderItem,
  setActivePresetMonomerGroup,
} from 'state/rna-builder';
import { MonomerGroups } from 'src/constants';
import { defaultTheme } from 'theming/defaultTheme';

const testTheme = merge(createTheme(), { ketcher: defaultTheme });

const useLayoutModeMock = jest.fn(() => 'sequence-layout-mode');

jest.mock('hooks', () => ({
  ...jest.requireActual('hooks'),
  useLayoutMode: () => useLayoutModeMock(),
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
          editor: {
            editor: {
              isSequenceEditInRNABuilderMode: true,
              events: { keyDown: { add: () => true, remove: () => true } },
            },
          },
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

    // In sequence edit mode the phosphate position picker is shown but disabled
    // (req 5.2 of #9120).
    expect(
      screen.getByRole('button', { name: 'Select phosphate position' }),
    ).toBeDisabled();
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

    expect(onDuplicateHandler).toHaveBeenCalled();
    expect(rnaEditorExpanded).toMatchSnapshot();
  });

  it('should not enable the Update button when re-entering edit mode without picking a new monomer', async () => {
    const sequenceSelection = [
      {
        type: Entities.Nucleotide,
        baseLabel: 'A',
        sugarLabel: 'R',
        phosphateLabel: 'P',
        nodeIndexOverall: 0,
        hasR1Connection: false,
      },
    ];
    const monomerA = { label: 'A' } as MonomerOrAmbiguousType;
    const monomerB = { label: 'B' } as MonomerOrAmbiguousType;

    const store = configureAppStore({
      editor: {
        editor: {
          isSequenceEditInRNABuilderMode: true,
          events: { keyDown: { add: () => true, remove: () => true } },
        },
      },
      rnaBuilder: {
        activePreset: {},
        sequenceSelectionName: '1 nucleotide',
        sequenceSelection,
        presetsDefault: [],
        presetsCustom: [],
        activeRnaBuilderItem: MonomerGroups.BASES,
        activePresetMonomerGroup: {
          groupName: MonomerGroups.BASES,
          groupItem: monomerA,
        },
      },
    });

    const tree = (isEditMode: boolean) => (
      <ThemeProvider theme={testTheme}>
        <StoreProvider store={store}>
          <RnaEditorExpanded
            isEditMode={isEditMode}
            onDuplicate={EmptyFunction}
          />
        </StoreProvider>
      </ThemeProvider>
    );

    const { rerender } = render(tree(true));

    // No monomer picked yet in this edit session: Update stays disabled.
    expect(screen.getByTestId('save-btn')).toBeDisabled();

    // User picks a monomer: Update becomes enabled.
    act(() => {
      store.dispatch(
        setActivePresetMonomerGroup({
          groupName: MonomerGroups.BASES,
          groupItem: monomerB,
        }),
      );
    });
    rerender(tree(true));
    expect(screen.getByTestId('save-btn')).not.toBeDisabled();

    // User cancels (edit mode turns off) without the stale redux monomer
    // group being reset, then re-enters edit mode on a fresh selection.
    rerender(tree(false));
    act(() => {
      store.dispatch(setActiveRnaBuilderItem(MonomerGroups.BASES));
    });
    rerender(tree(true));

    // Re-entering edit mode must start a fresh session: Update stays
    // disabled until a monomer is actually picked again.
    expect(screen.getByTestId('save-btn')).toBeDisabled();
  });
});
