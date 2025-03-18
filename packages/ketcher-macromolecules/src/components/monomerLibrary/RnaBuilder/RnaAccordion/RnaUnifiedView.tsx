import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { Icon, IconName } from 'ketcher-react';
import { useAppSelector } from 'hooks';
import { MonomerGroup } from 'components/monomerLibrary/monomerLibraryGroup';
import { RnaPresetGroup } from 'components/monomerLibrary/RnaPresetGroup/RnaPresetGroup';
import {
  createNewPreset,
  recalculateRnaBuilderValidations,
  setActivePresetMonomerGroup,
  setActiveRnaBuilderItem,
  setIsEditMode,
  selectActivePreset,
  selectActiveRnaBuilderItem,
  selectFilteredPresets,
  selectIsActivePresetNewAndEmpty,
  selectIsEditMode,
  RnaBuilderPresetsItem,
  RnaBuilderItem,
} from 'state/rna-builder';
import {
  selectFilteredMonomers,
  selectMonomerGroups,
  selectMonomersInCategory,
  selectUnsplitNucleotides,
  selectAmbiguousMonomersInCategory,
  getMonomerUniqueKey,
} from 'state/library';
import {
  selectEditor,
  selectIsSequenceEditInRNABuilderMode,
} from 'state/common';
import {
  LibraryNameType,
  MonomerCodeToGroup,
  MonomerGroups,
} from 'src/constants';
import {
  IRnaPreset,
  isAmbiguousMonomerLibraryItem,
  KetMonomerClass,
} from 'ketcher-core';

import {
  RnaTabsContainer,
  RnaTab,
  RnaTabWrapper,
  CompactDetailsContainer,
  RnaAccordionContainer,
  DetailsContainer,
  DisabledArea,
  StyledAccordion,
  StyledAccordionWrapper,
  StyledButton,
} from './styles';
import { Summary } from './Summary';
import { useDispatch } from 'react-redux';

interface RnaUnifiedViewProps {
  view: 'tabs' | 'accordion';
  libraryName: LibraryNameType;
  duplicatePreset: (preset?: IRnaPreset) => void;
  editPreset: (preset: IRnaPreset) => void;
}

