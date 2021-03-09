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

function roundOff(value, round) {
  if (typeof value === 'number') return value.toFixed(round)
  return value.replace(/[0-9]*\.[0-9]+/g, str => (+str).toFixed(round))
}

class AnalyseDialog extends Component {
  constructor(props) {
    super(props)
    props.onAnalyse().catch(e => {
      // error could possibly be an invalid state of molecule.
      // TODO: handling such cases described in #251
      alert(e)
      props.onCancel()
    })
  }

  render() {
    const { values, round, onAnalyse, onChangeRound, ...props } = this.props
    return (
      <Dialog
        title="Calculated Values"
        className={classes.analyse}
        buttons={['Close']}
        params={props}>
        <ul>
          {[
            { name: 'Chemical Formula', key: 'gross' },
            {
              name: 'Molecular Weight',
              key: 'molecular-weight',
              round: 'roundWeight'
            },
            {
              name: 'Exact Mass',
              key: 'monoisotopic-mass',
              round: 'roundMass'
            },
            { name: 'Elemental Analysis', key: 'mass-composition' }
          ].map(item => (
            <li key={item.key}>
              <label>{item.name}:</label>
              {item.key === 'gross' ? (
                <FormulaInput value={values ? values[item.key] : ''} />
              ) : (
                <FrozenInput
                  value={
                    values ? roundOff(values[item.key], round[item.round]) : 0
                  }
                />
              )}
              {item.round ? (
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
  round: {
    roundWeight: state.options.analyse.roundWeight,
    roundMass: state.options.analyse.roundMass
  }
})

const mapDispatchToProps = dispatch => ({
  onAnalyse: () => dispatch(analyse()),
  onChangeRound: (roundName, val) => dispatch(changeRound(roundName, val))
})

const Analyse = connect(mapStateToProps, mapDispatchToProps)(AnalyseDialog)

export default Analyse
