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

import React, { useState } from 'react'
import classes from './Accordion.module.less'
import clsx from 'clsx'
import { Icon } from 'components'

const Accordion = ({ tabs, className, changedGroups }): React.ReactElement => {
  const [expandedAccordions, setExpandedAccordions] = useState<string[]>([
    'General'
  ])

  const handleAccordionChange = (accordion) => () => {
    const isExpand = !expandedAccordions.includes(accordion)
    setExpandedAccordions(
      isExpand
        ? [...expandedAccordions, accordion]
        : [...expandedAccordions].filter(
            (expandedAccordion) => expandedAccordion !== accordion
          )
    )
  }

  return (
    <div className={clsx(classes.accordionWrapper, className)}>
      {tabs.map(({ label, content, key }) => {
        const shouldGroupBeRended = expandedAccordions.includes(label)
        return (
          <div key={key}>
            <div
              onClick={handleAccordionChange(label)}
              className={classes.accordionSummaryWrapper}
            >
              <div className={classes.accordionSummary}>
                <Icon
                  className={clsx({
                    [classes.expandIcon]: true,
                    [classes.turnedIcon]: !shouldGroupBeRended
                  })}
                  name="chevron"
                />
                <div className={classes.groupLabel}>
                  <Icon name="elements-group" className={classes.groupIcon} />
                  <span>{label}</span>
                </div>
                {changedGroups.has(label) && (
                  <span className={classes.changeMarker}></span>
                )}
              </div>
            </div>
            <div
              className={clsx({
                [classes.accordionDetailsWrapper]: true,
                [classes.hiddenAccordion]: !shouldGroupBeRended
              })}
            >
              <div className={classes.accordionDetails}>{content}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default Accordion
