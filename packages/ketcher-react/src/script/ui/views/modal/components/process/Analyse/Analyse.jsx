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

import { FormulaInput, FrozenInput } from './components'

import { Component } from 'react'
import { Dialog } from '../../../../components'
import { ErrorsContext } from '../../../../../../../contexts'
import { analyse } from '../../../../../state/server'
import { changeRound } from '../../../../../state/options'
import classes from './Analyse.module.less'
import { connect } from 'react-redux'
import { range } from 'lodash/fp'
import Select from '../../../../../component/form/Select'
import { getSelectOptionsFromSchema } from '../../../../../utils'
import { LoadingCircles } from 'src/script/ui/views/components/Spinner'

function roundOff(value, round) {
  if (typeof value === 'number') return value.toFixed(round)
  return value.replace(/[0-9]*\.[0-9]+/g, (str) => (+str).toFixed(round))
}

const selectOptions = getSelectOptionsFromSchema({ enum: range(0, 8) })

class AnalyseDialog extends Component {
  static contextType = ErrorsContext

  componentDidMount() {
    this.props.onAnalyse();
  }

  onCloseAction = () => {
    this.props.onCancel();
  }

  render() {
    const { values, round, loading, onAnalyse, onChangeRound, ...props } =
      this.props
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
        <div className={classes.centeredContainer}>
        {!loading && values ? (<ul>
            {[
              {
                name: 'Chemical Formula',
                key: 'gross',
                withSelector: false
              },
              {
                name: 'Molecular Weight',
                key: 'molecular-weight',
                round: 'roundWeight',
                withSelector: true
              },
              {
                name: 'Exact Mass',
                key: 'monoisotopic-mass',
                round: 'roundMass',
                withSelector: true
              },
              {
                name: 'Elemental Analysis',
                key: 'mass-composition',
                round: 'roundElAnalysis',
                withSelector: false
              }
            ].map((item) => (
              <li key={item.key} className={classes.contentWrapper}>
                <div className={classes.inputWrapper}>
                  <label>{item.name}:</label>
                  {item.key === 'gross' ? (
                    <FormulaInput
                      value={values && !loading ? values[item.key] : ''}
                      contentEditable={false}
                    />
                  ) : item.key === 'mass-composition' ? (
                    <textarea
                      readOnly
                      value={
                        values && !loading
                          ? roundOff(values[item.key], round[item.round])
                          : 0
                      }
                    />
                  ) : (
                    <FrozenInput
                      value={
                        values && !loading
                          ? roundOff(values[item.key], round[item.round])
                          : 0
                      }
                    />
                  )}
                </div>
                {item.withSelector ? (
                  <div className={classes.selectWrapper}>
                    <span>Decimal places</span>
                    <Select
                      options={selectOptions}
                      value={round[item.round]}
                      onChange={(val) => onChangeRound(item.round, val)}
                      className={classes.select}
                    />
                  </div>
                ) : null}
              </li>
            ))}
          </ul>) : (
            <LoadingCircles actionHasTimeout={loading} onCancel={this.onCloseAction}/>
        )}
        </div>
      </Dialog>
    )
  }
}

const mapStateToProps = (state) => ({
  values: state.options.analyse.values,
  loading: state.options.analyse.loading,
  round: {
    roundWeight: state.options.analyse.roundWeight,
    roundMass: state.options.analyse.roundMass,
    roundElAnalysis: state.options.analyse.roundElAnalysis
  }
})

const mapDispatchToProps = (dispatch) => ({
  onAnalyse: () => dispatch(analyse()),
  onChangeRound: (roundName, val) => dispatch(changeRound(roundName, val))
})

const Analyse = connect(mapStateToProps, mapDispatchToProps)(AnalyseDialog)

export default Analyse
