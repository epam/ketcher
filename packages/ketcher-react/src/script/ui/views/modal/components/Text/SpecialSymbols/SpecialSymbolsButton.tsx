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

import { useState } from 'react'
import { SpecialSymbolsList } from '../SpecialSymbolsList/SpecialSymbolsList'
import classes from './SpecialSymbolsButton.module.less'
import Icon from '../../../../../component/view/icon'

export interface SpecialSymbolsButtonProps {
  select: (symbol: string) => void
}

const SpecialSymbolsButton = ({ select }: SpecialSymbolsButtonProps) => {
  const [showSpecialSymbols, setShowSpecialSymbols] = useState(false)

  const handleClose = event => {
    event.stopPropagation()
    event.preventDefault()
    setShowSpecialSymbols(false)
  }
  const handleOpen = () => {
    setShowSpecialSymbols(true)
  }
  const closeSymbolsList = event => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      handleClose(event)
    }
  }
  return (
    <div onBlur={closeSymbolsList}>
      <button
        title="symbols"
        onClick={handleOpen}
        className={classes.textButton}
      >
        <Icon name="symbols" />
        {showSpecialSymbols && (
          <SpecialSymbolsList hideMenu={handleClose} select={select} />
        )}
      </button>
    </div>
  )
}

export { SpecialSymbolsButton }
