/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import { MonomerGroup } from 'components/monomerLibrary/monomerLibraryGroup';
import { Group } from 'components/monomerLibrary/monomerLibraryList/types';
import { useAppSelector } from 'hooks';
import { Button, IconName } from 'ketcher-react';
import { useState } from 'react';
import {
  MonomerCodeToGroup,
  MonomerGroupCodes,
  MonomerGroups,
} from 'src/constants';
import { selectFilteredMonomers, selectMonomerGroups } from 'state/library';
import {
  DetailsContainer,
  RnaAccordionContainer,
  StyledAccordion,
} from './styles';
import { Summary } from './Summary';

export const RnaAccordion = () => {
  const monomers = useAppSelector(selectFilteredMonomers);
  const groups = selectMonomerGroups(monomers);

  const [expandedAccordion, setExpandedAccordion] = useState<number | null>(
    null,
  );

  const handleAccordionSummaryClick = (index: number) => {
    if (expandedAccordion === index) {
      setExpandedAccordion(null);
    } else setExpandedAccordion(index);
  };

  const groupsData = [
    {
      children: <Button>New Preset</Button>,
      groupName: 'Presets',
      iconName: 'preset',
      groups: [] as Group[],
    },
    {
      groupName: MonomerGroups.SUGARS,
      iconName: 'sugar',
      groups: groups.filter(
        (group) =>
          MonomerCodeToGroup[group.groupTitle as MonomerGroupCodes] ===
          MonomerGroups.SUGARS,
      ),
    },
    {
      groupName: MonomerGroups.BASES,
      iconName: 'base',
      groups: groups.filter(
        (group) =>
          MonomerCodeToGroup[group.groupTitle as MonomerGroupCodes] ===
          MonomerGroups.BASES,
      ),
    },
    {
      groupName: MonomerGroups.PHOSPHATES,
      iconName: 'phosphate',
      groups: groups.filter(
        (group) =>
          MonomerCodeToGroup[group.groupTitle as MonomerGroupCodes] ===
          MonomerGroups.PHOSPHATES,
      ),
    },
  ];
  const [selectedMonomers, setSelectedMonomers] = useState({});

  const selectItem = (monomer, groupName) => {
    setSelectedMonomers({
      ...selectedMonomers,
      [groupName]: monomer.label,
    });
  };

  return (
    <RnaAccordionContainer>
      {groupsData.map((groupData, i) => {
        const expanded = expandedAccordion === i;
        const quantity = groupData.groups.reduce(
          (acc, group) => acc + group.groupItems.length,
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
        const details = (
          <DetailsContainer>
            {groupData.children}
            {groupData.groups.map(({ groupItems, groupTitle }) => {
              return (
                <MonomerGroup
                  key={groupTitle}
                  title={groupData.groups.length > 1 ? groupTitle : undefined}
                  items={groupItems}
                  selectedMonomerLabel={selectedMonomers[groupData.groupName]}
                  onItemClick={(monomer) =>
                    selectItem(monomer, groupData.groupName)
                  }
                />
              );
            })}
          </DetailsContainer>
        );
        return (
          <StyledAccordion
            key={groupData.groupName}
            summary={summary}
            details={details}
            expanded={expanded}
            onSummaryClick={() => handleAccordionSummaryClick(i)}
          />
        );
      })}
    </RnaAccordionContainer>
  );
};
