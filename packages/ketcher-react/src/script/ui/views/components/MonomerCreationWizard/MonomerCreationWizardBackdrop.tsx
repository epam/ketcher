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

import { useSelector } from 'react-redux';
import { editorMonomerCreationStateSelector } from '../../../state/editor/selectors';
import styles from './MonomerCreationWizard.module.less';

/**
 * Renders the white panel that visually backs the MonomerCreationWizard.
 *
 * The wizard panel itself is transparent; this backdrop is mounted earlier in
 * the canvas DOM (before the SVG and other overlays) so the natural paint
 * order produces:
 *   white backdrop  <  canvas SVG / overlays  <  wizard interactive controls
 * This makes the molecule structure and other canvas content visually appear
 * above the white panel while still keeping the wizard buttons/controls on
 * top of the molecule when they overlap.
 */
const MonomerCreationWizardBackdrop = () => {
  const monomerCreationState = useSelector(editorMonomerCreationStateSelector);

  if (!monomerCreationState) {
    return null;
  }

  return (
    <div
      className={styles.monomerCreationWizardBackdrop}
      data-testid="monomer-creation-wizard-backdrop"
      aria-hidden="true"
    />
  );
};

export default MonomerCreationWizardBackdrop;
