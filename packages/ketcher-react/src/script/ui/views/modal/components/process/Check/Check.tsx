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

import Form, { Field } from '../../../../../component/form/form/form';
import { Dialog } from '../../../../components';
import ErrorsCheck from './components';
import { check } from '../../../../../state/server';
import { checkOpts } from '../../../../../state/options';
import { connect } from 'react-redux';
import style from './Check.module.less';
import { useEffect, useState } from 'react';
import { LoadingCircles } from 'src/script/ui/views/components/Spinner';

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

const FooterContent = ({
  handleCheck,
  handleApply,
  onCancel,
  isStuctureChecking,
  isCheckedWithNewSettings,
}: FooterContentProps) => {
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

interface CheckResult {
  checkOptions: CheckOption[];
}

interface FormState {
  result?: CheckResult;
  moleculeErrors: Record<string, string>;
  [key: string]: unknown;
}

interface CheckState {
  checkOptions: CheckOption[];
}

interface CheckDialogProps {
  formState: FormState;
  checkState: CheckState;
  onCheck: (opts: CheckOption[]) => Promise<unknown>;
  onApply: (result: CheckResult) => void;
  onCancel: () => void;
  [key: string]: unknown;
}

function CheckDialog(props: CheckDialogProps) {
  const { formState, checkState, onCheck, onApply, onCancel, ...restProps } =
    props;
  const { result = checkState, moleculeErrors } = formState;
  const formStateProps: Record<string, unknown> = { ...formState, result };
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
      params={{ ...restProps, onCancel, onOk: () => undefined }}
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
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Form init={checkState} {...formStateProps}>
        <div className={style.wrapper}>
          <div className={style.settings}>
            <span className={style.sectionTitle}>Settings</span>
            <div
              className={!isStuctureChecking ? style.checkBoxesDisabled : ''}
            >
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <Field
                name="checkOptions"
                labelPos={false}
                type="checkbox"
                disabled={!isStuctureChecking}
                onChange={handleSettingsChange}
                multiple
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
}

interface StateProps {
  formState: FormState;
  checkState: CheckState;
}

interface DispatchProps {
  onCheck: (opts: CheckOption[]) => Promise<unknown>;
  onApply: (res: CheckResult) => void;
}

interface OwnProps {
  onCancel: () => void;
  onOk: (res: CheckResult) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapStateToProps = (state: any): StateProps => ({
  formState: state.modal.form,
  checkState: state.options.check,
});

const mapDispatchToProps = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dispatch: any,
  ownProps: OwnProps,
): DispatchProps => ({
  onCheck: (opts) => dispatch(check(opts)).catch(ownProps.onCancel),
  onApply: (res) => {
    dispatch(checkOpts(res));
    ownProps.onOk(res);
  },
});

const Check = connect(mapStateToProps, mapDispatchToProps)(CheckDialog);

export default Check;
