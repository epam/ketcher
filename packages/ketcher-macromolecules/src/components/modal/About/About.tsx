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

import Logo from './logo.svg';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../shared/modal/Modal';
import { About as AboutStyled } from './About.styles';
import { selectAppMeta } from 'state/common/editorSlice';
import { useAppDispatch, useAppSelector } from 'src/hooks/stateHooks';

const FEEDBACK_URL =
  'https://lifescience.opensource.epam.com/ketcher/#feedback';
const OVERVIEW_URL =
  'https://lifescience.opensource.epam.com/ketcher/index.html';
const LIFE_SCIENCES_URL = 'https://lifescience.opensource.epam.com/';
const INDIGO_URL = 'https://lifescience.opensource.epam.com/indigo/';

function formatDate(isoDate = ''): string {
  if (!isoDate.includes('T')) return isoDate;
  const [date, time] = isoDate.split('T');
  return `${date}; ${time}`;
}

export function About({
  isOpen,
  onClose,
}: Readonly<{
  isOpen: boolean;
  onClose: () => void;
}>) {
  const { t } = useTranslation('dialogs');
  const dispatch = useAppDispatch();
  const { buildDate, indigoVersion, version } = useAppSelector(selectAppMeta);
  const formattedDate = formatDate(buildDate);

  const handleClose = () => {
    dispatch({ type: 'MODAL_CLOSE' });
    onClose();
  };

  return (
    <Modal title="" isOpen={isOpen} onClose={handleClose} hideHeaderBorder>
      <Modal.Content>
        <AboutStyled>
          <div className="headerContent">
            <a href={OVERVIEW_URL} target="_blank" rel="noopener noreferrer">
              <Logo />
              <span className="title">Ketcher</span>
            </a>
          </div>
          <div className="body">
            <dl>
              <dt data-testid="build-version">
                <a
                  href={OVERVIEW_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('meta.about.version', { value: version })}
                </a>
              </dt>
              <dd data-testid="build-time">
                {t('meta.about.buildAt')} <time>{formattedDate}</time>
              </dd>
              <div className="infoLinks">
                <dt>
                  <a
                    href={FEEDBACK_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t('meta.about.feedback')}
                  </a>
                </dt>
                <dt>
                  <a
                    href={LIFE_SCIENCES_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t('meta.about.epamLifeSciences')}
                  </a>
                </dt>
              </div>
              <div className="indigoVersion">
                <a href={INDIGO_URL} target="_blank" rel="noopener noreferrer">
                  {t('meta.about.indigoToolkit')}
                </a>
              </div>
              <div data-testid="build-indigo-version">
                {indigoVersion ? (
                  <dd>{t('meta.about.version', { value: indigoVersion })}</dd>
                ) : (
                  <p>{t('meta.about.standalone')}</p>
                )}
              </div>
            </dl>
          </div>
          <div className="aboutFooter">
            <button
              onClick={handleClose}
              className="okButton"
              data-testid="ok-button"
            >
              {t('meta.about.ok')}
            </button>
          </div>
        </AboutStyled>
      </Modal.Content>
    </Modal>
  );
}
