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

import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from '@mui/material';
import { Settings } from 'ketcher-core';
import { FIELD_GROUPS } from './fieldGroups';
import { SettingsFields } from './SettingsFields';

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
  return (
    <div>
      {FIELD_GROUPS.map((group) => (
        <Accordion
          key={group.id}
          expanded={expandedGroups.includes(group.id)}
          onChange={() => onGroupToggle(group.id)}
        >
          <AccordionSummary
            aria-controls={`${group.id}-content`}
            id={`${group.id}-header`}
          >
            <Typography>{group.title}</Typography>
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
