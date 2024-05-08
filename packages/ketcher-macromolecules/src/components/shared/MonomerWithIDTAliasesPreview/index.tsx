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
import { IDTAliases } from 'components/shared/MonomerWithIDTAliasesPreview/IDTAliases';
import { useAppSelector } from 'hooks';
import { MonomerItemType } from 'ketcher-core';
import { useMemo } from 'react';
import { selectShowPreview } from 'state/common';
import { preview as previewConstants } from '../../../constants';
import { Container, MonomerName, StyledStructRender } from './styles';
import { MonomerWithIDTAliasesPreviewProps } from './types';

const MonomerWithIDTAliasesPreview = ({
  className,
}: MonomerWithIDTAliasesPreviewProps) => {
  const preview = useAppSelector(selectShowPreview);
  const ContainerDynamic = useMemo(
    () => styled(Container)`
      top: ${preview?.style?.top || ''};
      left: ${preview?.style?.left || ''};
      right: ${preview?.style?.right || ''};
    `,
    [preview],
  );
  if (!preview?.monomer) {
    return undefined;
  }
  const { idtAliases } = (preview.monomer as MonomerItemType).props;

  return (
    preview.monomer && (
      <ContainerDynamic
        className={className}
        data-testid="polymer-library-preview"
      >
        <MonomerName>{preview.monomer.struct.name}</MonomerName>
        <StyledStructRender
          struct={preview.monomer.struct}
          options={{ needCache: false }}
        />
        {idtAliases && <IDTAliases aliases={idtAliases}></IDTAliases>}
      </ContainerDynamic>
    )
  );
};

const StyledMonomerWithIDTAliasesPreview = styled(MonomerWithIDTAliasesPreview)`
  position: absolute;
  z-index: 5;
  width: ${previewConstants.width}px;
  height: ${previewConstants.height}px;
  transform: translate(-50%, 0);
`;

export default StyledMonomerWithIDTAliasesPreview;
