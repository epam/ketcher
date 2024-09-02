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
import { useAppSelector } from 'hooks';
import { PreviewType, selectShowPreview } from 'state/common';
import MonomerPreview from './components/MonomerPreview/MonomerPreview';
import PresetPreview from './components/PresetPreview/PresetPreview';
import BondPreview from './components/BondPreview/BondPreview';

export const Preview = () => {
  const preview = useAppSelector(selectShowPreview);

  if (!preview) {
    return null;
  }

  switch (preview.type) {
    case PreviewType.Preset:
      return <PresetPreview />;
    case PreviewType.Monomer:
      return <MonomerPreview />;
    case PreviewType.Bond:
      return <BondPreview />;
    default:
      return null;
  }
};
