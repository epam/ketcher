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

const MonomerPreview = ({ className }: IPreviewProps) => {
  const preview = useAppSelector(selectShowPreview);

  const ContainerDinamic = useMemo(
    () => styled(Container)`
      top: ${preview?.style || ''};
    `,
    [preview],
  );

  return (
    preview?.monomer && (
      <ContainerDinamic className={className}>
        <MonomerName>{preview.monomer.struct.name}</MonomerName>
        <StyledStructRender struct={preview.monomer.struct} />
      </ContainerDinamic>
    )
  );
};

const StyledPreview = styled(MonomerPreview)`
  z-index: 1;
  position: absolute;
  width: ${preview.width}px;
  height: ${preview.height}px;
  left: 50%;
  transform: translate(-50%, 0);
`;

export default StyledPreview;
export { MonomerPreview };
