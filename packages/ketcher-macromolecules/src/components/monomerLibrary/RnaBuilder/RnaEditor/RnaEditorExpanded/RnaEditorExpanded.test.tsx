import {
  Entities,
  MonomerOrAmbiguousType,
  MonomerItemType,
  Nucleotide,
  Sugar,
  RNABase,
  Phosphate,
  PolymerBond,
  HydrogenBond,
  KetMonomerClass,
  Struct,
  Chain,
  SequenceRenderer,
} from 'ketcher-core';
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
  selectIsBaseModificationDisabled,
  SYNC_BASE_MODIFICATION_ERROR,
  rnaBuilderSlice,
} from 'state/rna-builder';
import { MonomerGroups } from 'src/constants';
import { defaultTheme } from 'theming/defaultTheme';
import { generateSequenceContextMenuProps } from 'components/contextMenu/SequenceItemContextMenu/helpers';

const testTheme = merge(createTheme(), { ketcher: defaultTheme });

const useLayoutModeMock = jest.fn(() => 'sequence-layout-mode');
const mockEditorEvents = {
  keyDown: { add: () => true, remove: () => true },
  cancelSequenceEditInRNABuilderMode: { add: () => true, remove: () => true },
};

jest.mock('hooks', () => ({
  ...jest.requireActual('hooks'),
  useLayoutMode: () => useLayoutModeMock(),
}));

describe('RNA Builder duplex base restrictions', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  const createNucleotide = (baseLabel: string) => {
    const item = (
      label: string,
      monomerClass: KetMonomerClass,
    ): MonomerItemType => ({
      label,
      struct: new Struct(),
      props: {
        MonomerName: label,
        Name: label,
        MonomerClass: monomerClass,
        MonomerNaturalAnalogCode: label,
        MonomerCaps: { R1: 'H', R2: 'H', R3: 'H' },
      },
    });
    const sugar = new Sugar(item('R', KetMonomerClass.Sugar));
    const base = new RNABase(item(baseLabel, KetMonomerClass.Base));
    const phosphate = new Phosphate(item('P', KetMonomerClass.Phosphate));
    const baseBond = new PolymerBond(sugar, base);
    sugar.attachmentPointsToBonds.R3 = baseBond;
    base.attachmentPointsToBonds.R1 = baseBond;
    const backboneBond = new PolymerBond(sugar, phosphate);
    sugar.attachmentPointsToBonds.R2 = backboneBond;
    phosphate.attachmentPointsToBonds.R1 = backboneBond;
    return new Nucleotide(sugar, base, phosphate);
  };

  const setup = ({
    oppositeLabel = 'U',
    sync = true,
    paired = true,
    backbone = true,
    selectBoth = true,
  } = {}) => {
    const sense = createNucleotide('A');
    const antisense = createNucleotide(oppositeLabel);
    const pair = {
      senseNode: sense,
      antisenseNode: antisense,
      senseNodeIndex: 0,
      chain: new Chain().addNode(sense),
    };
    if (paired) {
      const bond = new HydrogenBond(sense.rnaBase, antisense.rnaBase);
      sense.rnaBase.hydrogenBonds.push(bond);
      antisense.rnaBase.hydrogenBonds.push(bond);
    }
    if (!backbone) {
      antisense.sugar.attachmentPointsToBonds.R2 = null;
    }
    jest.spyOn(SequenceRenderer, 'getNodeByPointer').mockReturnValue(pair);
    const selectedNodes = selectBoth ? [sense, antisense] : [sense];
    const contextMenu = generateSequenceContextMenuProps([
      selectedNodes.map((node) => ({
        node,
        nodeIndexOverall: 0,
        twoStrandedNode: pair,
      })),
    ])!;
    const error = jest.fn();
    const store = configureAppStore({
      editor: {
        editor: {
          isSequenceEditInRNABuilderMode: true,
          isSequenceSyncEditMode: sync,
          events: { ...mockEditorEvents, error: { dispatch: error } },
        },
      },
      rnaBuilder: {
        ...rnaBuilderSlice.getInitialState(),
        activePreset: {},
        sequenceSelectionName: contextMenu.title,
        sequenceSelection: contextMenu.selectedSequenceLabeledNodes,
      },
    });
    render(
      <ThemeProvider theme={testTheme}>
        <StoreProvider store={store}>
          <RnaEditorExpanded isEditMode onDuplicate={EmptyFunction} />
        </StoreProvider>
      </ThemeProvider>,
    );
    return { store, error };
  };

  it.each([
    ['U', '[disabled]'],
    ['A', 'A'],
  ])(
    'shows %s pairs as %s and warns when the base slot is clicked',
    (oppositeLabel, label) => {
      const { store, error } = setup({ oppositeLabel });
      const slot = screen.getByTestId('rna-builder-slot--base');
      expect(slot).toHaveTextContent(label);
      expect(selectIsBaseModificationDisabled(store.getState())).toBe(true);
      fireEvent.click(slot);
      expect(error).toHaveBeenCalledWith(SYNC_BASE_MODIFICATION_ERROR);
      fireEvent.click(screen.getByTestId('rna-builder-slot--sugar'));
      expect(error).toHaveBeenCalledTimes(1);
    },
  );

  it.each([
    { sync: false },
    { paired: false },
    { backbone: false },
    { selectBoth: false },
  ])(
    'allows base modification when the pair restriction does not apply: %j',
    (options) => {
      const { store, error } = setup(options);
      expect(selectIsBaseModificationDisabled(store.getState())).toBe(false);
      expect(
        screen.getByTestId('rna-builder-slot--base'),
      ).not.toHaveTextContent('[disabled]');
      fireEvent.click(screen.getByTestId('rna-builder-slot--base'));
      expect(error).not.toHaveBeenCalled();
    },
  );
});

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
              events: mockEditorEvents,
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
          events: mockEditorEvents,
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
