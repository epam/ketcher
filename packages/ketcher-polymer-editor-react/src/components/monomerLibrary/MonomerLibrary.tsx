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

import { css } from '@emotion/react'

import { MonomerItem } from './monomerLibraryItem/MonomerItem'
import { Tabs } from 'components/shared/ui/Tabs'
import { COLORS } from '../../styles/variables'
import { scrollbarThin } from '../../styles/mixins'

interface MonomerListPropTypes {
  list: Array<Record<string, string>>
}

const monomerItemHandleClick = () => {
  console.log('callback for monomer item')
}

const MonomerLibrary = () => {
  const MonomerList = (props: MonomerListPropTypes) => {
    return props.list.map((monomer, key) => {
      return (
        <MonomerItem
          key={key}
          item={monomer}
          onClick={monomerItemHandleClick}
        />
      )
    })
  }

  const tabs = [
    {
      caption: '✩',
      component: MonomerList,
      props: { list: [{ name: 'S' }] }
    },
    {
      caption: 'Peptides',
      component: MonomerList,
      props: { list: [{ name: 'P' }] }
    },
    {
      caption: 'RNA',
      component: MonomerList,
      props: { list: [{ name: 'R' }, { name: 'N' }, { name: 'A' }] }
    },
    {
      caption: 'CHEM',
      component: MonomerList,
      props: {
        list: [
          { name: 'C' },
          { name: 'H' },
          { name: 'E' },
          { name: 'M' },
          { name: 'C' },
          { name: 'H' },
          { name: 'E' },
          { name: 'M' }
        ]
      }
    }
  ]

  const styleContainer = css({
    position: 'absolute',
    width: 'fit-content',
    height: '700px',
    backgroundColor: COLORS.background.white
  })

  const styleTabs = {
    listStyleType: 'none',
    margin: 0,
    padding: 0
  }

  const styleContent = css({
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    overflowY: 'scroll',
    width: '260px',

    '& > *': {
      margin: '25px 8px'
    },

    ...scrollbarThin
  })

  return (
    <div css={styleContainer}>
      <Tabs tabsStyle={styleTabs} contentStyle={styleContent} tabs={tabs} />
    </div>
  )
}

export { MonomerLibrary }
