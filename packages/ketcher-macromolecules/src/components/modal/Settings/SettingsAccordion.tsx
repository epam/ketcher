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

import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { Settings } from 'ketcher-core';
import { FIELD_GROUPS } from './fieldGroups';
import { SettingsFields } from './SettingsFields';
import { Icon } from 'ketcher-react';
import {
  AccordionHeader,
  GroupLabel,
  ChangeIndicator,
} from './SettingsAccordion.styles';

interface SettingsAccordionProps {
  settings: Settings;
  onChange: (partial: Partial<Settings>) => void;
  expandedGroups: string[];
  onGroupToggle: (groupId: string) => void;
}

export const SettingsAccordion = ({
  settings,
  onChange,
  expandedGroups,
  onGroupToggle,
}: SettingsAccordionProps) => {
  // Detect if any field in a group has changed (simplified - could enhance later)
  const hasGroupChanged = (_group) => {
    // For now, always show as not changed - can implement proper change detection later
    return false;
  };

  return (
    <div>
      {FIELD_GROUPS.map((group) => (
        <Accordion
          key={group.id}
          expanded={expandedGroups.includes(group.id)}
          onChange={() => onGroupToggle(group.id)}
          data-testid={`${group.title}-accordion`}
        >
          <AccordionSummary
            aria-controls={`${group.id}-content`}
            id={`${group.id}-header`}
          >
            <AccordionHeader>
              <GroupLabel>
                <Icon name="elements-group" />
                <span>{group.title}</span>
              </GroupLabel>
              {hasGroupChanged(group) && <ChangeIndicator />}
            </AccordionHeader>
          </AccordionSummary>
          <AccordionDetails>
            <SettingsFields
              fields={group.fields}
              settings={settings}
              onChange={onChange}
            />
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  );
};
