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
      className={classes.about}
      params={props}
      buttons={[
        <button
          onClick={props.onOk}
          className={classes.okButton}
          key='ok'
        >
          Ok
        </button>
      ]}
    >
      <div className={classes.headerContent}>
        <a
          href="http://lifescience.opensource.epam.com/ketcher/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Logo />
          <span className={classes.title}>Ketcher</span>
        </a>
      </div>
      <div className={classes.body}>
        <div className={classes.verionsInfo}>
          <dl className={classes.ketcherVersionInfo}>
            <dt>
                <a
                  href="http://lifescience.opensource.epam.com/ketcher/#feedback"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Version {props.version}
                </a>
            </dt>
            <dd>
              Build at <time>{props.date}</time>
            </dd>
            <dt>
              <a
                href="http://lifescience.opensource.epam.com/ketcher/#feedback"
                target="_blank"
                rel="noopener noreferrer"
              >
                Feedback
              </a>
            </dt>
            <dt>
              <a
                href="http://lifescience.opensource.epam.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Epam Life Sciencies
              </a>
            </dt>
            <br/>
            <div className={classes.firstline}>
            <dt>
              <a
                href="http://lifescience.opensource.epam.com/indigo/"
                target="_blank"
                rel="noopener noreferrer"
              >
                {' '}
                Indigo Toolkit
              </a>
            </dt>
            {true && <dd className={classes.indigoFirstLine}></dd>}
            </div>
            <div>
            {props.indigoVersion ? (
              <Fragment>
                <dd >
                      Version {indigoInfo[0]}
                </dd>
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
})

const mapDispatchToProps = (dispatch) => ({
    onOk: (_result) => {
      dispatch({ type: 'MODAL_CLOSE' })
  }
})

const About = connect(mapStateToProps, mapDispatchToProps)(AboutDialog)

export default About
