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

import { type ReactNode, useState } from 'react';
import clsx from 'clsx';
import { Icon } from 'components';
import classes from './SettingsPanel.module.less';

export interface SettingsGroup {
  key: string;
  label: string;
  content: ReactNode;
}

export interface SettingsAccordionProps {
  groups: SettingsGroup[];
  /** Group keys expanded on open. More than one group may be expanded at a time. */
  defaultExpandedGroups?: string[];
  className?: string;
}

const SettingsAccordion = ({
  groups,
  defaultExpandedGroups = ['atoms'],
  className,
}: SettingsAccordionProps) => {
  const [expandedGroups, setExpandedGroups] = useState<string[]>(
    defaultExpandedGroups,
  );

  const toggleGroup = (key: string) => () =>
    setExpandedGroups((expanded) =>
      expanded.includes(key)
        ? expanded.filter((expandedKey) => expandedKey !== key)
        : [...expanded, key],
    );

  return (
    <div className={clsx(classes.accordion, className)}>
      {groups.map(({ key, label, content }) => {
        const isExpanded = expandedGroups.includes(key);

        return (
          <div className={classes.accordionSection} key={key}>
            <button
              type="button"
              className={classes.sectionHeader}
              onClick={toggleGroup(key)}
              aria-expanded={isExpanded}
              data-testid={`${label}-accordion`}
            >
              <span className={classes.sectionLabel}>{label}</span>
              <Icon
                name="chevron"
                className={clsx(classes.chevron, {
                  [classes.chevronExpanded]: isExpanded,
                })}
              />
            </button>
            {isExpanded && (
              <div className={classes.sectionContent}>{content}</div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SettingsAccordion;
