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
import { useMemo } from 'react';
import {
  PresetMonomerRow,
  PresetMonomerLabel,
  PresetMonomerName,
  PresetIcon,
  PresetContainer,
  PresetName,
} from './PresetPreview.styles';
import { preview } from '../../../../constants';
import styled from '@emotion/styled';
import { selectShowPreview } from 'state/common';
import { IconName } from 'ketcher-react';
import useIDTAliasesTextForPreset from '../../hooks/useIDTAliasesTextForPreset';
import { useAppSelector } from 'hooks';
import IDTAliases from '../IDTAliases/IDTAliases';
import { PresetPreviewState } from 'state';

const icons: Extract<IconName, 'sugar' | 'base' | 'phosphate'>[] = [
  'sugar',
  'base',
  'phosphate',
];

interface Props {
  className?: string;
}

const PresetPreview = ({ className }: Props) => {
  const preview = useAppSelector(selectShowPreview) as PresetPreviewState;

  const { monomers, name, position, idtAliases, style } = preview;

  const ContainerDynamic = useMemo(() => {
    if (!style) {
      return styled(PresetContainer)``;
    }

    return styled(PresetContainer)`
      left: ${style.left || ''};
      right: ${style.right || ''};
      top: ${style.top || ''};
      transform: ${style.transform || ''};
    `;
  }, [style]);

  const [, baseMonomer] = monomers;
  const presetName = name ?? baseMonomer?.props.Name;

  const idtAliasesText = useIDTAliasesTextForPreset({
    presetName,
    position,
    idtAliases,
  });

  return (
    <ContainerDynamic
      className={className}
      style={{ alignItems: 'flex-start', height: 'auto', width: 'auto' }}
      data-testid="polymer-library-preview"
    >
      <PresetName>{presetName}</PresetName>
      {monomers.map(
        (monomer, index) =>
          monomer && (
            <PresetMonomerRow key={index}>
              <PresetIcon name={icons[index]} />
              <PresetMonomerLabel>{monomer.label}</PresetMonomerLabel>
              <PresetMonomerName>({monomer.props.Name})</PresetMonomerName>
            </PresetMonomerRow>
          ),
      )}
      {idtAliasesText && <IDTAliases idtAliasesText={idtAliasesText} preset />}
    </ContainerDynamic>
  );
};

const PresetStyledPreview = styled(PresetPreview)`
  z-index: 5;
  position: absolute;
  width: ${preview.width}px;
  height: ${preview.height}px;
`;

export default PresetStyledPreview;
