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

import { Dialog, type DialogParameters } from '../../../../components';
import Logo from './logo.svg';
import classes from './About.module.less';
import { connect } from 'react-redux';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import type { Dispatch } from 'redux';

const FEEDBACK_URL =
  'https://lifescience.opensource.epam.com/ketcher/#feedback';
const OVERVIEW_URL =
  'https://lifescience.opensource.epam.com/ketcher/index.html';
const LIFE_SCIENCES_URL = 'https://lifescience.opensource.epam.com/';
const INDIGO_URL = 'https://lifescience.opensource.epam.com/indigo/';

interface AboutDialogProperties {
  date: string;
  indigoVersion?: string;
  indigoMachine?: string;
  feedbackLink: string;
  overviewLink: string;
  lifeScienciesLink: string;
  version: string;
  onOk: (result?: unknown) => void;
}

function AboutDialog(properties: Readonly<AboutDialogProperties>) {
  const { t } = useTranslation('dialogs');
  const indigoInfo = properties.indigoVersion?.split('.r') || []; // Indigo version and build info

  const dialogParameters: DialogParameters = {
    onOk: properties.onOk,
    onCancel: properties.onOk, // Using onOk for both since About dialog only has an OK button
  };

  return (
    <Dialog
      className={`${classes.about} ${classes.dialog_body}`}
      params={dialogParameters}
      buttons={[
        <button
          onClick={properties.onOk}
          className={classes.okButton}
          key="ok"
          data-testid="ok-button"
        >
          {t('meta.about.ok')}
        </button>,
      ]}
    >
      <div className={classes.headerContent}>
        <a
          href={properties.overviewLink}
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
            <dt data-testid="build-version">
              <a
                href={properties.overviewLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('meta.about.version', { value: properties.version })}
              </a>
            </dt>
            <dd data-testid="build-time">
              {t('meta.about.buildAt')} <time>{properties.date}</time>
            </dd>
            <div className={classes.infoLinks}>
              <dt>
                <a
                  href={properties.feedbackLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('meta.about.feedback')}
                </a>
              </dt>
              <dt>
                <a
                  href={properties.lifeScienciesLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('meta.about.epamLifeSciences')}
                </a>
              </dt>
            </div>
            <br />
            <div className={classes.indigoVersion}>
              <a href={INDIGO_URL} target="_blank" rel="noopener noreferrer">
                {' '}
                {t('meta.about.indigoToolkit')}
              </a>
              {properties.indigoMachine && (
                <div>{properties.indigoMachine}</div>
              )}
            </div>
            <div data-testid="build-indigo-version">
              {properties.indigoVersion ? (
                <Fragment>
                  <dd>{t('meta.about.version', { value: indigoInfo[0] })}</dd>
                  {indigoInfo[1] && (
                    <dd>{t('meta.about.build', { value: indigoInfo[1] })}</dd>
                  )}
                </Fragment>
              ) : (
                <p>{t('meta.about.standalone')}</p>
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

const mapStateToProperties = (state: AppState) => ({
  date: state.options.app.buildDate.replace('T', '; '),
  indigoVersion: state.options.app.indigoVersion,
  indigoMachine: state.options.app.indigoMachine,
  feedbackLink: FEEDBACK_URL,
  overviewLink: OVERVIEW_URL,
  lifeScienciesLink: LIFE_SCIENCES_URL,
  version: state.options.app.version,
});

const mapDispatchToProperties = (dispatch: Dispatch) => ({
  onOk: (_result?: unknown) => {
    dispatch({ type: 'MODAL_CLOSE' });
  },
});

const About = connect(
  mapStateToProperties,
  mapDispatchToProperties,
)(AboutDialog);

export default About;
