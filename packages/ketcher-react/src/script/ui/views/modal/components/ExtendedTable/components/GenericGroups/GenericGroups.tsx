/****************************************************************************
 * Copyright 2022 EPAM Systems
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

import { HorizontalBoxWithLines, VerticalBoxWithLines } from './BoxWithLines'

import { GenGroup } from './GenGroup'
import { Generics } from 'ketcher-core'
import classes from './GenericGroups.module.less'
import { groupNames } from './'

type GenericGroupsProps = {
  selected: (label: string) => boolean
  onAtomSelect: (label: string, activateImmediately: boolean) => void
}

const getGenericsGroupsMap = (tree) => {
  let newGroups = {}
  for (const groupName of Object.keys(tree)) {
    newGroups[groupName] = { ...tree[groupName] }
    if (newGroups[groupName]?.subGroups) {
      newGroups = {
        ...newGroups,
        ...getGenericsGroupsMap(newGroups[groupName].subGroups)
      }
    }
  }
  return newGroups
}

const renderGenGroupComponent = (group, selected, onAtomSelect) => (
  <GenGroup
    group={groupsMap[group]}
    selected={selected}
    onAtomSelect={onAtomSelect}
  />
)

const groupsMap = getGenericsGroupsMap(Generics)

function GenericGroups({ selected, onAtomSelect }: GenericGroupsProps) {
  return (
    <div className={classes.genericGroups}>
      <div className={classes.topGroupsContainer}>
        {renderGenGroupComponent(groupNames.atomsGen, selected, onAtomSelect)}
        {renderGenGroupComponent(
          groupNames.specialNodes,
          selected,
          onAtomSelect
        )}
      </div>
      {renderGenGroupComponent(groupNames.groupGen, selected, onAtomSelect)}
      <HorizontalBoxWithLines />
      <div className={classes.groupGenerics}>
        <div>
          {renderGenGroupComponent(
            groupNames.groupAcyclic,
            selected,
            onAtomSelect
          )}
          <div className={classes.subgroupContainer}>
            <VerticalBoxWithLines />
            <div>
              {renderGenGroupComponent(
                groupNames.acyclicCarbo,
                selected,
                onAtomSelect
              )}
              {renderGenGroupComponent(
                groupNames.acyclicHetero,
                selected,
                onAtomSelect
              )}
            </div>
          </div>
        </div>
        <div>
          {renderGenGroupComponent(
            groupNames.groupCyclic,
            selected,
            onAtomSelect
          )}
          <div className={classes.subgroupContainer}>
            <VerticalBoxWithLines />
            <div>
              {renderGenGroupComponent(
                groupNames.cyclicCarbo,
                selected,
                onAtomSelect
              )}
              {renderGenGroupComponent(
                groupNames.cyclicHetero,
                selected,
                onAtomSelect
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GenericGroups
