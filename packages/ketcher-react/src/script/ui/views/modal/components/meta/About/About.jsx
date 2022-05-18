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

import { Dialog } from '../../../../components'
import Logo from './logo.svg'
import classes from './About.module.less'
import { connect } from 'react-redux'
import { Fragment } from 'react'

function AboutDialog(props) {
  const indigoInfo = props.indigoVersion && props.indigoVersion.split('.r') // Indigo version and build info

  return (
    <Dialog
      className={`${classes.about} ${classes.dialog_body}`}
      params={props}
      buttons={[
        <button onClick={props.onOk} className={classes.okButton} key="ok">
          Ok
        </button>
      ]}
    >
      <div className={classes.headerContent}>
        <a href={props.overviewLink} target="_blank" rel="noopener noreferrer">
          <Logo />
          <span className={classes.title}>Ketcher</span>
        </a>
      </div>
      <div className={classes.body}>
        <div className={classes.verionsInfo}>
          <dl className={classes.ketcherVersionInfo}>
            <dt>
              <a
                href={props.overviewLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                Version {props.version}
              </a>
            </dt>
            <dd>
              Build at <time>{props.date}</time>
            </dd>
            <div className={classes.infoLinks}>
              <dt>
                <a
                  href={props.feedbackLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Feedback
                </a>
              </dt>
              <dt>
                <a
                  href={props.lifeScienciesLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Epam Life Sciencies
                </a>
              </dt>
            </div>
            <br />
            <div class={classes.indigoVersion}>
              <a
                href="http://lifescience.opensource.epam.com/indigo/"
                target="_blank"
                rel="noopener noreferrer"
              >
                {' '}
                Indigo Toolkit
              </a>
              {props.indigoMachine && <div>{props.indigoMachine}</div>}
            </div>
            <div>
              {props.indigoVersion ? (
                <Fragment>
                  <dd>Version {indigoInfo[0]}</dd>
                  {indigoInfo[1] && <dd>Build {indigoInfo[1]}</dd>}
                </Fragment>
              ) : (
                <p>Standalone</p>
              )}
            </div>
          </dl>
        </div>
      </div>
    </Dialog>
  )
}

const mapStateToProps = (state) => ({
  date: state.options.app.buildDate.replace('T', '; '),
  indigoVersion: state.options.app.indigoVersion,
  indigoMachine: state.options.app.indigoMachine,
  feedbackLink: 'http://lifescience.opensource.epam.com/ketcher/#feedback',
  overviewLink: 'https://lifescience.opensource.epam.com/ketcher/index.html',
  lifeScienciesLink: 'http://lifescience.opensource.epam.com/',
  version: state.options.app.version
})

const mapDispatchToProps = (dispatch) => ({
  onOk: (_result) => {
    dispatch({ type: 'MODAL_CLOSE' })
  }
})

const About = connect(mapStateToProps, mapDispatchToProps)(AboutDialog)

export default About
