import styled from '@emotion/styled';
import { ActionButton } from 'components/shared/actionButton';
import { Modal } from 'components/shared/modal';
import { BaseMonomer } from 'ketcher-core/dist/domain/entities/BaseMonomer';
import { StructRender } from 'ketcher-react';
import { useMemo, useState } from 'react';
import { RequiredModalProps } from '../modalContainer';
import { CoreEditor } from 'ketcher-core';

export interface MonomerConnectionOnlyProps {
  firstMonomer?: BaseMonomer;
  secondMonomer?: BaseMonomer;
  onCreateBond?: (
    secondMonomer: BaseMonomer,
    firstAttchmentPointName: string,
    secondAttachmentPointName: string,
  ) => void;
  onCancelBondCreation?: () => void;
}

export type MonomerConnectionProps = MonomerConnectionOnlyProps &
  RequiredModalProps;

const StyledModal = styled(Modal)({
  '& .MuiPaper-root': {
    width: '520px',
    height: 'fit-content',
  },

  '& .MuiDialogContent-root': {
    overflow: 'hidden',
  },
});

const Row = styled.div({
  display: 'flex',
  alignItems: 'start',
  justifyContent: 'space-between',
});

const Column = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
});

export const StyledStructRender = styled(StructRender)(({ theme }) => ({
  height: '200px',
  width: '200px',
  border: `1px solid ${theme.ketcher.color.button.secondary.active}`,
  borderRadius: theme.ketcher.border.radius.regular,
}));

const AttachmentPointList = styled.div({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'start',
  gap: '10px',
});

const AttachmentPoint = styled.div({
  flexBasis: 'calc(100% / 3 - 10px * 2 / 3)', // 2 - gaps, 3 - buttons
  display: 'flex',
  flexDirection: 'column',
  rowGap: '5px',
});

const AttachmentPointName = styled.span(({ theme }) => ({
  margin: 0,
  padding: 0,
  textAlign: 'center',
  display: 'block',
  fontSize: theme.ketcher.font.size.regular,
  fontWeight: theme.ketcher.font.weight.regular,
}));

const MonomerName = styled.h3(({ theme }) => ({
  margin: 0,
  padding: 0,
  textAlign: 'center',
  display: 'block',
  fontSize: theme.ketcher.font.size.regular,
  fontWeight: theme.ketcher.font.weight.regular,
}));

const MonomerConnection = ({
  onClose,
  isModalOpen,
  firstMonomer,
  secondMonomer,
  onCreateBond,
  onCancelBondCreation,
}: MonomerConnectionProps): React.ReactElement => {
  if (!firstMonomer || !secondMonomer) {
    throw new Error('Monomers must exist!');
  }

  const firstBonds = firstMonomer.attachmentPointsToBonds;
  const secondBonds = secondMonomer.attachmentPointsToBonds;

  const [firstSelectedAttachmentPoint, setFirstSelectedAttachmentPoint] =
    useState<string | null>(getDefaultAttachmentPoint(firstBonds));
  const [secondSelectedAttachmentPoint, setSecondSelectedAttachmentPoint] =
    useState<string | null>(getDefaultAttachmentPoint(secondBonds));

  if (!onCreateBond) {
    throw new Error('onCreateBond handler must exist!');
  }

  if (!onCancelBondCreation) {
    throw new Error('onCancelBondCreation handler must exist!');
  }

  const cancelBondCreationAndClose = () => {
    onCancelBondCreation();
    onClose();
  };

  const tryConnectingMonomers = () => {
    if (!firstSelectedAttachmentPoint || !secondSelectedAttachmentPoint) {
      throw new Error('Attachment points cannot be falsy');
    }

    if (firstSelectedAttachmentPoint === secondSelectedAttachmentPoint) {
      CoreEditor.provideEditorInstance().events.error.dispatch(
        "You can't connect monomers by attachment points of the same group",
      );

      return;
    }

    onCreateBond(
      secondMonomer,
      firstSelectedAttachmentPoint || '',
      secondSelectedAttachmentPoint || '',
    );
    onClose();
  };

  return (
    <StyledModal
      title=""
      isOpen={isModalOpen}
      onClose={cancelBondCreationAndClose}
    >
      <Modal.Content>
        <Row>
          <Column>
            <AttachmentPointSelectionPanel
              monomer={firstMonomer}
              selectedAttachmentPoint={firstSelectedAttachmentPoint}
              onSelectAttachmentPoint={setFirstSelectedAttachmentPoint}
            />
          </Column>
          <Column>
            <AttachmentPointSelectionPanel
              monomer={secondMonomer}
              selectedAttachmentPoint={secondSelectedAttachmentPoint}
              onSelectAttachmentPoint={setSecondSelectedAttachmentPoint}
            />
          </Column>
        </Row>
      </Modal.Content>

      <Modal.Footer>
        <ActionButton
          label="Cancel"
          styleType="secondary"
          clickHandler={cancelBondCreationAndClose}
        />
        <ActionButton
          label="Connect"
          disabled={
            !firstSelectedAttachmentPoint || !secondSelectedAttachmentPoint
          }
          clickHandler={tryConnectingMonomers}
        />
      </Modal.Footer>
    </StyledModal>
  );
};

interface AttachmentPointSelectionPanelProps {
  monomer: BaseMonomer;
  selectedAttachmentPoint: string | null;
  onSelectAttachmentPoint: (attachmentPoint: string) => void;
}

function AttachmentPointSelectionPanel({
  monomer,
  selectedAttachmentPoint,
  onSelectAttachmentPoint,
}: AttachmentPointSelectionPanelProps): React.ReactElement {
  const bonds = monomer.attachmentPointsToBonds;

  const connectedAttachmentPoints = useMemo(
    () => getConnectedAttachmentPoints(bonds),
    [bonds],
  );

  return (
    <>
      <MonomerName>{monomer.monomerItem.props.Name}</MonomerName>
      <StyledStructRender
        struct={monomer.monomerItem.struct}
        options={{
          connectedMonomerAttachmentPoints: connectedAttachmentPoints,
          currentlySelectedMonomerAttachmentPoint:
            selectedAttachmentPoint ?? undefined,
        }}
      />
      <AttachmentPointList>
        {Object.entries(bonds).map(([attachmentPoint, bond]) => (
          <AttachmentPoint key={attachmentPoint}>
            <ActionButton
              label={attachmentPoint}
              styleType={
                attachmentPoint === selectedAttachmentPoint
                  ? 'primary'
                  : 'secondary'
              }
              clickHandler={() => onSelectAttachmentPoint(attachmentPoint)}
              disabled={Boolean(bond)}
            />
            <AttachmentPointName>H</AttachmentPointName>
          </AttachmentPoint>
        ))}
      </AttachmentPointList>
    </>
  );
}

function getConnectedAttachmentPoints(
  bonds: Record<string, unknown>,
): string[] {
  return Object.entries(bonds)
    .filter(([_, bond]) => Boolean(bond))
    .map(([attachmentPoint]) => attachmentPoint);
}

function getDefaultAttachmentPoint(
  bonds: Record<string, unknown>,
): string | null {
  const possibleAttachmentPoints = Object.entries(bonds).filter(
    ([_, bond]) => bond == null,
  );

  if (possibleAttachmentPoints.length === 1) {
    const [attachmentPointName] = possibleAttachmentPoints[0];

    return attachmentPointName;
  }

  return null;
}

export { MonomerConnection };
