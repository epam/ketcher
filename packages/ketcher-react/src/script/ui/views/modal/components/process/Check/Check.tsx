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

import { FC, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import Form, { Field } from '../../../../../component/form/form/form';
import { Dialog } from '../../../../components';
import ErrorsCheck from './components';
import { check } from '../../../../../state/server';
import { checkOpts } from '../../../../../state/options';
import style from './Check.module.less';
import { LoadingCircles } from 'src/script/ui/views/components/Spinner';

interface MoleculeErrors {
  [key: string]: string;
}

type CheckOption =
  | 'valence'
  | 'radicals'
  | 'pseudoatoms'
  | 'stereo'
  | 'query'
  | 'overlapping_atoms'
  | 'overlapping_bonds'
  | 'rgroups'
  | 'chiral'
  | '3d'
  | 'chiral_flag';

interface CheckSchema {
  title: string;
  type: string;
  properties: {
    checkOptions: {
      title: string;
      type: string;
      items: {
        type: string;
        enum: CheckOption[];
        enumNames: string[];
      };
    };
  };
}

interface CheckState {
  checkOptions: CheckOption[];
}

interface FormState {
  result?: CheckState;
  moleculeErrors: MoleculeErrors;
  errors?: Record<string, unknown>;
  valid?: boolean;
}

interface CheckDialogOwnProps {
  onOk: (result: unknown) => void;
  onCancel: () => void;
}

interface CheckDialogStateProps {
  formState: FormState;
  checkState: CheckState;
}

interface CheckDialogDispatchProps {
  onCheck: (opts: CheckOption[]) => Promise<void>;
  onApply: (res: CheckState) => void;
}

type CheckDialogProps = CheckDialogOwnProps &
  CheckDialogStateProps &
  CheckDialogDispatchProps;

interface State {
  modal: {
    form: FormState;
  };
  options: {
    check: CheckState;
  };
}

const checkSchema: CheckSchema = {
  title: 'Check',
  type: 'object',
  properties: {
    checkOptions: {
      title: 'Settings',
      type: 'array',
      items: {
        type: 'string',
        enum: [
          'valence',
          'radicals',
          'pseudoatoms',
          'stereo',
          'query',
          'overlapping_atoms',
          'overlapping_bonds',
          'rgroups',
          'chiral',
          '3d',
          'chiral_flag',
        ],
        enumNames: [
          'Valence',
          'Radical',
          'Pseudoatom',
          'Stereochemistry',
          'Query',
          'Overlapping Atoms',
          'Overlapping Bonds',
          'R-Groups',
          'Chirality',
          '3D Structure',
          'Chiral flag',
        ],
      },
    },
  },
};

const getFormattedDateString = (date: Date): string => {
  const getFixedString = (num: number): string => (num + '').padStart(2, '0');
  return `${getFixedString(date.getHours())}:${getFixedString(
    date.getMinutes(),
  )}:${getFixedString(date.getSeconds())}  ${getFixedString(
    date.getDate(),
  )}.${getFixedString(date.getMonth() + 1)}.${getFixedString(
    date.getFullYear(),
  )}`;
};

interface FooterContentProps {
  handleCheck: () => void;
  handleApply: () => void;
  onCancel: () => void;
  isStuctureChecking: boolean;
  isCheckedWithNewSettings: boolean;
}

const FooterContent: FC<FooterContentProps> = ({
  handleCheck,
  handleApply,
  onCancel,
  isStuctureChecking,
  isCheckedWithNewSettings,
}) => {
  return (
    <div className={style.buttons}>
      <div>
        <button
          className={
            isCheckedWithNewSettings
              ? style.buttonSecondary
              : style.buttonPrimary
          }
          onClick={handleCheck}
          disabled={!isStuctureChecking}
          data-testid="Check"
        >
          Check
        </button>
      </div>
      <div className={style.buttonsRight}>
        <button
          className={style.buttonSecondary}
          onClick={onCancel}
          data-testid="Cancel"
        >
          Cancel
        </button>
        <button
          className={style.buttonPrimary}
          onClick={handleApply}
          disabled={!isStuctureChecking}
          data-testid="Apply"
        >
          Apply
        </button>
      </div>
    </div>
  );
};

const CheckDialog: FC<CheckDialogProps> = (props) => {
  const { formState, checkState, onCheck, onApply, onCancel, ...restProps } =
    props;
  const { result = checkState, moleculeErrors } = formState;
  const [isStuctureChecking, setIsStructureChecking] = useState(false);
  const [lastCheckDate, setLastCheckDate] = useState<Date | null>(null);
  const [isCheckedWithNewSettings, setIsCheckedWithNewSettings] =
    useState(false);

  const handleApply = () => onApply(result);

  const handleCheck = () => {
    setIsStructureChecking(false);
    onCheck(result.checkOptions).then(() => {
      setIsStructureChecking(true);
      setLastCheckDate(new Date());
      setIsCheckedWithNewSettings(true);
    });
  };

  const handleSettingsChange = () => setIsCheckedWithNewSettings(false);

  useEffect(() => {
    handleCheck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Dialog
      title="Structure Check"
      className={style.dialog_body}
      params={{ ...restProps, onCancel }}
      buttons={[]}
      footerContent={
        <FooterContent
          handleCheck={handleCheck}
          handleApply={handleApply}
          onCancel={onCancel}
          isStuctureChecking={isStuctureChecking}
          isCheckedWithNewSettings={isCheckedWithNewSettings}
        />
      }
      withDivider
    >
      <Form
        schema={checkSchema}
        init={checkState}
        {...formState}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - result prop is not in FormProps type definition but is accepted by the component
        result={result}
      >
        <div className={style.wrapper}>
          <div className={style.settings}>
            <span className={style.sectionTitle}>Settings</span>
            <div
              className={!isStuctureChecking ? style.checkBoxesDisabled : ''}
            >
              <Field
                name="checkOptions"
                labelPos={false}
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore - multiple and onChange props are not in FieldProps type definition but are accepted by the component
                multiple
                type="checkbox"
                disabled={!isStuctureChecking}
                onChange={handleSettingsChange}
              />
            </div>
          </div>
          <div className={style.checkInfo}>
            <span data-testid={'checkInfo-lastCheck'}>
              Last check:{' '}
              {lastCheckDate && getFormattedDateString(lastCheckDate)}
            </span>
            <div
              className={
                !Object.keys(moleculeErrors).length || !isStuctureChecking
                  ? style.centeredContainer
                  : style.warnings
              }
              data-testid={'checkInfo-messages'}
            >
              {isStuctureChecking ? (
                <div
                  className={
                    Object.keys(moleculeErrors).length
                      ? style.warningsContainer
                      : style.centeredContainer
                  }
                >
                  <ErrorsCheck
                    moleculeErrors={moleculeErrors}
                    checkSchema={checkSchema}
                  />
                </div>
              ) : (
                <LoadingCircles />
              )}
            </div>
          </div>
        </div>
      </Form>
    </Dialog>
  );
};

const mapStateToProps = (state: State): CheckDialogStateProps => ({
  formState: state.modal.form,
  checkState: state.options.check,
});

const mapDispatchToProps = (
  dispatch: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  ownProps: CheckDialogOwnProps,
): CheckDialogDispatchProps => ({
  onCheck: (opts: CheckOption[]) =>
    dispatch(check(opts)).catch(ownProps.onCancel),
  onApply: (res: CheckState) => {
    dispatch(checkOpts(res));
    ownProps.onOk(res);
  },
});

const Check = connect(mapStateToProps, mapDispatchToProps)(CheckDialog);

export default Check;
