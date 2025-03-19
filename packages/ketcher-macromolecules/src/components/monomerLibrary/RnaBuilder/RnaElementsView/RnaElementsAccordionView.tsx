import {
  selectAmbiguousMonomersInCategory,
  selectFilteredMonomers,
} from 'state/library';
import { MonomerGroups } from '../../../../constants';
import { Summary } from './Summary';
import { IconName } from 'ketcher-react';
import {
  recalculateRnaBuilderValidations,
  RnaBuilderItem,
  RnaBuilderPresetsItem,
  selectFilteredPresets,
  selectIsActivePresetNewAndEmpty,
  selectIsEditMode,
} from 'state/rna-builder';
import {
  DetailsContainer,
  DisabledArea,
  StyledAccordion,
  StyledAccordionWrapper,
  StyledButton,
} from './styles';
import { RnaPresetGroup } from 'components/monomerLibrary/RnaPresetGroup/RnaPresetGroup';
import { MonomerGroup } from 'components/monomerLibrary/monomerLibraryGroup';
import { memo, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from 'hooks';
import { RnaElementsViewProps } from './types';
import { IRnaPreset } from 'ketcher-core';

type Props = RnaElementsViewProps & {
  newPreset: IRnaPreset;
};

const RnaElementsAccordionView = ({
  activeRnaBuilderItem,
  groupsData,
  newPreset,
  onNewPresetClick,
  onSelectItem,
  duplicatePreset,
  editPreset,
  activeMonomerKey,
  libraryName,
}: Props) => {
  const dispatch = useDispatch();
  const presets = useAppSelector(selectFilteredPresets);
  const monomers = useAppSelector(selectFilteredMonomers);
  const isEditMode = useAppSelector(selectIsEditMode);
  const isActivePresetNewAndEmpty = useAppSelector(
    selectIsActivePresetNewAndEmpty,
  );

  const [expandedAccordion, setExpandedAccordion] =
    useState<RnaBuilderItem | null>(activeRnaBuilderItem);

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

  return (
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
              <StyledButton onClick={onNewPresetClick}>New Preset</StyledButton>
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
                      onSelectItem(monomer, groupData.groupName)
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
                      onSelectItem(monomer, groupData.groupName)
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
};

export default memo(RnaElementsAccordionView);
