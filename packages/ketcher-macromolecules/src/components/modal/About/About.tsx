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
import { useIndigoVersionToRedux } from 'src/hooks/useIndigoVersionToRedux';
import { selectAppMeta } from 'state/common/editorSlice';
import { useAppDispatch, useAppSelector } from 'src/hooks/stateHooks';

const FEEDBACK_URL = 'http://lifescience.opensource.epam.com/ketcher/#feedback';
const OVERVIEW_URL =
  'https://lifescience.opensource.epam.com/ketcher/index.html';
const LIFE_SCIENCES_URL = 'http://lifescience.opensource.epam.com/';
const INDIGO_URL = 'http://lifescience.opensource.epam.com/indigo/';

function formatDate(isoDate = ''): string {
  if (!isoDate.includes('T')) return isoDate;
  const [date, time] = isoDate.split('T');
  return `${date}; ${time}`;
}

export function About({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const dispatch = useAppDispatch();
  useIndigoVersionToRedux();
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
              <dt>
                <a
                  href={OVERVIEW_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Version {version}
                </a>
              </dt>
              <dd>
                Build at <time>{formattedDate}</time>
              </dd>
              <div className="infoLinks">
                <dt>
                  <a
                    href={FEEDBACK_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Feedback
                  </a>
                </dt>
                <dt>
                  <a
                    href={LIFE_SCIENCES_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    EPAM Life Sciences
                  </a>
                </dt>
              </div>
              <div className="indigoVersion">
                <a href={INDIGO_URL} target="_blank" rel="noopener noreferrer">
                  Indigo Toolkit
                </a>
              </div>
              <div>
                {indigoVersion ? (
                  <dd>Version {indigoVersion}</dd>
                ) : (
                  <p>Standalone</p>
                )}
              </div>
            </dl>
          </div>
          <div className="aboutFooter">
            <button onClick={handleClose} className="okButton">
              Ok
            </button>
          </div>
        </AboutStyled>
      </Modal.Content>
    </Modal>
  );
}
