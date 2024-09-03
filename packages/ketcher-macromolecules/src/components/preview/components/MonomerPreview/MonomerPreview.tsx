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
  Container,
  InfoBlock,
  MonomerName,
  StyledStructRender,
} from './MonomerPreview.styles';
import styled from '@emotion/styled';
import { MonomerPreviewState, selectShowPreview } from 'state/common';
import { useAppSelector } from 'hooks';
import { useAttachmentPoints } from '../../hooks/useAttachmentPoints';
import useIDTAliasesTextForMonomer from '../../hooks/useIDTAliasesTextForMonomer';
import UnresolvedMonomerPreview from '../UnresolvedMonomerPreview/UnresolvedMonomerPreview';
import AttachmentPoints from '../AttachmentPoints/AttachmentPoints';
import IDTAliases from '../IDTAliases/IDTAliases';
import { preview } from '../../../../constants';
import { UsageInMacromolecule } from 'ketcher-core';

interface Props {
  className?: string;
}

const MonomerPreview = ({ className }: Props) => {
  const preview = useAppSelector(selectShowPreview) as MonomerPreviewState;

  const { monomer, attachmentPointsToBonds, style } = preview;

  const ContainerDynamic = useMemo(() => {
    if (!style) {
      return styled(Container)``;
    }

    return styled(Container)`
      top: ${style?.top || ''};
      left: ${style?.left || ''};
      right: ${style?.right || ''};
    `;
  }, [style]);

  const idtAliases = monomer?.props.idtAliases;

  const { preparedAttachmentPointsData, connectedAttachmentPoints } =
    useAttachmentPoints({
      monomerCaps: monomer?.props.MonomerCaps,
      attachmentPointsToBonds,
    });

  const idtAliasesText = useIDTAliasesTextForMonomer({
    idtAliases,
    attachmentPointsToBonds,
    monomerClass: monomer?.props.MonomerClass,
  });

  if (!monomer) {
    return null;
  }

  const isUnresolved = monomer.props.unresolved;
  const monomerName = isUnresolved ? monomer.label : monomer.struct?.name;

  return (
    (monomer.struct || isUnresolved) && (
      <ContainerDynamic
        className={className}
        data-testid="polymer-library-preview"
      >
        {monomerName && <MonomerName>{monomerName}</MonomerName>}
        {isUnresolved ? (
          <UnresolvedMonomerPreview />
        ) : (
          <StyledStructRender
            struct={monomer.struct}
            options={{
              connectedMonomerAttachmentPoints: connectedAttachmentPoints,
              usageInMacromolecule: UsageInMacromolecule.MonomerPreview,
              labelInPreview: true,
              needCache: false,
            }}
          />
        )}
        <InfoBlock>
          <AttachmentPoints
            preparedAttachmentPointsData={preparedAttachmentPointsData}
          />
          {idtAliasesText && <IDTAliases idtAliasesText={idtAliasesText} />}
        </InfoBlock>
      </ContainerDynamic>
    )
  );
};

const StyledPreview = styled(MonomerPreview)`
  z-index: 5;
  position: absolute;
  width: ${preview.width + 'px'};
  height: ${preview.height + 'px'};
  transform: translate(-50%, 0);
`;

export default StyledPreview;
export { MonomerPreview };
