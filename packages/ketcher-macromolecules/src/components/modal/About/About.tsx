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
import { Modal } from '../../shared/modal/Modal';
import { About as AboutStyled } from './About.styles';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from 'state';
import { useIndigoVersionToRedux } from './useIndigoVersionToRedux';

export function About({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const dispatch = useDispatch();
  useIndigoVersionToRedux();
  const app = useSelector((state: RootState) => state.editor?.app || {});

  const { buildDate: date = '', indigoVersion = '', version = '' } = app;
  let formattedDate = date;
  if (date && date.includes('T')) {
    const [d, t] = date.split('T');
    formattedDate = `${d}; ${t}`;
  }

  const feedbackLink =
    'http://lifescience.opensource.epam.com/ketcher/#feedback';
  const overviewLink =
    'https://lifescience.opensource.epam.com/ketcher/index.html';
  const lifeScienciesLink = 'http://lifescience.opensource.epam.com/';

  const handleClose = () => {
    dispatch({ type: 'MODAL_CLOSE' });
    if (onClose) onClose();
  };

  return (
    <Modal title="" isOpen={isOpen} onClose={handleClose} hideHeaderBorder>
      <Modal.Content>
        <AboutStyled>
          <div className="headerContent">
            <a href={overviewLink} target="_blank" rel="noopener noreferrer">
              <Logo />
              <span className="title">Ketcher</span>
            </a>
          </div>
          <div className="body">
            <dl>
              <dt data-testid="build-version">
                <a
                  href={overviewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Version {version}
                </a>
              </dt>
              <dd data-testid="build-time">
                Build at <time>{formattedDate}</time>
              </dd>
              <div className="infoLinks">
                <dt>
                  <a
                    href={feedbackLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Feedback
                  </a>
                </dt>
                <dt>
                  <a
                    href={lifeScienciesLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    EPAM Life Sciences
                  </a>
                </dt>
              </div>
              <div className="indigoVersion">
                <a
                  href="http://lifescience.opensource.epam.com/indigo/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Indigo Toolkit
                </a>
              </div>
              <div data-testid="build-indigo-version">
                {indigoVersion ? (
                  <dd>Version {indigoVersion}</dd>
                ) : (
                  <p>Standalone</p>
                )}
              </div>
            </dl>
          </div>
          <div className="aboutFooter">
            <button
              onClick={handleClose}
              data-testid="ok-button"
              className="okButton"
            >
              Ok
            </button>
          </div>
        </AboutStyled>
      </Modal.Content>
    </Modal>
  );
}
