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

function HeaderContent() {
  return (
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
  )
}

function AboutDialog(props) {
  const indigoInfo = props.indigoVersion && props.indigoVersion.split('.r') // Indigo version and build info

  return (
    <Dialog
      className={classes.about}
      params={props}
      buttons={['Close']}
      headerContent={<HeaderContent />}
    >
      <p>About</p>
      <div className={classes.body}>
        <div className={classes.verionsInfo}>
          <dl className={classes.ketcherVersionInfo}>
            <dd>
              <span className={classes.versionName}>
                Version {props.version}
              </span>
            </dd>
            <dd>
              Build at <time>{props.buildDate.replace('T', '; ')}</time>
            </dd>
            <dt>
              <a
                href="http://lifescience.opensource.epam.com/ketcher/help.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                {' '}
                Ketcher
              </a>
            </dt>
          </dl>
          {props.indigoVersion ? (
            <div className={classes.indigoVersionInfo}>
              <dl className={classes.indigoVersionInfo}>
                <dd>
                  <span className={classes.versionName}>
                    Version {indigoInfo[0]}
                  </span>
                </dd>
                <dd>Build #{indigoInfo[1]}</dd>
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
              </dl>
            </div>
          ) : (
            <p>Standalone</p>
          )}
        </div>
        <div className={classes.links}>
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
        </div>
      </div>
    </Dialog>
  )
}

const mapStateToProps = (state) => ({ ...state.options.app })

const About = connect(mapStateToProps)(AboutDialog)

export default About
