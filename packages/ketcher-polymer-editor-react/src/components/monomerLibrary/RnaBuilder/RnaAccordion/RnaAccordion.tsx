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

import { MonomerGroup } from 'components/monomerLibrary/monomerLibraryGroup'
import { Group } from 'components/monomerLibrary/monomerLibraryList/types'
import { useAppSelector } from 'hooks'
import { Button, IconName } from 'ketcher-react'
import { useState } from 'react'
import {
  MonomerCodeToGroup,
  MonomerGroupCodes,
  MonomerGroups
} from 'src/constants'
import { selectFilteredMonomers, selectMonomerGroups } from 'state/library'
import {
  DetailsContainer,
  RnaAccordionContainer,
  StyledAccordion
} from './styles'
import { Summary } from './Summary'

export const RnaAccordion = () => {
  const monomers = useAppSelector(selectFilteredMonomers)
  const groups = selectMonomerGroups(monomers)

  const [expandedAccordion, setExpandedAccordion] = useState<number | null>(
    null
  )

  const handleAccordionSummaryClick = (index: number) => {
    if (expandedAccordion === index) {
      setExpandedAccordion(null)
    } else setExpandedAccordion(index)
  }

  const groupsData = [
    {
      children: <Button>New Preset</Button>,
      groupName: 'Presets',
      iconName: 'preset',
      groups: [] as Group[]
    },
    {
      groupName: MonomerGroups.SUGARS,
      iconName: 'sugar',
      groups: groups.filter(
        (group) =>
          MonomerCodeToGroup[group.groupTitle as MonomerGroupCodes] ===
          MonomerGroups.SUGARS
      )
    },
    {
      groupName: MonomerGroups.BASES,
      iconName: 'base',
      groups: groups.filter(
        (group) =>
          MonomerCodeToGroup[group.groupTitle as MonomerGroupCodes] ===
          MonomerGroups.BASES
      )
    },
    {
      groupName: MonomerGroups.PHOSPHATES,
      iconName: 'phosphate',
      groups: groups.filter(
        (group) =>
          MonomerCodeToGroup[group.groupTitle as MonomerGroupCodes] ===
          MonomerGroups.PHOSPHATES
      )
    }
  ]

  return (
    <RnaAccordionContainer>
      {groupsData.map((u, i) => {
        const expanded = expandedAccordion === i
        const quantity = u.groups.reduce(
          (acc, group) => acc + group.groupItems.length,
          0
        )
        const summary = (
          <Summary
            iconName={u.iconName as IconName}
            groupName={u.groupName}
            quantity={quantity}
            expanded={expanded}
          />
        )
        const details = (
          <DetailsContainer>
            {u.children}
            {u.groups.map(({ groupItems, groupTitle }) => {
              return (
                <MonomerGroup
                  key={groupTitle}
                  title={u.groups.length > 1 ? groupTitle : undefined}
                  items={groupItems}
                />
              )
            })}
          </DetailsContainer>
        )
        return (
          <StyledAccordion
            key={u.groupName}
            summary={summary}
            details={details}
            expanded={expanded}
            onSummaryClick={() => handleAccordionSummaryClick(i)}
          />
        )
      })}
    </RnaAccordionContainer>
  )
}
