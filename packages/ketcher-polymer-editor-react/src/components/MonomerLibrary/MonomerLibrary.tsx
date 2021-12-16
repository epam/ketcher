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
import { MonomerItem } from './components/MonomerItem'
import Tabs from '../shared/ui/Tabs'

const MonomerLibrary = () => {
  const MonomerList = (props) => {
    return props.list.map((monomer, key) => {
      return <MonomerItem key={key} item={monomer} />
    })
  }

  const testList = [{ name: 'H' }, { name: 'L' }]

  const tabs = [
    {
      caption: '✩',
      component: MonomerList,
      props: { list: testList }
    },
    {
      caption: 'Peptides',
      component: MonomerList,
      props: { list: testList }
    },
    {
      caption: 'RNA',
      component: MonomerList,
      props: { list: testList }
    },
    {
      caption: 'CHEM',
      component: MonomerList,
      props: { list: testList }
    }
  ]

  //     props: {
  //         className: 'generic-groups',
  //         selected: this.selected,
  //         onSelect: this.onSelect
  //     }

  return (
    <>
      <Tabs
        // className={classes.tabs}
        // contentClassName={classes.tabs_content}
        captions={tabs}
        // tabIndex={type !== 'gen' ? 0 : 1}
        changeTab={() => {}}
        tabs={tabs}
      />
    </>
  )
}

export { MonomerLibrary }
