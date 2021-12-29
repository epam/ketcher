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

function AboutDialog(props) {
  const indigoInfo = props.indigoVersion && props.indigoVersion.split('.r') // Indigo version and build info

  return (
    <Dialog
      title="About"
      className={classes.about}
      params={props}
      buttons={['Close']}
    >
      <a
        href="http://lifescience.opensource.epam.com/ketcher/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Logo />
      </a>
      <dl>
        <dt>
          <a
            href="http://lifescience.opensource.epam.com/ketcher/help.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ketcher
          </a>
        </dt>
        <dd>
          version
          <var>{props.version}</var>
        </dd>
        <dd>
          build at <time>{props.buildDate}</time>
        </dd>
        {props.indigoVersion ? (
          <div>
            <dt>
              <a
                href="http://lifescience.opensource.epam.com/indigo/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Indigo Toolkit
              </a>
            </dt>
            <dd>
              version
              <var>{indigoInfo[0]}</var>
            </dd>
            <dd>
              build #<var>{indigoInfo[1]}</var>
            </dd>
          </div>
        ) : (
          <dd>standalone</dd>
        )}
        <dt>
          <a
            href="http://lifescience.opensource.epam.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            EPAM Life Sciences
          </a>
        </dt>
        <dd>
          <a
            href="http://lifescience.opensource.epam.com/ketcher/#feedback"
            target="_blank"
            rel="noopener noreferrer"
          >
            Feedback
          </a>
        </dd>
      </dl>
    </Dialog>
  )
}

const mapStateToProps = (state) => ({ ...state.options.app })

const About = connect(mapStateToProps)(AboutDialog)

export default About
