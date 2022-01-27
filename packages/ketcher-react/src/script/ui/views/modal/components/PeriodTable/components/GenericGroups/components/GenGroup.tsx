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

// @TODO This is temporary just to get type, change !!
import { Generics } from 'ketcher-core'

import GenSet from './components'
import classes from './GenGroup.module.less'
import clsx from 'clsx'

const viewSchema = {
  atom: {
    caption: 'Atom Generics',
    order: ['any', 'no-carbon', 'metal', 'halogen']
  },
  group: {
    caption: 'Group Generics',
    order: ['acyclic', 'cyclic']
  },
  special: {
    caption: 'Special Nodes',
    order: []
  },
  'group/acyclic': {
    caption: 'Acyclic',
    order: ['carbo', 'hetero']
  },
  'group/cyclic': {
    caption: 'Cyclic',
    order: ['no-carbon', 'carbo', 'hetero']
  },
  'group/acyclic/carbo': {
    caption: 'Carbo',
    order: ['alkynyl', 'alkyl', 'alkenyl']
  },
  'group/acyclic/hetero': {
    caption: 'Hetero',
    order: ['alkoxy']
  },
  'group/cyclic/carbo': {
    caption: 'Carbo',
    order: ['aryl', 'cycloalkyl', 'cycloalkenyl']
  },
  'group/cyclic/hetero': {
    caption: 'Hetero',
    order: ['aryl']
  },
  'atom/any': 'any atom',
  'atom/no-carbon': 'except C or H',
  'atom/metal': 'any metal',
  'atom/halogen': 'any halogen',
  'group/cyclic/no-carbon': 'no carbon',
  'group/cyclic/hetero/aryl': 'hetero aryl'
}

type GenGroupProps = {
  gen: typeof Generics
  name: string
  path?: string
  selected: (label: string) => boolean
  onSelect: (label: string) => void
}

function GenGroup({ gen, name, path, selected, onSelect }: GenGroupProps) {
  const group = gen[name]
  const pk = path ? `${path}/${name}` : name
  const schema = viewSchema[pk]

  return schema && schema.caption ? (
    <fieldset className={clsx(classes[name], classes.fieldset)}>
      <legend>{schema.caption}</legend>
      {group.labels ? (
        <GenSet
          labels={group.labels}
          selected={selected}
          onSelect={onSelect}
          className={classes.subgroup}
        />
      ) : null}
      {schema.order.map(
        (
          child, // TODO:order = Object.keys ifndef
          index
        ) => (
          <GenGroup
            key={index}
            gen={group}
            name={child}
            path={pk}
            selected={selected}
            onSelect={onSelect}
          />
        )
      )}
    </fieldset>
  ) : (
    <GenSet
      labels={group.labels}
      caption={schema || name}
      className={classes[name]}
      selected={selected}
      onSelect={onSelect}
    />
  )
}

export default GenGroup
