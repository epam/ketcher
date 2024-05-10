/****************************************************************************
 * Copyright 2023 EPAM Systems
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

import { HorizontalBoxWithLines, VerticalBoxWithLines } from './BoxWithLines';

import { GenGroup } from './GenGroup';
import { Generics } from 'ketcher-core';
import classes from './GenericGroups.module.less';
import { groupNames } from './';

type GenericGroupsProps = {
  selected: (label: string) => boolean;
  onAtomSelect: (label: string, activateImmediately: boolean) => void;
  disabledQueryElements: Array<string> | null;
};

const getGenericsGroupsMap = (tree) => {
  let newGroups = {};
  for (const groupName of Object.keys(tree)) {
    newGroups[groupName] = { ...tree[groupName] };
    if (newGroups[groupName]?.subGroups) {
      newGroups = {
        ...newGroups,
        ...getGenericsGroupsMap(newGroups[groupName].subGroups),
      };
    }
  }
  return newGroups;
};

const groupsMap = getGenericsGroupsMap(Generics);

const renderGenGroupComponent = (
  group,
  selected,
  onAtomSelect,
  disabledQueryElements,
) => (
  <GenGroup
    group={groupsMap[group]}
    selected={selected}
    onAtomSelect={onAtomSelect}
    disabledQueryElements={disabledQueryElements}
  />
);

function GenericGroups({
  selected,
  onAtomSelect,
  disabledQueryElements,
}: GenericGroupsProps) {
  return (
    <div className={classes.genericGroups}>
      <div className={classes.topGroupsContainer}>
        {renderGenGroupComponent(
          groupNames.atomsGen,
          selected,
          onAtomSelect,
          disabledQueryElements,
        )}
        {renderGenGroupComponent(
          groupNames.specialNodes,
          selected,
          onAtomSelect,
          disabledQueryElements,
        )}
      </div>
      {renderGenGroupComponent(
        groupNames.groupGen,
        selected,
        onAtomSelect,
        disabledQueryElements,
      )}
      <HorizontalBoxWithLines />
      <div className={classes.groupGenerics}>
        <div>
          {renderGenGroupComponent(
            groupNames.groupAcyclic,
            selected,
            onAtomSelect,
            disabledQueryElements,
          )}
          <div className={classes.subgroupContainer}>
            <VerticalBoxWithLines />
            <div>
              {renderGenGroupComponent(
                groupNames.acyclicCarbo,
                selected,
                onAtomSelect,
                disabledQueryElements,
              )}
              {renderGenGroupComponent(
                groupNames.acyclicHetero,
                selected,
                onAtomSelect,
                disabledQueryElements,
              )}
            </div>
          </div>
        </div>
        <div>
          {renderGenGroupComponent(
            groupNames.groupCyclic,
            selected,
            onAtomSelect,
            disabledQueryElements,
          )}
          <div className={classes.subgroupContainer}>
            <VerticalBoxWithLines />
            <div>
              {renderGenGroupComponent(
                groupNames.cyclicCarbo,
                selected,
                onAtomSelect,
                disabledQueryElements,
              )}
              {renderGenGroupComponent(
                groupNames.cyclicHetero,
                selected,
                onAtomSelect,
                disabledQueryElements,
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GenericGroups;
