import Select from '../../../../../../component/form/Select';
import { Field, FieldWithModal } from 'src/script/ui/component/form/form/form';
import { atom as atomSchema } from '../../../../../../data/schema/struct-schema';
import { getSelectOptionsFromSchema } from 'src/script/ui/utils';
import ElementNumber from '../ElementNumber/ElementNumber';
import { openDialog } from 'src/script/ui/state/modal';
import { useDispatch } from 'react-redux';
import classes from './../Atom.module.less';
import { BaseProps } from '../../../../modal.types';
import { capitalize } from 'lodash';
const atomProps = atomSchema.properties;

type ChangeFunction = (value: string) => void;

const AtomElement = ({ formState }: BaseProps) => {
  const { atomType, atomList, notList, pseudo, label } = formState.result;
  const dispatch = useDispatch();

  const openNestedDialog = (
    modalName: 'period-table' | 'extended-table',
    props: object,
    onChange: ChangeFunction,
  ) => {
    openDialog(dispatch, modalName, { ...props, isNestedModal: true }).then(
      (el) => {
        onChange(el.values?.join(',') || el.label);
      },
      () => null, // onCancel handler
    );
  };

  const AtomFields = {
    single: (
      <>
        <FieldWithModal
          key="atomLabel"
          name="label"
          onEdit={(onChange: ChangeFunction) =>
            openNestedDialog(
              'period-table',
              { type: 'atom', label: capitalize(label) },
              onChange,
            )
          }
          data-testid="label-input"
          autoFocus
        />
        <ElementNumber label={label} />
      </>
    ),
    list: (
      <>
        <FieldWithModal
          name="atomList"
          onEdit={(onChange: ChangeFunction) =>
            openNestedDialog(
              'period-table',
              {
                type: notList ? 'not-list' : 'list',
                values: atomList !== '' ? atomList.split(',') : [],
              },
              onChange,
            )
          }
          disabled
        />
        <Field name="notList" labelPos="before" className={classes.checkbox} />
      </>
    ),
    pseudo: (
      <FieldWithModal
        name="pseudo"
        onEdit={(onChange: ChangeFunction) =>
          openNestedDialog(
            'extended-table',
            {
              label: pseudo,
              pseudo,
            },
            onChange,
          )
        }
      />
    ),
  };
  return (
    <>
      <Field
        name="atomType"
        component={Select}
        options={getSelectOptionsFromSchema(atomProps.atomType)}
      />
      {AtomFields[atomType]}
    </>
  );
};

export default AtomElement;
