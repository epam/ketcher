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
import {
  PresetMonomerRow,
  PresetMonomerLabel,
  PresetMonomerName,
  PresetIcon,
  PresetContainer,
  PresetName,
} from './PresetPreview.styles';
import styled from '@emotion/styled';
import { selectShowPreview } from 'state/common';
import { IconName } from 'ketcher-react';
import { KetMonomerClass, MonomerItemType } from 'ketcher-core';
import useIDTAliasesTextForPreset from '../../hooks/useIDTAliasesTextForPreset';
import MonomerPreviewProperties from '../MonomerPreviewProperties/MonomerPreviewProperties';
import { useAppSelector } from 'hooks';
import { PresetPreviewState } from 'state';

const getIconNameForMonomer = (
  monomer: MonomerItemType,
): Extract<IconName, 'sugar' | 'base' | 'phosphate' | 'chem'> => {
  switch (monomer.props.MonomerClass) {
    case KetMonomerClass.Sugar:
      return 'sugar';
    case KetMonomerClass.Base:
      return 'base';
    case KetMonomerClass.Phosphate:
      return 'phosphate';
    default:
      return 'chem';
  }
};

interface Props {
  className?: string;
}

const PresetPreview = ({ className }: Props) => {
  const preview = useAppSelector(selectShowPreview) as PresetPreviewState;

  const { monomers, name, position, idtAliases, aliasAxoLabs } = preview;

  const [, baseMonomer] = monomers;
  const presetName = name ?? baseMonomer?.props.Name;
  const axoLabsText = aliasAxoLabs ?? baseMonomer?.props.aliasAxoLabs;

  const idtAliasesText = useIDTAliasesTextForPreset({
    presetName,
    position,
    idtAliases,
  });

  const isMonomerPreviewPropertiesVisible = idtAliasesText || axoLabsText;

  return (
    <PresetContainer
      className={className}
      style={{ alignItems: 'flex-start' }}
      data-testid="polymer-library-preview"
      data-idtaliases={idtAliasesText ?? undefined}
      data-axolabs={axoLabsText ?? undefined}
    >
      <PresetName data-testid="preview-tooltip-title">{presetName}</PresetName>
      {monomers.map((monomer, index) =>
        monomer ? (
          <PresetMonomerRow key={monomer.props.id ?? index}>
            <PresetIcon name={getIconNameForMonomer(monomer)} />
            <PresetMonomerLabel>{monomer.label}</PresetMonomerLabel>
            <PresetMonomerName>({monomer.props.Name})</PresetMonomerName>
          </PresetMonomerRow>
        ) : null,
      )}
      {isMonomerPreviewPropertiesVisible && (
        <MonomerPreviewProperties
          preset
          idtAliasesText={idtAliasesText ?? undefined}
          axoLabsText={axoLabsText}
        />
      )}
    </PresetContainer>
  );
};

const PresetStyledPreview = styled(PresetPreview)``;

export default PresetStyledPreview;
