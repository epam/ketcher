import { render, screen } from '@testing-library/react';
import { KetMonomerClass, Struct } from 'ketcher-core';
import { MONOMER_TYPES, MonomerGroups } from 'src/constants';

import RnaElementsTabsView from './RnaElementsTabsView';

describe('RnaElementsTabsView', () => {
  const onSelectItem = jest.fn();
  const onNewPresetClick = jest.fn();
  const duplicatePreset = jest.fn();
  const editPreset = jest.fn();

  const initialState = {
    library: {
      searchFilter: 'v',
      favorites: {},
      monomers: [],
    },
    rnaBuilder: {
      activeMonomerKey: null,
      activePreset: undefined,
      groupItemValidations: {
        [MonomerGroups.BASES]: [],
        [MonomerGroups.SUGARS]: [],
        [MonomerGroups.PHOSPHATES]: [],
      },
      isEditMode: false,
      presetsDefault: [],
      presetsCustom: [],
    },
  };

  const renderTabsView = (activeRnaBuilderItem: MonomerGroups) => {
    render(
      withThemeAndStoreProvider(
        <RnaElementsTabsView
          activeRnaBuilderItem={activeRnaBuilderItem}
          groupsData={[
            {
              groupName: activeRnaBuilderItem,
              iconName: 'base',
              groups: [
                {
                  groupTitle: 'U',
                  groupItems: [
                    {
                      label: 'vinyl5',
                      props: {
                        Name: 'Vinyl 5',
                        MonomerClass: KetMonomerClass.Base,
                        MonomerName: 'vinyl5',
                        MonomerNaturalAnalogCode: 'U',
                        MonomerType: MONOMER_TYPES.RNA,
                      },
                      struct: new Struct(),
                    },
                  ],
                },
              ],
            },
          ]}
          onSelectItem={onSelectItem}
          onNewPresetClick={onNewPresetClick}
          libraryName={MONOMER_TYPES.RNA}
          duplicatePreset={duplicatePreset}
          editPreset={editPreset}
        />,
        initialState,
      ),
    );
  };

  it('shows the natural analog title for a filtered single RNA base group in tabs view', () => {
    renderTabsView(MonomerGroups.BASES);

    expect(screen.getByText('U')).toBeInTheDocument();
    expect(screen.getByText('vinyl5')).toBeInTheDocument();
  });

  it('shows the natural analog title for a filtered single RNA nucleotide group in tabs view', () => {
    renderTabsView(MonomerGroups.NUCLEOTIDES);

    expect(screen.getByText('U')).toBeInTheDocument();
    expect(screen.getByText('vinyl5')).toBeInTheDocument();
  });
});
