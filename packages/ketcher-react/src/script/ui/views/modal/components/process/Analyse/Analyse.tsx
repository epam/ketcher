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

import { FormulaInput, FrozenInput } from './components';

import { ReactElement, useEffect } from 'react';
import { Dialog } from '../../../../components';
import { DialogParams } from '../../../../../../../components/Dialog/Dialog';
import { analyse } from '../../../../../state/server';
import { changeRound } from '../../../../../state/options';
import classes from './Analyse.module.less';
import { connect } from 'react-redux';
import { range } from 'lodash/fp';
import Select from '../../../../../component/form/Select';
import { getSelectOptionsFromSchema } from '../../../../../utils';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

type AnalyseValueKey =
  | 'gross'
  | 'molecular-weight'
  | 'monoisotopic-mass'
  | 'mass-composition';

type RoundKey = 'roundWeight' | 'roundMass' | 'roundElAnalysis';

interface AnalyseValues {
  gross?: string;
  'molecular-weight'?: number;
  'monoisotopic-mass'?: number;
  'mass-composition'?: string;
  [key: string]: string | number | undefined;
}

interface RoundSettings {
  roundWeight: number;
  roundMass: number;
  roundElAnalysis: number;
  [key: string]: number;
}

interface AnalyseItem {
  name: string;
  key: AnalyseValueKey;
  round?: RoundKey;
  withSelector: boolean;
}

interface AnalyseDialogProps extends DialogParams {
  values: AnalyseValues | null;
  round: RoundSettings;
  loading: boolean;
}

interface AnalyseDialogCallProps {
  onAnalyse: () => void;
  onChangeRound: (roundName: RoundKey, value: string) => void;
}

type Props = AnalyseDialogProps & AnalyseDialogCallProps;
type AnalyseStateProps = Pick<
  AnalyseDialogProps,
  'values' | 'round' | 'loading'
>;

interface RootState {
  options: {
    analyse: {
      values: AnalyseValues | null;
      loading?: boolean;
    } & RoundSettings;
  };
}

function roundOff(value: string | number, round: number): string {
  if (typeof value === 'number') return value.toFixed(round);
  return value.replace(/\d*\.\d+/g, (str) => (+str).toFixed(round));
}

const selectOptions = getSelectOptionsFromSchema({ enum: range(0, 8) });

const analyseItems: AnalyseItem[] = [
  {
    name: 'Chemical Formula',
    key: 'gross',
    withSelector: false,
  },
  {
    name: 'Molecular Weight',
    key: 'molecular-weight',
    round: 'roundWeight',
    withSelector: true,
  },
  {
    name: 'Exact Mass',
    key: 'monoisotopic-mass',
    round: 'roundMass',
    withSelector: true,
  },
  {
    name: 'Elemental Analysis',
    key: 'mass-composition',
    round: 'roundElAnalysis',
    withSelector: false,
  },
];

function renderInputComponent(
  item: AnalyseItem,
  values: AnalyseValues | null,
  loading: boolean,
  round: RoundSettings,
): ReactElement {
  if (item.key === 'gross') {
    return (
      <FormulaInput
        value={values && !loading ? (values[item.key] as string) || '' : ''}
        contentEditable={false}
      />
    );
  }

  if (item.key === 'mass-composition') {
    return (
      <textarea
        readOnly
        value={
          values && !loading && item.round
            ? roundOff(values[item.key] as string | number, round[item.round])
            : 0
        }
        data-testid={item.name + '-input'}
      />
    );
  }

  return (
    <FrozenInput
      data-testid={item.name + '-input'}
      value={
        values && !loading && item.round
          ? roundOff(values[item.key] as string | number, round[item.round])
          : 0
      }
    />
  );
}

function AnalyseDialog({
  values,
  round,
  loading,
  onAnalyse,
  onChangeRound,
  ...props
}: Props) {
  useEffect(() => {
    onAnalyse();
  }, [onAnalyse]);

  return (
    <Dialog
      title="Calculated Values"
      className={classes.analyse}
      withDivider={true}
      needMargin={true}
      valid={() => true}
      buttons={['OK']}
      buttonsNameMap={{ OK: 'Close' }}
      params={props}
    >
      <ul>
        {analyseItems.map((item) => (
          <li
            key={item.key}
            className={classes.contentWrapper}
            data-testid={item.name + '-wrapper'}
          >
            <div className={classes.inputWrapper}>
              <label>{item.name}:</label>
              {renderInputComponent(item, values, loading, round)}
            </div>
            {item.withSelector && item.round ? (
              <div className={classes.selectWrapper}>
                <span>Decimal places</span>
                <Select
                  options={selectOptions}
                  value={String(round[item.round])}
                  onChange={(val) => {
                    if (item.round) {
                      onChangeRound(item.round, val);
                    }
                  }}
                  className={classes.select}
                  data-testid={item.name + '-select'}
                />
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </Dialog>
  );
}

const mapStateToProps = (state: RootState): AnalyseStateProps => ({
  values: state.options.analyse.values,
  loading: Boolean(state.options.analyse.loading),
  round: {
    roundWeight: state.options.analyse.roundWeight,
    roundMass: state.options.analyse.roundMass,
    roundElAnalysis: state.options.analyse.roundElAnalysis,
  },
});

const mapDispatchToProps = (
  dispatch: ThunkDispatch<RootState, unknown, AnyAction>,
): AnalyseDialogCallProps => ({
  onAnalyse: () => dispatch(analyse()),
  onChangeRound: (roundName: RoundKey, val: string) =>
    dispatch(changeRound(roundName, val)),
});

const Analyse = connect(mapStateToProps, mapDispatchToProps)(AnalyseDialog);

export default Analyse;
