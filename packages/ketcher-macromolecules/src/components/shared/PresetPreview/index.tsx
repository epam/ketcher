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
import { IDTAliases } from 'components/shared/IDTAliases';
import { useMemo } from 'react';
import {
  PresetMonomerRow,
  PresetMonomerLabel,
  PresetMonomerName,
  PresetIcon,
  PresetContainer,
  PresetName,
} from './styles';
import { IPreviewProps } from '../MonomerPreview/types';
import { preview } from '../../../constants';
import styled from '@emotion/styled';
import { useAppSelector } from 'hooks';
import { PresetPreviewState, selectShowPreview } from 'state/common';
import { IconName } from 'ketcher-react/dist/components/Icon/types';

const icons: Extract<IconName, 'sugar' | 'base' | 'phosphate'>[] = [
  'sugar',
  'base',
  'phosphate',
];

const PresetPreview = ({ className }: IPreviewProps) => {
  const preview = useAppSelector(selectShowPreview);

  const ContainerDynamic = useMemo(() => {
    if (!preview?.style) {
      return styled(PresetContainer)``;
    }

    return styled(PresetContainer)`
      left: ${preview.style.left || ''};
      right: ${preview.style.right || ''};
      top: ${preview.style.top || ''};
      transform: ${preview.style.transform || ''};
    `;
  }, [preview]);
  if (!preview || !('preset' in preview)) {
    return undefined;
  }
  const { preset } = preview as PresetPreviewState;
  const { idtAliases } = preset;
  const [, baseMonomer] = preset.monomers;
  const presetName = preset?.name ?? baseMonomer?.props.Name;

  return (
    preview.preset && (
      <ContainerDynamic
        className={className}
        data-testid="polymer-library-preview"
        style={{ alignItems: 'flex-start', height: 'auto', width: 'auto' }}
      >
        <PresetName>{presetName}</PresetName>
        {preset.monomers.map(
          (monomer, index) =>
            monomer && (
              <PresetMonomerRow key={index}>
                <PresetIcon name={icons[index]} />
                <PresetMonomerLabel>{monomer.label}</PresetMonomerLabel>
                <PresetMonomerName>({monomer.props.Name})</PresetMonomerName>
              </PresetMonomerRow>
            ),
        )}
        {idtAliases && <IDTAliases aliases={idtAliases} preset />}
      </ContainerDynamic>
    )
  );
};

const PresetStyledPreview = styled(PresetPreview)`
  z-index: 5;
  position: absolute;
  width: ${preview.width}px;
  height: ${preview.height}px;
`;

export default PresetStyledPreview;
