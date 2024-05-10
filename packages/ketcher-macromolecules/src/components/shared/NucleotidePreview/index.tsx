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
  NucleotideMonomerRow,
  NucleotideMonomerLabel,
  NucleotideMonomerName,
  MonomerIcon,
  NucleotideContainer,
  NucleotideName,
} from './styles';
import { IPreviewProps } from '../MonomerPreview/types';
import { preview } from '../../../constants';
import styled from '@emotion/styled';
import { useAppSelector } from 'hooks';
import { selectShowPreview } from 'state/common';
import { IconName } from 'ketcher-react/dist/components/Icon/types';

const icons: Extract<IconName, 'sugar' | 'base' | 'phosphate'>[] = [
  'sugar',
  'base',
  'phosphate',
];

const NucleotidePreview = ({ className }: IPreviewProps) => {
  const preview = useAppSelector(selectShowPreview);

  const ContainerDynamic = useMemo(
    () => styled(NucleotideContainer)`
      top: ${preview?.style?.top || ''};
      left: ${preview?.style?.left || ''};
      right: ${preview?.style?.right || ''};
    `,
    [preview],
  );

  return (
    preview?.nucleotide && (
      <ContainerDynamic
        className={className}
        data-testid="polymer-library-preview"
        style={{ alignItems: 'flex-start', height: 'auto', width: 'auto' }}
      >
        <NucleotideName>{preview.nucleotide[1].props.Name}</NucleotideName>
        {preview.nucleotide.map(
          (monomer, index) =>
            monomer && (
              <NucleotideMonomerRow key={index}>
                <MonomerIcon name={icons[index]} />
                <NucleotideMonomerLabel>{monomer.label}</NucleotideMonomerLabel>
                <NucleotideMonomerName>
                  ({monomer.props.Name})
                </NucleotideMonomerName>
              </NucleotideMonomerRow>
            ),
        )}
      </ContainerDynamic>
    )
  );
};

const StyledPreview = styled(NucleotidePreview)`
  z-index: 5;
  position: absolute;
  width: ${preview.width}px;
  height: ${preview.height}px;
  transform: translate(-50%, 0);
`;

export default StyledPreview;
