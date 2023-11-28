import styled from '@emotion/styled';
import { ActionButton } from 'components/shared/actionButton';
import { Modal } from 'components/shared/modal';
import { BaseMonomer } from 'ketcher-core/dist/domain/entities/BaseMonomer';
import { StructRender } from 'ketcher-react';
import { useAppSelector } from 'hooks';
import { selectEditor } from 'state/common';
import { useMemo, useState } from 'react';
import {
  AttachmentPointList,
  AttachmentPoint,
  AttachmentPointName,
  MonomerName,
  ConnectionSymbol,
  AttachmentPointSelectionContainer,
  AttachmentPointsRow,
  MonomerNamesRow,
  ModalContent,
} from './styledComponents';
import { MonomerConnectionProps } from '../modalContainer/types';
import { LeavingGroup } from 'ketcher-core';

interface IStyledButtonProps {
  disabled: boolean;
}

const StyledModal = styled(Modal)({
  '& .MuiPaper-root': {
    width: 'auto',
    height: 'fit-content',
    background: '#fff !important',
  },

  '& .MuiDialogContent-root': {
    overflow: 'hidden',
  },
});

export const StyledStructRender = styled(StructRender)(({ theme }) => ({
  height: '150px',
  width: '150px',
  border: `1.5px solid ${theme.ketcher.outline.color}`,
  borderRadius: '6px',
  padding: 5,
}));

export const ActionButtonLeft = styled(ActionButton)(() => ({
  marginRight: 'auto',
  width: '97px !important',
}));

export const ActionButtonRight = styled(ActionButton)<IStyledButtonProps>(
  (props) => ({
    width: '97px !important',
    color: props.disabled ? 'rgba(51, 51, 51, 0.6)' : '',
    background: props.disabled ? 'rgba(225, 229, 234, 1) !important' : '',
    opacity: '1 !important',
  }),
);

export const ActionButtonAttachmentPoint = styled(ActionButton)(
  ({ theme }) => ({
    borderRadius: 5,
    minWidth: '45px !important',
    padding: '4px',
    border: `1px solid ${theme.ketcher.color.border.secondary}`,
  }),
);

const MonomerConnection = ({
  onClose,
  isModalOpen,
  firstMonomer,
  secondMonomer,
}: MonomerConnectionProps): React.ReactElement => {
  const editor = useAppSelector(selectEditor);

  if (!firstMonomer || !secondMonomer) {
    throw new Error('Monomers must exist!');
  }

  const [firstSelectedAttachmentPoint, setFirstSelectedAttachmentPoint] =
    useState<string | null>(getDefaultAttachmentPoint(firstMonomer));
  const [secondSelectedAttachmentPoint, setSecondSelectedAttachmentPoint] =
    useState<string | null>(getDefaultAttachmentPoint(secondMonomer));

  const cancelBondCreationAndClose = () => {
    editor.events.cancelBondCreationViaModal.dispatch(secondMonomer);
    onClose();
  };

  const connectMonomers = () => {
    if (!firstSelectedAttachmentPoint || !secondSelectedAttachmentPoint) {
      throw new Error('Attachment points cannot be falsy');
    }

    editor.events.createBondViaModal.dispatch({
      firstMonomer,
      secondMonomer,
      firstSelectedAttachmentPoint,
      secondSelectedAttachmentPoint,
    });

    onClose();
  };

  return (
    <StyledModal
      title=""
      isOpen={isModalOpen}
      showCloseButton={false}
      onClose={cancelBondCreationAndClose}
    >
      <Modal.Content>
        <ModalContent>
          <MonomerNamesRow>
            <MonomerName>{firstMonomer.monomerItem.props.Name}</MonomerName>
            <MonomerName>{secondMonomer.monomerItem.props.Name}</MonomerName>
          </MonomerNamesRow>
          <AttachmentPointsRow>
            <AttachmentPointSelectionPanel
              monomer={firstMonomer}
              selectedAttachmentPoint={firstSelectedAttachmentPoint}
              onSelectAttachmentPoint={setFirstSelectedAttachmentPoint}
            />

            <ConnectionSymbol />

            <AttachmentPointSelectionPanel
              monomer={secondMonomer}
              selectedAttachmentPoint={secondSelectedAttachmentPoint}
              onSelectAttachmentPoint={setSecondSelectedAttachmentPoint}
            />
          </AttachmentPointsRow>
        </ModalContent>
      </Modal.Content>

      <Modal.Footer>
        <ActionButtonLeft
          label="Cancel"
          styleType="secondary"
          clickHandler={cancelBondCreationAndClose}
        />
        <ActionButtonRight
          label="Connect"
          disabled={
            !firstSelectedAttachmentPoint || !secondSelectedAttachmentPoint
          }
          clickHandler={connectMonomers}
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

  const getLeavingGroup = (attachmentPoint): LeavingGroup => {
    const { MonomerCaps } = monomer.monomerItem.props;
    if (!MonomerCaps) {
      return 'H';
    }
    const leavingGroup = MonomerCaps[attachmentPoint];
    return leavingGroup === 'O' ? 'OH' : (leavingGroup as LeavingGroup);
  };

  return (
    <AttachmentPointSelectionContainer>
      <StyledStructRender
        struct={monomer.monomerItem.struct}
        options={{
          connectedMonomerAttachmentPoints: connectedAttachmentPoints,
          currentlySelectedMonomerAttachmentPoint:
            selectedAttachmentPoint ?? undefined,
          labelInMonomerConnectionsModal: true,
        }}
      />
      <AttachmentPointList>
        {monomer.listOfAttachmentPoints.map((attachmentPoint, i) => (
          <AttachmentPoint
            key={attachmentPoint}
            lastElementInRow={(i + 1) % 3 === 0}
          >
            <ActionButtonAttachmentPoint
              label={attachmentPoint}
              styleType={
                attachmentPoint === selectedAttachmentPoint
                  ? 'primary'
                  : 'secondary'
              }
              clickHandler={() => onSelectAttachmentPoint(attachmentPoint)}
              disabled={Boolean(
                connectedAttachmentPoints.find(
                  (connectedAttachmentPointName) =>
                    connectedAttachmentPointName === attachmentPoint &&
                    attachmentPoint !==
                      monomer.chosenFirstAttachmentPointForBond,
                ),
              )}
            />
            <AttachmentPointName data-testid="leaving-group-value">
              {getLeavingGroup(attachmentPoint)}
            </AttachmentPointName>
          </AttachmentPoint>
        ))}
      </AttachmentPointList>
    </AttachmentPointSelectionContainer>
  );
}

function getConnectedAttachmentPoints(
  bonds: Record<string, unknown>,
): string[] {
  return Object.entries(bonds)
    .filter(([_, bond]) => Boolean(bond))
    .map(([attachmentPoint]) => attachmentPoint);
}

function getDefaultAttachmentPoint(monomer: BaseMonomer): string | null {
  if (monomer.chosenFirstAttachmentPointForBond)
    return monomer.chosenFirstAttachmentPointForBond;
  if (monomer.chosenSecondAttachmentPointForBond)
    return monomer.chosenSecondAttachmentPointForBond;
  const possibleAttachmentPoints = Object.entries(
    monomer.attachmentPointsToBonds,
  ).filter(([_, bond]) => bond == null);

  if (possibleAttachmentPoints.length === 1) {
    const [attachmentPointName] = possibleAttachmentPoints[0];

    return attachmentPointName;
  }

  return null;
}

export { MonomerConnection };
