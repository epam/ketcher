/*******************************************************************************
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
 ******************************************************************************/

import styled from '@emotion/styled';
import { IKetAttachmentPoint } from 'ketcher-core';

interface AttachmentPointsSectionProps {
  /**
   * List of attachment points to display.
   */
  attachmentPoints: IKetAttachmentPoint[];
  /**
   * Whether the parent component is in edit mode.
   * When true, the Leaving Group field shows an input.
   */
  isEditMode?: boolean;
  /**
   * Callback fired when a Leaving Group value changes in edit mode.
   */
  onLeavingGroupChange?: (pointLabel: string, value: string) => void;
}

// ---------------------------------------------------------
// Styled components
// ---------------------------------------------------------

const Container = styled.div`
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const SectionLabel = styled.span`
  font-size: ${{ theme } => theme.ketcher.font.size.small};
  color: ${({ theme }) => theme.ketcher.color.text.light};
  margin-bottom: 2px;
`;

const PointsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const PointBadge = styled.div<{ hasLeavingGroup?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3px 6px;
  border-radius: 4px;
  background-color: ${({ theme }) =>
    theme.ketcher.color.background.secondary};
  border: 1px solid ${({ theme }) => theme.ketcher.outline.color};
  min-width: 32px;
  text-align: center;
`;

const PointName = styled.span`
  font-size: ${({ theme }) => theme.ketcher.font.size.small};
  font-weight: 600;
  color: ${({ theme }) => theme.ketcher.color.text.primary};
`;

const PointLeavingGroup = styled.span`
  font-size: ${({ theme }) => theme.ketcher.font.size.small};
  color: ${({ theme }) => theme.ketcher.color.text.light};
`;

const LeavingGroupInput = styled.input`
  width: 40px;
  font-size: ${({ theme }) => theme.ketcher.font.size.small};
  border: 1px solid ${({ theme }) => theme.ketcher.outline.color};
  border-radius: 2px;
  padding: 1px 4px;
  text-align: center;
  &:focus {
    outline: ${({ theme }) => theme.ketcher.outline.selected.small};
  }
`;

// ---------------------------------------------------------
// Component
// ---------------------------------------------------------

/**
 * AttachmentPointsSection
 *
 * Renders a labelled list of attachment points (e.g. R1, R2, R3)
 * for a monomer component block or the preset tab.
 *
 * In non-edit mode the Leaving Group is displayed as a read-only badge.
 * In edit mode an inline input is rendered so the user can override it.
 */
export const AttachmentPointsSection = ({
  attachmentPoints,
  isEditMode = false,
  onLeavingGroupChange,
}: AttachmentPointsSectionProps) => {
  if (!attachmentPoints || attachmentPoints.length === 0) {
    return null;
  }

  return (
    <Container data-testid="attachment-points-section">
      <SectionLabel>Attachment Points:</SectionLabel>
      <PointsWrapper>
        {attachmentPoints.map((point) => {
          const label = point.attachmentAtom?.resultingGroup?.stringValue ?? point.leavingGroup?.stringValue ?? '';
          const pointLabel = point.point;

          return (
            <PointBadge
              key={pointLabel}
              hasLeavingGroup={Boolean(label)}
              data-testid={`attachment-point-${pointLabel}`}
            >
              <PointName>{pointLabel}</PointName>
              {isEditMode && onLeavingGroupChange ? (
                <LeavingGroupInput
                  value={label}
                  aria-label={`Leaving group for ${pointLabel}`}
                  data-testid={`attachment-point-${pointLabel}-leaving-group-input`}
                  onChange={(ev) =>
                    onLeavingGroupChange(pointLabel, i.target.value)
                  }
                />
              ) : label ? (
                <PointLeavingGroup>{label}</PointLeavingGroup>
              ) : null}
            </PointBadge>
          );
        })}
      </PointsWrapper>
    </Container>
  );
};
