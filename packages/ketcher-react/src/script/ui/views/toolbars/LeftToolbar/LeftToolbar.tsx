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
import React from 'react'
import { useMediaQuery } from 'react-responsive'

import {
  ToolbarGroupItem,
  ToolbarGroupItemCallProps,
  ToolbarGroupItemProps
} from '../ToolbarGroupItem'

import classes from './LeftToolbar.module.less'

interface LeftToolbarProps
  extends Omit<ToolbarGroupItemProps, 'id' | 'options' | 'Component' | 'tool'> {
  className?: string
  isStandalone: boolean
}

interface LeftToolbarCallProps extends ToolbarGroupItemCallProps {}

type Props = LeftToolbarProps & LeftToolbarCallProps

const LeftToolbar = (props: Props) => {
  const { isStandalone, className, ...rest } = props
  const collapseTransform = useMediaQuery({ query: '(max-height: 800px)' })
  const collapseRGroup = useMediaQuery({ query: '(max-height: 850px)' })

  return (
    <div className={clsx(classes.root, className)}>
      <div className={classes.group}>
        <ToolbarGroupItem
          id="select"
          options={[
            {
              id: 'select-lasso'
            },
            {
              id: 'select-rectangle'
            },
            {
              id: 'select-fragment'
            }
          ]}
          {...rest}
        />
        <ToolbarGroupItem id="erase" {...rest} />
      </div>

      <div className={classes.group}>
        <ToolbarGroupItem
          id="bond-common"
          options={[
            {
              id: 'bond-single'
            },
            {
              id: 'bond-double'
            },
            {
              id: 'bond-triple'
            }
          ]}
          {...rest}
        />

        <ToolbarGroupItem
          id="bond-stereo"
          options={[
            {
              id: 'bond-up'
            },
            {
              id: 'bond-down'
            },
            {
              id: 'bond-updown'
            },
            {
              id: 'bond-crossed'
            }
          ]}
          {...rest}
        />

        <ToolbarGroupItem
          id="bond-query"
          options={[
            {
              id: 'bond-any'
            },
            {
              id: 'bond-aromatic'
            },
            {
              id: 'bond-singledouble'
            },
            {
              id: 'bond-singlearomatic'
            },
            {
              id: 'bond-doublearomatic'
            }
          ]}
          {...rest}
        />

        <ToolbarGroupItem id="chain" {...rest} />
      </div>

      <div className={classes.group}>
        <ToolbarGroupItem id="charge-plus" {...rest} />
        <ToolbarGroupItem id="charge-minus" {...rest} />
      </div>

      <div className={classes.group}>
        {collapseTransform ? (
          <ToolbarGroupItem
            id="transform-rotate"
            options={[
              {
                id: 'transform-rotate'
              },
              {
                id: 'transform-flip-h'
              },
              {
                id: 'transform-flip-v'
              }
            ]}
            {...rest}
          />
        ) : (
          <>
            <ToolbarGroupItem id="transform-rotate" {...rest} />
            <ToolbarGroupItem id="transform-flip-h" {...rest} />
            <ToolbarGroupItem id="transform-flip-v" {...rest} />
          </>
        )}
      </div>

      <div className={classes.group}>
        <ToolbarGroupItem id="sgroup" {...rest} />
        <ToolbarGroupItem id="sgroup-data" {...rest} />
        <ToolbarGroupItem
          id="reaction"
          options={[
            {
              id: 'reaction-arrow'
            },
            {
              id: 'reaction-plus'
            },
            {
              id: 'reaction-automap'
            },
            {
              id: 'reaction-map'
            },
            {
              id: 'reaction-unmap'
            }
          ]}
          {...rest}
        />
      </div>

      <div className={clsx(classes.group, classes.rGroup)}>
        {collapseRGroup ? (
          <ToolbarGroupItem
            id="rgroup-label"
            options={[
              {
                id: 'rgroup-label'
              },
              {
                id: 'rgroup-fragment'
              },
              {
                id: 'rgroup-attpoints'
              }
            ]}
            {...rest}
          />
        ) : (
          <>
            <ToolbarGroupItem id="rgroup-label" {...rest} />
            <ToolbarGroupItem id="rgroup-fragment" {...rest} />
            <ToolbarGroupItem id="rgroup-attpoints" {...rest} />
          </>
        )}
      </div>

      {isStandalone ? null : (
        <div className={classes.group}>
          <ToolbarGroupItem id="shape-circle" {...rest} />
          <ToolbarGroupItem id="shape-rectangle" {...rest} />
          <ToolbarGroupItem id="shape-line" {...rest} />
        </div>
      )}
    </div>
  )
}

export type { LeftToolbarProps, LeftToolbarCallProps }
export { LeftToolbar }
