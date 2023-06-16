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
import { ChangeEvent, useState } from 'react'
import { Tabs } from 'components/shared/Tabs'
import styled from '@emotion/styled'
import { tabsContent } from 'components/monomerLibrary/tabsContent'
import { useAppDispatch } from 'hooks'
import { setSearchFilter } from 'state/library'
import { Icon } from 'ketcher-react'

const MonomerLibraryContainer = styled.div(({ theme }) => ({
  width: '254px',
  height: 'calc(100% - 16px)',
  backgroundColor: theme.ketcher.color.background.primary,
  boxShadow: '0px 2px 5px rgba(103, 104, 132, 0.15)',
  display: 'flex',
  flexDirection: 'column',

  '&.hidden': {
    visibility: 'hidden'
  }
}))

const MonomerLibraryTitle = styled.h3(({ theme }) => ({
  margin: 0,
  padding: 0,
  fontSize: theme.ketcher.font.size.regular,
  fontWeight: theme.ketcher.font.weight.regular
}))

const MonomerLibraryHeader = styled.div(() => ({
  padding: '12px',
  position: 'relative'
}))

const MonomerLibrarySearch = styled.div(({ theme }) => ({
  padding: '12px 0',

  '& > div': {
    background: theme.ketcher.color.input.background.default,
    display: 'flex',
    height: '24px',
    flexDirection: 'row',
    border: '1px solid transparent',
    borderRadius: '4px',
    padding: '0 4px',

    '& > span': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },

    '&:has(input:focus)': {
      outline: `1px solid ${theme.ketcher.color.input.border.focus}`
    },

    '& > input': {
      background: 'transparent',
      border: 'none',
      padding: '0 0 0 8px',
      margin: 0,
      flex: 1,

      '&:focus': {
        outline: 'none'
      }
    }
  }
}))

const MonomerLibraryToggle = styled.div(({ theme }) => {
  return {
    margin: 0,
    fontSize: theme.ketcher.font.size.regular,
    color: theme.ketcher.color.text.secondary,
    position: 'absolute',
    cursor: 'pointer',
    top: '12px',
    right: '4px',
    visibility: 'visible',
    opacity: 1,
    whiteSpace: 'nowrap',
    display: 'flex',
    lineHeight: 1,
    padding: '5px 8px',
    borderRadius: '4px',
    userSelect: 'none',

    '& > span': {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',

      '&.icon': {
        marginRight: '2px'
      }
    },

    '.hidden &': {
      backgroundColor: theme.ketcher.color.button.primary.active,
      color: theme.ketcher.color.button.text.primary
    }
  }
})

const MonomerLibrary = () => {
  const [isHidden, setIsHidden] = useState(false)
  const dispatch = useAppDispatch()

  const toggleSidebar = () => {
    setIsHidden(!isHidden)
  }

  const filterResults = (event: ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchFilter(event.target.value))
  }

  return (
    <MonomerLibraryContainer className={isHidden ? 'hidden' : 'shown'}>
      <MonomerLibraryHeader>
        <MonomerLibraryTitle>Library</MonomerLibraryTitle>
        <MonomerLibraryToggle>
          <span className="icon">
            {isHidden ? (
              <Icon name="arrows-left" />
            ) : (
              <Icon name="arrows-right" />
            )}
          </span>
          <span onClick={toggleSidebar}>
            {isHidden ? 'Show Library' : 'Hide'}
          </span>
        </MonomerLibraryToggle>
        <MonomerLibrarySearch>
          <div>
            <span>
              <Icon name="search" />
            </span>
            <input
              onInput={filterResults}
              placeholder="Search by name..."
              type="text"
            />
          </div>
        </MonomerLibrarySearch>
      </MonomerLibraryHeader>
      <Tabs tabs={tabsContent} />
    </MonomerLibraryContainer>
  )
}

export { MonomerLibrary }