export const RnaUnifiedView = ({
  view,
  libraryName,
  duplicatePreset,
  editPreset,
}: RnaUnifiedViewProps) => {
  const dispatch = useDispatch();
  const monomers = useAppSelector(selectFilteredMonomers);
  const items = selectMonomersInCategory(monomers, libraryName);
  const activeRnaBuilderItem = useAppSelector(selectActiveRnaBuilderItem);
  const activePreset = useAppSelector(selectActivePreset);
  const groups = selectMonomerGroups(items);
  const presets = useAppSelector(selectFilteredPresets);
  const nucleotideItems = selectUnsplitNucleotides(monomers);
  const nucleotideGroups = selectMonomerGroups(nucleotideItems);
  const isEditMode = useAppSelector(selectIsEditMode);
  const editor = useAppSelector(selectEditor);
  const isActivePresetNewAndEmpty = useAppSelector(
    selectIsActivePresetNewAndEmpty,
  );
  const isSequenceEditInRNABuilderMode = useAppSelector(
    selectIsSequenceEditInRNABuilderMode,
  );

  const [expandedAccordion, setExpandedAccordion] =
    useState<RnaBuilderItem | null>(activeRnaBuilderItem);
  const [newPreset, setNewPreset] = useState(activePreset);
  const [activeMonomerKey, setActiveMonomerKey] = useState('');

  const handleAccordionSummaryClick = (rnaBuilderItem: RnaBuilderItem) => {
    if (expandedAccordion === rnaBuilderItem) {
      setExpandedAccordion(null);
    } else {
      setExpandedAccordion(rnaBuilderItem);
      dispatch(
        recalculateRnaBuilderValidations({ rnaPreset: newPreset, isEditMode }),
      );
    }
  };

  useEffect(() => {
    setExpandedAccordion(activeRnaBuilderItem);
  }, [activeRnaBuilderItem]);

  useEffect(() => {
    dispatch(
      setActiveRnaBuilderItem(
        isEditMode && activePreset
          ? activeRnaBuilderItem
          : RnaBuilderPresetsItem.Presets,
      ),
    );
  }, [isEditMode]);

  const onClickNewPreset = () => {
    dispatch(createNewPreset());
    dispatch(setActiveRnaBuilderItem(RnaBuilderPresetsItem.Presets));
    dispatch(setIsEditMode(true));
  };

  const groupsData = [
    {
      groupName: RnaBuilderPresetsItem.Presets,
      iconName: 'preset',
      groups: [{ groupItems: presets }],
    },
    {
      groupName: MonomerGroups.SUGARS,
      iconName: 'sugar',
      groups: groups.filter(
        (group) =>
          MonomerCodeToGroup[group.groupTitle as string] ===
          MonomerGroups.SUGARS,
      ),
    },
    {
      groupName: MonomerGroups.BASES,
      iconName: 'base',
      groups: groups
        .filter(
          (group) =>
            MonomerCodeToGroup[group.groupTitle as string] ===
            MonomerGroups.BASES,
        )
        .map((group) => ({
          ...group,
          groupItems: group.groupItems.filter(
            (item) => item.props?.MonomerClass !== KetMonomerClass.RNA,
          ),
        })),
    },
    {
      groupName: MonomerGroups.PHOSPHATES,
      iconName: 'phosphate',
      groups: groups.filter(
        (group) =>
          MonomerCodeToGroup[group.groupTitle as string] ===
          MonomerGroups.PHOSPHATES,
      ),
    },
    {
      groupName: MonomerGroups.NUCLEOTIDES,
      iconName: 'nucleotide',
      groups: nucleotideGroups,
    },
  ];

  const selectItem = (monomer: any, groupName: any) => {
    setActiveMonomerKey(getMonomerUniqueKey(monomer));

    if (!isSequenceEditInRNABuilderMode && !isEditMode) {
      editor.events.selectMonomer.dispatch(monomer);
    }

    if (!isEditMode) {
      return;
    }

    const monomerClass = isAmbiguousMonomerLibraryItem(monomer)
      ? monomer.monomers[0].monomerItem.props.MonomerClass?.toLowerCase()
      : monomer.props.MonomerClass.toLowerCase();
    const currentPreset = {
      ...newPreset,
      [monomerClass]: monomer,
    };
    setNewPreset(currentPreset);
    dispatch(setActivePresetMonomerGroup({ groupName, groupItem: monomer }));
    dispatch(setActiveRnaBuilderItem(groupName));
  };

  const renderTabs = () => (
    <>
      <RnaTabsContainer>
        {groupsData.map((groupData) => {
          const showCaption = groupData.groupName === activeRnaBuilderItem;
          const variantMonomers = selectAmbiguousMonomersInCategory(
            monomers,
            groupData.groupName as MonomerGroups,
          );
          const quantity = [...groupData.groups, ...variantMonomers].reduce(
            (acc, group) => acc + (group.groupItems.length || 0),
            0,
          );
          const caption = showCaption
            ? `${groupData.groupName} (${quantity})`
            : null;
          return (
            <RnaTabWrapper
              key={groupData.groupName}
              className={clsx(showCaption && 'rna-tab--selected')}
            >
              <RnaTab
                label={caption}
                title={groupData.groupName}
                selected={showCaption}
                icon={
                  <Icon
                    name={groupData.iconName as IconName}
                    onClick={() =>
                      dispatch(setActiveRnaBuilderItem(groupData.groupName))
                    }
                  />
                }
              />
            </RnaTabWrapper>
          );
        })}
      </RnaTabsContainer>
      {groupsData.map((groupData) => {
        if (groupData.groupName !== activeRnaBuilderItem) return null;
        const variantMonomers = selectAmbiguousMonomersInCategory(
          monomers,
          groupData.groupName as MonomerGroups,
        );
        const details =
          groupData.groupName === RnaBuilderPresetsItem.Presets ? (
            <DetailsContainer>
              <StyledButton onClick={onClickNewPreset}>New Preset</StyledButton>
              <RnaPresetGroup
                duplicatePreset={duplicatePreset}
                editPreset={editPreset}
                presets={presets}
              />
              {isEditMode && !isActivePresetNewAndEmpty && <DisabledArea />}
            </DetailsContainer>
          ) : (
            <DetailsContainer>
              <>
                {groupData.groups.map(({ groupItems, groupTitle }) => (
                  <MonomerGroup
                    key={groupTitle}
                    title={groupData.groups.length > 1 ? groupTitle : undefined}
                    groupName={groupData.groupName}
                    items={groupItems}
                    selectedMonomerUniqueKey={activeMonomerKey}
                    onItemClick={(monomer) =>
                      selectItem(monomer, groupData.groupName)
                    }
                  />
                ))}
                {variantMonomers.map((group) => (
                  <MonomerGroup
                    key={group.groupTitle}
                    title={group.groupTitle}
                    items={group.groupItems}
                    libraryName={libraryName}
                    selectedMonomerUniqueKey={activeMonomerKey}
                    onItemClick={(monomer) =>
                      selectItem(monomer, groupData.groupName)
                    }
                  />
                ))}
              </>
            </DetailsContainer>
          );

        const firstTabSelected =
          activeRnaBuilderItem === RnaBuilderPresetsItem.Presets;
        const lastTabSelected =
          activeRnaBuilderItem === MonomerGroups.NUCLEOTIDES;

        return (
          <CompactDetailsContainer
            className={clsx(
              firstTabSelected && 'first-tab',
              lastTabSelected && 'last-tab',
            )}
            key={groupData.groupName}
          >
            {details}
          </CompactDetailsContainer>
        );
      })}
    </>
  );

  const renderAccordion = () => (
    <>
      {groupsData.map((groupData) => {
        const expanded = expandedAccordion === groupData.groupName;
        const variantMonomers = selectAmbiguousMonomersInCategory(
          monomers,
          groupData.groupName as MonomerGroups,
        );
        const quantity = [...groupData.groups, ...variantMonomers].reduce(
          (acc, group) => acc + (group.groupItems.length || 0),
          0,
        );
        const summary = (
          <Summary
            iconName={groupData.iconName as IconName}
            groupName={groupData.groupName}
            quantity={quantity}
            expanded={expanded}
          />
        );
        const details =
          groupData.groupName === RnaBuilderPresetsItem.Presets ? (
            <DetailsContainer>
              <StyledButton onClick={onClickNewPreset}>New Preset</StyledButton>
              <RnaPresetGroup
                duplicatePreset={duplicatePreset}
                editPreset={editPreset}
                presets={presets}
              />
              {isEditMode && !isActivePresetNewAndEmpty && <DisabledArea />}
            </DetailsContainer>
          ) : (
            <DetailsContainer>
              <>
                {groupData.groups.map(({ groupItems, groupTitle }) => (
                  <MonomerGroup
                    key={groupTitle}
                    title={groupData.groups.length > 1 ? groupTitle : undefined}
                    groupName={groupData.groupName}
                    items={groupItems}
                    selectedMonomerUniqueKey={activeMonomerKey}
                    onItemClick={(monomer) =>
                      selectItem(monomer, groupData.groupName)
                    }
                  />
                ))}
                {variantMonomers.map((group) => (
                  <MonomerGroup
                    key={group.groupTitle}
                    title={group.groupTitle}
                    items={group.groupItems}
                    libraryName={libraryName}
                    selectedMonomerUniqueKey={activeMonomerKey}
                    onItemClick={(monomer) =>
                      selectItem(monomer, groupData.groupName)
                    }
                  />
                ))}
              </>
            </DetailsContainer>
          );
        return groupData.groupName === RnaBuilderPresetsItem.Presets &&
          expanded ? (
          <StyledAccordionWrapper key={groupData.groupName}>
            <StyledAccordion
              data-testid="styled-accordion"
              dataTestIdDetails={`rna-accordion-details-${groupData.groupName}`}
              summary={summary}
              details={details}
              expanded={expanded}
              onSummaryClick={() =>
                handleAccordionSummaryClick(groupData.groupName)
              }
            />
          </StyledAccordionWrapper>
        ) : (
          <StyledAccordion
            key={groupData.groupName}
            data-testid="styled-accordion"
            dataTestIdDetails={`rna-accordion-details-${groupData.groupName}`}
            summary={summary}
            details={details}
            expanded={expanded}
            onSummaryClick={() =>
              handleAccordionSummaryClick(groupData.groupName)
            }
          />
        );
      })}
    </>
  );

  return (
    <RnaAccordionContainer data-testid="rna-accordion">
      {view === 'tabs' ? renderTabs() : renderAccordion()}
    </RnaAccordionContainer>
  );
};
