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

import { Dialog, type DialogParams } from '../../../../components';
import Logo from './logo.svg';
import classes from './About.module.less';
import { connect } from 'react-redux';
import { Fragment } from 'react';
import { Dispatch } from 'redux';

interface AboutDialogProps {
  date: string;
  indigoVersion?: string;
  indigoMachine?: string;
  feedbackLink: string;
  overviewLink: string;
  lifeScienciesLink: string;
  version: string;
  onOk: (result?: unknown) => void;
}

function AboutDialog(props: Readonly<AboutDialogProps>) {
  const indigoInfo = props.indigoVersion?.split('.r') || []; // Indigo version and build info

  const dialogParams: DialogParams = {
    onOk: props.onOk,
    onCancel: props.onOk, // Using onOk for both since About dialog only has an OK button
  };

  return (
    <Dialog
      className={`${classes.about} ${classes.dialog_body}`}
      params={dialogParams}
      buttons={[
        <button
          onClick={props.onOk}
          className={classes.okButton}
          key="ok"
          data-testid="ok-button"
        >
          Ok
        </button>,
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
            <dt data-testid="build-version">
              <a
                href={props.overviewLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                Version {props.version}
              </a>
            </dt>
            <dd data-testid="build-time">
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
                  EPAM Life Sciences
                </a>
              </dt>
            </div>
            <br />
            <div className={classes.indigoVersion}>
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
            <div data-testid="build-indigo-version">
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
  );
}

interface AppState {
  options: {
    app: {
      buildDate: string;
      indigoVersion?: string;
      indigoMachine?: string;
      version: string;
    };
  };
}

const mapStateToProps = (state: AppState) => ({
  date: state.options.app.buildDate.replace('T', '; '),
  indigoVersion: state.options.app.indigoVersion,
  indigoMachine: state.options.app.indigoMachine,
  feedbackLink: 'http://lifescience.opensource.epam.com/ketcher/#feedback',
  overviewLink: 'https://lifescience.opensource.epam.com/ketcher/index.html',
  lifeScienciesLink: 'http://lifescience.opensource.epam.com/',
  version: state.options.app.version,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onOk: (_result?: unknown) => {
    dispatch({ type: 'MODAL_CLOSE' });
  },
});

const About = connect(mapStateToProps, mapDispatchToProps)(AboutDialog);

export default About;
