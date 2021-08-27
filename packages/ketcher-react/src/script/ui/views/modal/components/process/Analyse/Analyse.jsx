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

import { range } from 'lodash/fp'
import React, { Component } from 'react'
import { connect } from 'react-redux'

import { Dialog } from '../../../../components'
import Input from '../../../../../component/form/input'

import { changeRound } from '../../../../../state/options'
import { analyse } from '../../../../../state/server'
import { FrozenInput, FormulaInput } from './components'

import classes from './Analyse.module.less'
import { ErrorsContext } from '../../../../../../../contexts'

function roundOff(value, round) {
  if (typeof value === 'number') return value.toFixed(round)
  return value.replace(/[0-9]*\.[0-9]+/g, str => (+str).toFixed(round))
}

class AnalyseDialog extends Component {
  static contextType = ErrorsContext
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    const errorHandler = this.context
    try {
      this.props.onAnalyse()
    } catch (e) {
      // error could possibly be an invalid state of molecule.
      // TODO: handling such cases described in #251
      errorHandler(e.message)
      this.props.onCancel()
    }
  }

  render() {
    const {
      values,
      round,
      loading,
      onAnalyse,
      onChangeRound,
      ...props
    } = this.props
    return (
      <Dialog
        title="Calculated Values"
        className={classes.analyse}
        buttons={['Close']}
        params={props}>
        <ul>
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
          ].map(item => (
            <li key={item.key}>
              <label>{item.name}:</label>
              {item.key === 'gross' ? (
                <FormulaInput
                  value={values && !loading ? values[item.key] : ''}
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
              {item.withSelector ? (
                <Input
                  schema={{
                    enum: range(0, 8),
                    enumNames: range(0, 8).map(i => `${i} decimal places`)
                  }}
                  value={round[item.round]}
                  onChange={val => onChangeRound(item.round, val)}
                />
              ) : null}
            </li>
          ))}
        </ul>
      </Dialog>
    )
  }
}

const mapStateToProps = state => ({
  values: state.options.analyse.values,
  loading: state.options.analyse.loading,
  round: {
    roundWeight: state.options.analyse.roundWeight,
    roundMass: state.options.analyse.roundMass,
    roundElAnalysis: state.options.analyse.roundElAnalysis
  }
})

const mapDispatchToProps = dispatch => ({
  onAnalyse: () => dispatch(analyse()),
  onChangeRound: (roundName, val) => dispatch(changeRound(roundName, val))
})

const Analyse = connect(mapStateToProps, mapDispatchToProps)(AnalyseDialog)

export default Analyse
