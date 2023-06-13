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

import { BaseCallProps, BaseProps } from '../../../modal.types'

import Form, { Field } from '../../../../../component/form/form/form'
import { FC, useCallback, useState } from 'react'

import { Dialog } from '../../../../components'
import ElementNumber from './ElementNumber'
import { Elements } from 'ketcher-core'
import { atom as atomSchema } from '../../../../../data/schema/struct-schema'
import { capitalize } from 'lodash/fp'
import classes from './Atom.module.less'
import Select from '../../../../../component/form/Select'
import { getSelectOptionsFromSchema } from '../../../../../utils'
import clsx from 'clsx'
import { Icon } from 'src/components'

interface AtomProps extends BaseCallProps, BaseProps {
  alias: string
  charge: string
  exactChangeFlag: boolean
  explicitValence: number
  hCount: number
  invRet: number
  isotope: number
  label: string
  radical: number
  ringBondCount: number
  stereoParity: number
  substitutionCount: number
  unsaturatedAtom: boolean
}

type Props = AtomProps & {
  isMultipleAtoms?: boolean
}

const atomProps = atomSchema.properties

const Atom: FC<Props> = (props: Props) => {
  const { formState, stereoParity, isMultipleAtoms = false, ...rest } = props
  const [currentLabel, setCurrentLabel] = useState<string>(rest.label)
  const [expandedAccordions, setExpandedAccordions] = useState<string[]>([
    'General'
  ])

  const handleAccordionChange = (accordion) => () => {
    const isExpand = !expandedAccordions.includes(accordion)
    setExpandedAccordions(
      isExpand
        ? [...expandedAccordions, accordion]
        : [...expandedAccordions].filter(
            (expandedAccordion) => expandedAccordion !== accordion
          )
    )
  }

  const onLabelChangeCallback = useCallback((newValue) => {
    setCurrentLabel(newValue)
  }, [])

  const itemGroups = [
    {
      groupName: 'General',
      component: (
        <div>
          <Field name="label" onChange={onLabelChangeCallback} autoFocus />
          <ElementNumber label={currentLabel} />

          <Field name="alias" />

          <Field name="charge" maxLength="5" />
          <Field name="isotope" />

          <Field
            name="explicitValence"
            component={Select}
            options={getSelectOptionsFromSchema(atomProps.explicitValence)}
          />

          <Field
            name="radical"
            component={Select}
            options={getSelectOptionsFromSchema(atomProps.radical)}
          />
        </div>
      )
    },
    {
      groupName: 'Query specific',
      component: (
        <div className={classes.querySpecific}>
          <Field
            name="ringBondCount"
            component={Select}
            options={getSelectOptionsFromSchema(atomProps.ringBondCount)}
          />
          <Field
            name="hCount"
            component={Select}
            options={getSelectOptionsFromSchema(atomProps.hCount)}
          />
          <Field
            name="substitutionCount"
            component={Select}
            options={getSelectOptionsFromSchema(atomProps.substitutionCount)}
          />
          <Field
            name="unsaturatedAtom"
            labelPos="before"
            className={classes.checkbox}
          />
        </div>
      )
    },
    {
      groupName: 'Reaction flags',
      component: (
        <div className={classes.reactionFlags}>
          <Field
            name="invRet"
            component={Select}
            options={getSelectOptionsFromSchema(atomProps.invRet)}
          />
          <Field
            name="exactChangeFlag"
            labelPos="before"
            className={classes.checkbox}
          />
        </div>
      )
    }
  ]

  return (
    <Dialog
      title="Atom Properties"
      className={classes.atomProps}
      result={() => formState.result}
      valid={() => formState.valid}
      params={rest}
      buttonsNameMap={{ OK: 'Apply' }}
      buttons={['Cancel', 'OK']}
      withDivider
    >
      <Form
        schema={atomSchema}
        customValid={{
          label: (label) => atomValid(label, isMultipleAtoms),
          charge: (charge) => chargeValid(charge, isMultipleAtoms)
        }}
        init={rest}
        {...formState}
      >
        <div className={classes.accordionWrapper}>
          {itemGroups.map(({ groupName, component }) => {
            const shouldGroupBeRended = expandedAccordions.includes(groupName)
            return (
              <div key={groupName}>
                <div
                  onClick={handleAccordionChange(groupName)}
                  className={classes.accordionSummaryWrapper}
                >
                  <div className={classes.accordionSummary}>
                    <span>{groupName}</span>
                    <Icon
                      className={clsx({
                        [classes.expandIcon]: true,
                        [classes.turnedIcon]: !shouldGroupBeRended
                      })}
                      name="chevron"
                    />
                  </div>
                </div>
                <div
                  className={clsx({
                    [classes.accordionDetailsWrapper]: true,
                    [classes.hiddenAccordion]: !shouldGroupBeRended
                  })}
                >
                  <div className={classes.accordionDetails}>{component}</div>
                </div>
              </div>
            )
          })}
        </div>
      </Form>
    </Dialog>
  )
}

function atomValid(label: string, isMultipleAtoms: boolean) {
  const isChemicalElement = !!Elements.get(capitalize(label))
  if (isMultipleAtoms) {
    return label === '' || isChemicalElement
  }
  return label && isChemicalElement
}

function chargeValid(charge, isMultipleAtoms: boolean) {
  const regex = new RegExp(atomSchema.properties.charge.pattern)
  const result = regex.exec(charge)
  const isValidCharge = result && (result[1] === '' || result[3] === '')
  if (isMultipleAtoms) {
    return charge === '0' || charge === 0 || charge === '' || isValidCharge
  }
  return isValidCharge
}

export type { AtomProps }
export default Atom
