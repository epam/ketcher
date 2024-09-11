import styled from '@emotion/styled';
import { ActionButton } from 'components/shared/actionButton';
import { Modal } from 'components/shared/modal';
import { useAppSelector } from 'hooks';
import { selectEditor } from 'state/common';
import { useEffect, useRef, useState } from 'react';
import {
  AttachmentPoint,
  AttachmentPointName as AttachmentPointNameComponent,
  ModalContent,
} from './styledComponents';
import { MonomerConnectionProps } from '../modalContainer/types';
import {
  AmbiguousMonomer,
  BaseMonomer,
  LeavingGroup,
  UsageInMacromolecule,
  AttachmentPointName,
} from 'ketcher-core';
import hydrateLeavingGroup from 'helpers/hydrateLeavingGroup';
import { getConnectedAttachmentPoints } from 'helpers';
import MonomerOverview from 'components/shared/ConnectionOverview/components/MonomerOverview/MonomerOverview';
import ConnectionOverview from 'components/shared/ConnectionOverview/ConnectionOverview';

interface IStyledButtonProps {
  disabled: boolean;
}

const StyledModal = styled(Modal)({
  '& .MuiPaper-root': {
    background: '#fff !important',
  },

  '& .MuiDialogContent-root': {
    overflow: 'hidden',
  },
});

export const ActionButtonLeft = styled(ActionButton)(() => ({
  width: '97px !important',
}));

export const ActionButtonRight = styled(ActionButton)<IStyledButtonProps>(
  (props) => ({
    width: '97px !important',
    color: props.disabled ? 'rgba(51, 51, 51, 0.6)' : '',
    background: props.disabled ? 'rgba(225, 229, 234, 1) !important' : '',
    opacity: '1 !important',
    minHeight: '0',
  }),
);

export const ActionButtonAttachmentPoint = styled(ActionButton)((props) => ({
  borderRadius: 5,
  minWidth: '45px !important',
  padding: '4px',
  border: `1px solid ${props.theme.ketcher.color.border.secondary}`,
  color: props.disabled ? 'rgba(51, 51, 51, 0.6) !important' : '',
  background: props.disabled ? 'rgba(225, 229, 234)' : '',
  borderColor: props.disabled ? 'rgba(225, 229, 234) !important' : '',
}));

