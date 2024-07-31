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

import styled from '@emotion/styled';
import { useAppSelector } from 'hooks';
import { useMemo } from 'react';
import { selectShowPreview } from 'state/common';
import { Container, StyledStructRender } from './styles';
import { MoleculeOrStructurePreviewProps } from './types';

const MoleculeOrStructurePreview = ({
  className,
}: MoleculeOrStructurePreviewProps) => {
  const preview = useAppSelector(selectShowPreview);
  const ContainerDynamic = useMemo(() => {
    if (!preview?.style) {
      return styled(Container)``;
    }

    return styled(Container)`
      left: ${preview.style.left || ''};
      right: ${preview.style.right || ''};
      top: ${preview.style.top || ''};
    `;
  }, [preview]);
  if (!preview?.monomer) {
    return undefined;
  }

  return (
    preview.monomer && (
      <ContainerDynamic
        className={className}
        data-testid="polymer-library-preview"
      >
        <StyledStructRender struct={preview.monomer.struct} />
      </ContainerDynamic>
    )
  );
};

const moleculeOrStructurePreviewConfig = {
  height: 50,
  width: 50,
} as const;

const MoleculeOrStructureStyledPreview = styled(MoleculeOrStructurePreview)`
  position: absolute;
  z-index: 5;
  width: ${moleculeOrStructurePreviewConfig.width}px;
  height: ${moleculeOrStructurePreviewConfig.height}px;
  transform: translate(-50%, 0);
`;

export default MoleculeOrStructureStyledPreview;
