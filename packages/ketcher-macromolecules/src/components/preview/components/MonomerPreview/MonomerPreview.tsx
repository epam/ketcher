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
  Container,
  InfoBlock,
  MonomerName,
  StyledStructRender,
} from './MonomerPreview.styles';
import { selectShowPreview } from 'state/common';
import { useAppSelector } from 'hooks';
import { getModificationTypeAttribute } from 'helpers/getModificationTypeAttribute';
import { useAttachmentPoints } from '../../hooks/useAttachmentPoints';
import useIDTAliasesTextForMonomer from '../../hooks/useIDTAliasesTextForMonomer';
import UnresolvedMonomerPreview from '../UnresolvedMonomerPreview/UnresolvedMonomerPreview';
import MonomerPreviewProperties from '../MonomerPreviewProperties/MonomerPreviewProperties';
import AttachmentPoints from '../AttachmentPoints/AttachmentPoints';
import { UsageInMacromolecule } from 'ketcher-core';
import { MonomerPreviewState } from 'state';

interface Props {
  className?: string;
}

const MonomerPreview = ({ className }: Props) => {
  const preview = useAppSelector(selectShowPreview) as MonomerPreviewState;
  const LONG_NAME_THRESHOLD = 100;

  const { monomer, attachmentPointsToBonds } = preview;

  const idtAliases = monomer?.props.idtAliases;
  const axoLabsAlias = monomer?.props.aliasAxoLabs;
  const aliasHelm = monomer?.props.aliasHELM;
  const modificationTypes = monomer?.props.modificationTypes;

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
  const monomerName = isUnresolved
    ? monomer.label
    : monomer.struct?.name || monomer.label;
  const isMonomerPreviewPropertiesVisible =
    idtAliasesText || axoLabsAlias || aliasHelm || modificationTypes;

  return (
    (monomer.struct || isUnresolved) && (
      <Container
        className={className}
        isLongName={monomerName.length > LONG_NAME_THRESHOLD}
        data-testid="polymer-library-preview"
        data-idtaliases={idtAliasesText ?? undefined}
        data-axolabs={axoLabsAlias ?? undefined}
        data-helm={aliasHelm ?? undefined}
        data-modificationtype={getModificationTypeAttribute(modificationTypes)}
      >
        {monomerName.length > 0 && (
          <MonomerName
            data-testid="preview-tooltip-title"
            isLongName={monomerName.length > 100}
          >
            {monomerName}
          </MonomerName>
        )}
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
          {isMonomerPreviewPropertiesVisible && (
            <MonomerPreviewProperties
              idtAliasesText={idtAliasesText ?? undefined}
              axoLabsText={axoLabsAlias ?? undefined}
              helmText={aliasHelm ?? undefined}
              modificationTypeText={
                Array.isArray(modificationTypes)
                  ? modificationTypes.join(', ')
                  : modificationTypes
              }
            />
          )}
        </InfoBlock>
      </Container>
    )
  );
};

export default MonomerPreview;
export { MonomerPreview };
