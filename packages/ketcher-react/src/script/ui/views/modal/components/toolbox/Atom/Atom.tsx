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
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Icon from '../../../../../component/view/icon'

interface AtomProps extends BaseProps {
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

type Props = AtomProps & BaseCallProps

const atomProps = atomSchema.properties

const Atom: FC<Props> = (props) => {
  const { formState, stereoParity, ...rest } = props
  const [currentLabel, setCurrentLabel] = useState<string>(rest.label)
  const [expandedAccordion, setExpandedAccordion] = useState<string>('General')

  const handleAccordionChange = (accordion) => () =>
    setExpandedAccordion(accordion)

  const onLabelChangeCallback = useCallback((newValue) => {
    setCurrentLabel(newValue)
  }, [])

  const itemGroups = [
    {
      groupName: 'General',
      component: (
        <>
          <div className={classes.propertiesRow}>
            <Field name="label" onChange={onLabelChangeCallback} autoFocus />
            <ElementNumber label={currentLabel} />
          </div>
          <Field name="alias" />
          <div className={classes.propertiesRow}>
            <Field name="charge" maxLength="5" />
            <Field name="isotope" />
          </div>
          <div className={classes.propertiesRow}>
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
        </>
      )
    },
    {
      groupName: 'Query specific',
      component: (
        <>
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
            labelPos="after"
            className={classes.checkbox}
          />
        </>
      )
    },
    {
      groupName: 'Reaction flags',
      component: (
        <>
          <Field
            name="invRet"
            component={Select}
            options={getSelectOptionsFromSchema(atomProps.invRet)}
          />
          <Field
            name="exactChangeFlag"
            labelPos="after"
            className={classes.checkbox}
          />
        </>
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
          label: (label) => atomValid(label),
          charge: (charge) => chargeValid(charge)
        }}
        init={rest}
        {...formState}
      >
        {itemGroups.map(({ groupName, component }) => {
          const shouldGroupBeRended = expandedAccordion === groupName
          return (
            <Accordion
              square={true}
              key={groupName}
              onChange={handleAccordionChange(groupName)}
              expanded={shouldGroupBeRended}
              classes={{
                root: classes.accordion,
                expanded: classes.expandedAccordion
              }}
            >
              <AccordionSummary
                className={classes.accordionSummary}
                expandIcon={
                  <Icon className={classes.expandIcon} name="chevron" />
                }
              >
                {groupName}
              </AccordionSummary>
              <AccordionDetails className={classes.accordionDetails}>
                {component}
              </AccordionDetails>
            </Accordion>
          )
        })}
      </Form>
    </Dialog>
  )
}

function atomValid(label) {
  return label && !!Elements.get(capitalize(label))
}

function chargeValid(charge) {
  const regex = new RegExp(atomSchema.properties.charge.pattern)
  const result = regex.exec(charge)
  return result && (result[1] === '' || result[3] === '')
}

export type { AtomProps }
export default Atom
