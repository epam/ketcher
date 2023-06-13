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
import { EmptyFunction } from 'helpers'
import { useAppDispatch } from 'hooks'
import { useRef, useState } from 'react'
import { toggleMonomerFavorites } from 'state/library'
import { Card } from './styles'
import { IMonomerItemProps } from './types'

const MonomerItem = ({
  item,
  onMouseLeave,
  onMouseMove,
  onClick = EmptyFunction
}: IMonomerItemProps) => {
  const [favorite, setFavorite] = useState(item.favorite)
  const portalRef = useRef<HTMLDivElement>(null)
  const dispatch = useAppDispatch()

  return (
    <Card
      onClick={onClick}
      code={item.props.MonomerNaturalAnalogCode}
      data-testid={item.props.MonomerNaturalAnalogCode}
      onMouseLeave={onMouseLeave}
      onMouseMove={onMouseMove}
      ref={portalRef}
    >
      <span>{item.label}</span>
      <div
        onClick={(event) => {
          event.stopPropagation()
          setFavorite(!favorite)
          dispatch(toggleMonomerFavorites(item))
        }}
        className={`star ${favorite ? 'visible' : ''}`}
      >
        ★
      </div>
    </Card>
  )
}

export { MonomerItem }