const MonomerConnection = ({
  onClose,
  isModalOpen,
  firstMonomer,
  secondMonomer,
  polymerBond,
  isReconnectionDialog,
}: MonomerConnectionProps): React.ReactElement => {
  const editor = useAppSelector(selectEditor);
  const initialFirstMonomerAttachmentPointRef = useRef(
    polymerBond?.firstMonomerAttachmentPoint,
  );
  const initialSecondMonomerAttachmentPointRef = useRef(
    polymerBond?.secondMonomerAttachmentPoint,
  );
  const hasFreeAttachmentPointsRef = useRef(
    firstMonomer?.hasFreeAttachmentPoint ||
      secondMonomer?.hasFreeAttachmentPoint,
  );

  if (!firstMonomer || !secondMonomer) {
    throw new Error('Monomers must exist!');
  }

  const [firstSelectedAttachmentPoint, setFirstSelectedAttachmentPoint] =
    useState<string | null>(
      initialFirstMonomerAttachmentPointRef.current ||
        getDefaultAttachmentPoint(firstMonomer),
    );
  const [secondSelectedAttachmentPoint, setSecondSelectedAttachmentPoint] =
    useState<string | null>(
      initialSecondMonomerAttachmentPointRef.current ||
        getDefaultAttachmentPoint(secondMonomer),
    );
  const [modalExpanded, setModalExpanded] = useState(false);

  const cancelBondCreationAndClose = () => {
    if (isReconnectionDialog) {
      polymerBond?.firstMonomer.setBond(
        initialFirstMonomerAttachmentPointRef.current as AttachmentPointName,
        polymerBond,
      );
      polymerBond?.secondMonomer?.setBond(
        initialSecondMonomerAttachmentPointRef.current as AttachmentPointName,
        polymerBond,
      );
      onClose();
    } else {
      editor.events.cancelBondCreationViaModal.dispatch(secondMonomer);
      onClose();
    }
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
      polymerBond,
      isReconnection: isReconnectionDialog,
      initialFirstMonomerAttachmentPoint:
        initialFirstMonomerAttachmentPointRef.current,
      initialSecondMonomerAttachmentPoint:
        initialSecondMonomerAttachmentPointRef.current,
    });

    onClose();
  };

  return (
    <StyledModal
      title={
        isReconnectionDialog
          ? 'Edit Connection Points'
          : 'Select connection points'
      }
      isOpen={isModalOpen}
      onClose={cancelBondCreationAndClose}
      showExpandButton
      modalWidth="358px"
      expanded={modalExpanded}
      setExpanded={setModalExpanded}
    >
      <Modal.Content>
        <ModalContent>
          <ConnectionOverview
            firstMonomer={firstMonomer}
            secondMonomer={secondMonomer}
            expanded={modalExpanded}
            firstMonomerOverview={
              <AttachmentPointSelectionPanel
                monomer={firstMonomer}
                selectedAttachmentPoint={firstSelectedAttachmentPoint}
                onSelectAttachmentPoint={setFirstSelectedAttachmentPoint}
                expanded={modalExpanded}
              />
            }
            secondMonomerOverview={
              <AttachmentPointSelectionPanel
                monomer={secondMonomer}
                selectedAttachmentPoint={secondSelectedAttachmentPoint}
                onSelectAttachmentPoint={setSecondSelectedAttachmentPoint}
                expanded={modalExpanded}
              />
            }
          />
        </ModalContent>
      </Modal.Content>

      <Modal.Footer>
        <ActionButtonLeft
          label="Cancel"
          styleType="secondary"
          clickHandler={cancelBondCreationAndClose}
        />
        <ActionButtonRight
          label={isReconnectionDialog ? 'Reconnect' : 'Connect'}
          disabled={
            !firstSelectedAttachmentPoint ||
            !secondSelectedAttachmentPoint ||
            !hasFreeAttachmentPointsRef.current
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
  expanded?: boolean;
}

function AttachmentPointSelectionPanel({
  monomer,
  selectedAttachmentPoint,
  onSelectAttachmentPoint,
  expanded = false,
}: AttachmentPointSelectionPanelProps): React.ReactElement {
  const [bonds, setBonds] = useState(monomer.attachmentPointsToBonds);
  const [connectedAttachmentPoints, setConnectedAttachmentPoints] = useState(
    () => getConnectedAttachmentPoints(bonds),
  );

  useEffect(() => {
    setBonds(monomer.attachmentPointsToBonds);
  }, [selectedAttachmentPoint]);

  useEffect(() => {
    const newConnectedAttachmentPoints = getConnectedAttachmentPoints(bonds);
    setConnectedAttachmentPoints(newConnectedAttachmentPoints);
  }, [bonds]);

  const getLeavingGroup = (attachmentPoint): LeavingGroup | null => {
    const MonomerCaps = monomer.monomerCaps;
    const isAmbiguousMonomer = monomer instanceof AmbiguousMonomer;
    if (!MonomerCaps) {
      return isAmbiguousMonomer ? null : 'H';
    }
    const leavingGroup = MonomerCaps[attachmentPoint];
    return hydrateLeavingGroup(leavingGroup);
  };

  const handleSelectAttachmentPoint = (attachmentPoint: string) => {
    const newBonds = { ...monomer.attachmentPointsToBonds };
    const selectedBond = selectedAttachmentPoint
      ? newBonds[selectedAttachmentPoint]
      : null;
    if (selectedAttachmentPoint && selectedBond) {
      monomer.removeBond(selectedBond);
    }

    const potentialBond = monomer.getPotentialBond(attachmentPoint);
    newBonds[attachmentPoint] = potentialBond;

    setBonds(newBonds);
    onSelectAttachmentPoint(attachmentPoint);

    const newConnectedAttachmentPoints = getConnectedAttachmentPoints(newBonds);
    setConnectedAttachmentPoints(newConnectedAttachmentPoints);
  };

  return (
    <MonomerOverview
      monomer={monomer}
      connectedAttachmentPoints={connectedAttachmentPoints}
      selectedAttachmentPoint={selectedAttachmentPoint}
      usage={UsageInMacromolecule.MonomerConnectionsModal}
      update={expanded}
      expanded={expanded}
      attachmentPoints={monomer.listOfAttachmentPoints.map(
        (attachmentPoint) => {
          const disabled = Boolean(
            connectedAttachmentPoints.includes(attachmentPoint) &&
              attachmentPoint !== selectedAttachmentPoint,
          );
          return (
            <AttachmentPoint key={attachmentPoint}>
              <ActionButtonAttachmentPoint
                label={attachmentPoint}
                styleType={
                  attachmentPoint === selectedAttachmentPoint
                    ? 'primary'
                    : 'secondary'
                }
                clickHandler={() =>
                  handleSelectAttachmentPoint(attachmentPoint)
                }
                disabled={disabled}
              />
              <AttachmentPointNameComponent
                data-testid="leaving-group-value"
                disabled={disabled}
              >
                {getLeavingGroup(attachmentPoint)}
              </AttachmentPointNameComponent>
            </AttachmentPoint>
          );
        },
      )}
    />
  );
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
