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

import classes from './GenSet.module.less'
import clsx from 'clsx'

type GenSetProps = {
  labels: string[]
  selected: (label: string) => boolean
  onSelect: (label: string) => void
  caption?: string
  className?: string
}

function GenSet({
  labels,
  caption = '',
  selected,
  onSelect,
  className
}: GenSetProps) {
  return (
    <fieldset className={className}>
      {labels.map((label, index) => (
        <button
          key={index}
          onClick={() => onSelect(label)}
          className={clsx(
            {
              [classes.selected]: selected(label)
            },
            classes.button
          )}>
          {label}
        </button>
      ))}
      {caption ? <legend>{caption}</legend> : null}
    </fieldset>
  )
}

export default GenSet
