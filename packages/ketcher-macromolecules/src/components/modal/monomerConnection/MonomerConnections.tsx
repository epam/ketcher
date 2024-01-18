import styled from '@emotion/styled';
import { ActionButton } from 'components/shared/actionButton';
import { Modal } from 'components/shared/modal';
import { StructRender } from 'ketcher-react';
import { useAppSelector } from 'hooks';
import { selectEditor } from 'state/common';
import { useEffect, useState } from 'react';
import {
  AttachmentPointList,
  AttachmentPoint,
  AttachmentPointName,
  MonomerName,
  ConnectionSymbol,
  AttachmentPointsRow,
  ModalContent,
} from './styledComponents';
import { MonomerConnectionProps } from '../modalContainer/types';
import { BaseMonomer, LeavingGroup } from 'ketcher-core';

interface IStyledButtonProps {
  disabled: boolean;
}
interface IStyledStyledStructRender {
  isExpanded?: boolean;
}

const StyledModal = styled(Modal)({
  '& .MuiPaper-root': {
    background: '#fff !important',
  },

  '& .MuiDialogContent-root': {
    overflow: 'hidden',
  },
});

export const StyledStructRender = styled(
  StructRender,
)<IStyledStyledStructRender>(({ theme, isExpanded }) => ({
  display: 'flex',
  border: `1.5px solid ${theme.ketcher.outline.color}`,
  borderRadius: '6px',
  padding: 5,
  maxHeight: '100%',
  minHeight: '150px',
  height: isExpanded ? 'auto' : '150px',
  width: isExpanded ? 'auto' : '150px',
  alignSelf: 'stretch',
  '& svg': {
    maxWidth: 'fit-content',
    margin: 'auto',
  },
}));

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
}: MonomerConnectionProps): React.ReactElement => {
  const editor = useAppSelector(selectEditor);

  if (!firstMonomer || !secondMonomer) {
    throw new Error('Monomers must exist!');
  }

  const [firstSelectedAttachmentPoint, setFirstSelectedAttachmentPoint] =
    useState<string | null>(getDefaultAttachmentPoint(firstMonomer));
  const [secondSelectedAttachmentPoint, setSecondSelectedAttachmentPoint] =
    useState<string | null>(getDefaultAttachmentPoint(secondMonomer));
  const [modalExpanded, setModalExpanded] = useState(false);

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
      title="Select connection points"
      isOpen={isModalOpen}
      onClose={cancelBondCreationAndClose}
      showExpandButton
      modalWidth="358px"
      expanded={modalExpanded}
      setExpanded={setModalExpanded}
    >
      <Modal.Content>
        <ModalContent>
          <AttachmentPointsRow>
            <MonomerName isExpanded={modalExpanded}>
              {firstMonomer.monomerItem.props.Name}
            </MonomerName>
            <AttachmentPointSelectionPanel
              monomer={firstMonomer}
              selectedAttachmentPoint={firstSelectedAttachmentPoint}
              onSelectAttachmentPoint={setFirstSelectedAttachmentPoint}
              expanded={modalExpanded}
            />
            <span />
            <ConnectionSymbol />
            <span />
            <MonomerName isExpanded={modalExpanded}>
              {secondMonomer.monomerItem.props.Name}
            </MonomerName>

            <AttachmentPointSelectionPanel
              monomer={secondMonomer}
              selectedAttachmentPoint={secondSelectedAttachmentPoint}
              onSelectAttachmentPoint={setSecondSelectedAttachmentPoint}
              expanded={modalExpanded}
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
  }, [selectedAttachmentPoint, monomer]);

  const getLeavingGroup = (attachmentPoint): LeavingGroup => {
    const { MonomerCaps } = monomer.monomerItem.props;
    if (!MonomerCaps) {
      return 'H';
    }
    const leavingGroup = MonomerCaps[attachmentPoint];
    return leavingGroup === 'O' ? 'OH' : (leavingGroup as LeavingGroup);
  };
  let bond;
  if (selectedAttachmentPoint) {
    bond = monomer.getPotentialBond(selectedAttachmentPoint);
  }

  const handleSelectAttachmentPoint = (attachmentPoint: string) => {
    const newBonds = { ...monomer.attachmentPointsToBonds };

    if (selectedAttachmentPoint) {
      newBonds[selectedAttachmentPoint] = null;
    }

    newBonds[attachmentPoint] = bond;
    setBonds(newBonds);

    onSelectAttachmentPoint(attachmentPoint);

    const newConnectedAttachmentPoints = getConnectedAttachmentPoints(newBonds);
    setConnectedAttachmentPoints(newConnectedAttachmentPoints);
  };

  return (
    <>
      <StyledStructRender
        struct={monomer.monomerItem.struct}
        options={{
          connectedMonomerAttachmentPoints: connectedAttachmentPoints,
          currentlySelectedMonomerAttachmentPoint:
            selectedAttachmentPoint ?? undefined,
          labelInMonomerConnectionsModal: true,
          needCache: false,
        }}
        update={expanded}
        isExpanded={expanded}
      />
      <AttachmentPointList>
        {monomer.listOfAttachmentPoints.map((attachmentPoint) => {
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
              <AttachmentPointName
                data-testid="leaving-group-value"
                disabled={disabled}
              >
                {getLeavingGroup(attachmentPoint)}
              </AttachmentPointName>
            </AttachmentPoint>
          );
        })}
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
