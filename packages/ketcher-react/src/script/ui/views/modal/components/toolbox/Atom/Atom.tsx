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

import { BaseCallProps, BaseProps } from '../../../modal.types';

import Form, {
  Field,
  CustomQueryField,
} from '../../../../../component/form/form/form';
import { FC, useMemo, useState } from 'react';

import { Dialog } from '../../../../components';
import { AtomAllAttributeName, getAtomCustomQuery } from 'ketcher-core';
import { atom as atomSchema } from '../../../../../data/schema/struct-schema';
import classes from './Atom.module.less';
import Select from '../../../../../component/form/Select';
import { getSelectOptionsFromSchema } from '../../../../../utils';
import clsx from 'clsx';
import { Icon } from 'components';
import {
  AtomListValid,
  atomValid,
  chargeValid,
  customQueryValid,
  pseudoAtomValid,
} from './helper';
import AtomElement from './AtomElement/AtomElement';

interface AtomProps extends BaseCallProps, BaseProps {
  alias: string;
  charge: string;
  exactChangeFlag: boolean;
  explicitValence: number;
  hCount: number;
  invRet: number;
  isotope: number;
  label: string;
  radical: number;
  ringBondCount: number;
  stereoParity: number;
  substitutionCount: number;
  unsaturatedAtom: boolean;
  customQuery: string;
}

type Props = AtomProps & {
  isMultipleAtoms?: boolean;
  isRestoredModal: boolean;
};

const atomProps = atomSchema.properties;
const querySpecificFields: Array<{
  name: AtomAllAttributeName;
  component?: 'dropdown';
  labelPos?: 'before' | 'after';
  className?: string;
}> = [
  { name: 'ringBondCount', component: 'dropdown' },
  { name: 'hCount', component: 'dropdown' },
  { name: 'substitutionCount', component: 'dropdown' },
  { name: 'unsaturatedAtom', labelPos: 'before', className: classes.checkbox },
  { name: 'aromaticity', component: 'dropdown' },
  { name: 'implicitHCount', component: 'dropdown' },
  { name: 'ringMembership', component: 'dropdown' },
  { name: 'ringSize', component: 'dropdown' },
  { name: 'connectivity', component: 'dropdown' },
  { name: 'chirality', component: 'dropdown' },
];

const Atom: FC<Props> = (props: Props) => {
  const {
    formState,
    /* eslint-disable @typescript-eslint/no-unused-vars */
    stereoParity,
    /* eslint-enable @typescript-eslint/no-unused-vars */
    isMultipleAtoms = false,
    isRestoredModal,
    ...rest
  } = props;
  const [isCustomQuery, setIsCustomQuery] = useState(Boolean(rest.customQuery));
  const [expandedAccordions, setExpandedAccordions] = useState<string[]>(
    isCustomQuery ? [] : ['General'],
  );
  const handleAccordionChange = (accordion) => () => {
    if (isCustomQuery) return;
    const isExpand = !expandedAccordions.includes(accordion);
    setExpandedAccordions(
      isExpand
        ? [...expandedAccordions, accordion]
        : [...expandedAccordions].filter(
            (expandedAccordion) => expandedAccordion !== accordion,
          ),
    );
  };

  const handleCustomQueryCheckBoxChange = (
    value: boolean,
    formState,
    setCustomQuery: (value: string) => void,
  ) => {
    const query = value ? getAtomCustomQuery(formState) : '';
    setCustomQuery(query);
    setIsCustomQuery(value);
    setExpandedAccordions([]);
  };

  const customValid = useMemo(() => {
    const atomType = formState.result.atomType;
    return {
      label: (label: string) =>
        atomValid(label, isMultipleAtoms, atomType, isCustomQuery),
      pseudo: (value: string) =>
        pseudoAtomValid(value, atomType, isCustomQuery),
      atomList: (value: string) =>
        AtomListValid(value, atomType, isCustomQuery),
      charge: (charge) => chargeValid(charge, isMultipleAtoms, isCustomQuery),
      customQuery: (value: string) => customQueryValid(value, isCustomQuery),
    };
  }, [formState.result.atomType, isCustomQuery, isMultipleAtoms]);

  const itemGroups = [
    {
      groupName: 'General',
      component: (
        <div>
          <AtomElement formState={formState} className=""></AtomElement>
          <Field name="alias" />
          <Field name="charge" maxLength={atomProps.charge.maxLength} />
          <Field name="isotope" maxLength={atomProps.isotope.maxLength} />
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
      ),
    },
    {
      groupName: 'Query specific',
      component: (
        <div className={classes.querySpecific}>
          {querySpecificFields.map((field) => {
            if (field.component === 'dropdown') {
              return (
                <Field
                  key={field.name}
                  name={field.name}
                  component={Select}
                  options={getSelectOptionsFromSchema(atomProps[field.name])}
                  data-testId={field.name}
                />
              );
            } else {
              return <Field key={field.name} {...field} />;
            }
          })}
        </div>
      ),
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
      ),
    },
  ];

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
        customValid={customValid}
        init={isRestoredModal ? null : rest}
        {...formState}
      >
        <div className={classes.accordionWrapper}>
          {itemGroups.map(({ groupName, component }) => {
            const shouldGroupBeRended = expandedAccordions.includes(groupName);
            return (
              <div key={groupName} data-testid={`${groupName}-section`}>
                <div
                  onClick={handleAccordionChange(groupName)}
                  className={classes.accordionSummaryWrapper}
                  aria-disabled={isCustomQuery}
                >
                  <div className={classes.accordionSummary}>
                    <span>{groupName}</span>
                    <Icon
                      className={clsx({
                        [classes.expandIcon]: true,
                        [classes.turnedIcon]: !shouldGroupBeRended,
                      })}
                      name="chevron"
                    />
                  </div>
                </div>
                <div
                  className={clsx({
                    [classes.accordionDetailsWrapper]: true,
                    [classes.hiddenAccordion]: !shouldGroupBeRended,
                  })}
                >
                  <div className={classes.accordionDetails}>{component}</div>
                </div>
              </div>
            );
          })}
          <div className={classes.customQueryWrapper}>
            <CustomQueryField
              name="customQuery"
              labelPos="after"
              className={classes.checkbox}
              disabled={!isCustomQuery}
              checkboxValue={isCustomQuery}
              onCheckboxChange={handleCustomQueryCheckBoxChange}
              data-testid="atom-custom-query"
            />
          </div>
        </div>
      </Form>
    </Dialog>
  );
};

export type { AtomProps };
export default Atom;
