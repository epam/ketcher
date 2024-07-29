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
import { MonomerName, Container, StyledStructRender } from './styles';
import { IPreviewProps } from './types';
import { preview } from '../../../constants';
import styled from '@emotion/styled';
import { useAppSelector } from 'hooks';
import { selectShowPreview } from 'state/common';
import UnresolvedMonomerPreview from 'components/shared/UnresolvedMonomerPreview/UnresolvedMonomerPreview';

const MonomerPreview = ({ className }: IPreviewProps) => {
  const preview = useAppSelector(selectShowPreview);

  const ContainerDynamic = useMemo(() => {
    if (!preview?.style) {
      return styled(Container)``;
    }

    return styled(Container)`
      top: ${preview?.style?.top || ''};
      left: ${preview?.style?.left || ''};
      right: ${preview?.style?.right || ''};
    `;
  }, [preview]);
  return (
    preview?.monomer && (
      <ContainerDynamic
        className={className}
        data-testid="polymer-library-preview"
      >
        <MonomerName>
          {preview.monomer.props?.unresolved
            ? preview.monomer.label
            : preview.monomer.struct.name}
        </MonomerName>
        {preview.monomer.props?.unresolved ? (
          <UnresolvedMonomerPreview />
        ) : (
          <StyledStructRender
            struct={preview.monomer?.struct}
            options={{ needCache: false }}
          />
        )}
      </ContainerDynamic>
    )
  );
};

const StyledPreview = styled(MonomerPreview)<IPreviewProps>`
  z-index: 5;
  position: absolute;
  width: ${preview.width + 'px'};
  height: ${preview.height + 'px'};
  transform: translate(-50%, 0);
`;

export default StyledPreview;
export { MonomerPreview };
