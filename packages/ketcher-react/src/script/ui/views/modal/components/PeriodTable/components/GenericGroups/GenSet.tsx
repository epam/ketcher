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

import clsx from 'clsx'
import type { GenItemSet } from 'ketcher-core'

import classes from './GenSet.module.less'

type GenSetProps = {
  labels: GenItemSet[]
  selected: (label: string) => boolean
  onSelect: (label: string) => void
  className?: string
}

function GenSet({ labels, selected, onSelect, className }: GenSetProps) {
  return (
    <>
      {labels.map((item, index) => {
        const buttons = item.items
        const caption = item.displayName

        return (
          <fieldset className={className} key={index}>
            {buttons.map((button, index) => (
              <button
                key={index}
                onClick={() => onSelect(button.label)}
                title={button.description || button.label}
                className={clsx(
                  {
                    [classes.selected]: selected(button.label)
                  },
                  classes.button
                )}
              >
                {button.label}
              </button>
            ))}
            <div className={classes.legendBox}>
              {caption ? <legend>{caption}</legend> : null}
            </div>
          </fieldset>
        )
      })}
    </>
  )
}

export { GenSet }
