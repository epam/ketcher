import styled from '@emotion/styled';
import { ActionButton } from 'components/shared/actionButton';
import { Modal } from 'components/shared/modal';
import { BaseMonomer } from 'ketcher-core/dist/domain/entities/BaseMonomer';
import { StructRender } from 'ketcher-react';
import { useState } from 'react';
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
}: MonomerConnectionProps) => {
  if (!firstMonomer || !secondMonomer) {
    throw new Error('Monomers must exist!');
  }

  const firstMonomerBonds = firstMonomer.attachmentPointsToBonds;
  const secondMonomerBonds = secondMonomer.attachmentPointsToBonds;

  const [firstAttachmentPoint, setFirstAttachmentPoint] = useState<
    string | null
  >(getDefaultAttachmentPoint(firstMonomerBonds));
  const [secondAttachmentPoint, setSecondAttachmentPoint] = useState<
    string | null
  >(getDefaultAttachmentPoint(secondMonomerBonds));

  if (!firstMonomerBonds || !secondMonomerBonds) {
    throw new Error('Bonds must exist!');
  }

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
    if (!firstAttachmentPoint || !secondAttachmentPoint) {
      throw new Error('Attachment points cannot be falsy');
    }

    if (firstAttachmentPoint === secondAttachmentPoint) {
      CoreEditor.provideEditorInstance().events.error.dispatch(
        "You can't connect monomers by attachment points of the same group",
      );

      return;
    }

    onCreateBond(
      secondMonomer,
      firstAttachmentPoint || '',
      secondAttachmentPoint || '',
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
            <MonomerName>{firstMonomer.monomerItem.props.Name}</MonomerName>
            <StyledStructRender struct={firstMonomer.monomerItem.struct} />
            <AttachmentPointList>
              {convertBondsToAttchmentPointButtons(
                firstMonomerBonds,
                setFirstAttachmentPoint,
                firstAttachmentPoint,
              )}
            </AttachmentPointList>
          </Column>
          <Column>
            <MonomerName>{secondMonomer.monomerItem.props.Name}</MonomerName>
            <StyledStructRender struct={secondMonomer.monomerItem.struct} />
            <AttachmentPointList>
              {convertBondsToAttchmentPointButtons(
                secondMonomerBonds,
                setSecondAttachmentPoint,
                secondAttachmentPoint,
              )}
            </AttachmentPointList>
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
          disabled={!firstAttachmentPoint || !secondAttachmentPoint}
          clickHandler={tryConnectingMonomers}
        />
      </Modal.Footer>
    </StyledModal>
  );
};

function convertBondsToAttchmentPointButtons(
  bonds: Record<string, unknown>,
  attachmentPointSetter: (name: string) => void,
  selectedAttachmentPoint: string | null,
): React.ReactElement {
  return (
    <>
      {Object.entries(bonds).map(([attachmentPoint, bond]) => {
        return (
          <AttachmentPoint key={attachmentPoint}>
            <ActionButton
              label={attachmentPoint}
              styleType={
                attachmentPoint === selectedAttachmentPoint
                  ? 'primary'
                  : 'secondary'
              }
              clickHandler={() => attachmentPointSetter(attachmentPoint)}
              disabled={Boolean(bond)}
            />
            <AttachmentPointName>H</AttachmentPointName>
          </AttachmentPoint>
        );
      })}
    </>
  );
}

function getDefaultAttachmentPoint(
  bonds: Record<string, unknown>,
): string | null {
  let defaultAttachmentPoint = '';

  const isExactlyOneAttachmentPointFree =
    Object.entries(bonds).filter(([attachmentPoint, bond]) => {
      const isBondFree = bond == null;

      if (isBondFree) {
        defaultAttachmentPoint = attachmentPoint;
      }

      return isBondFree;
    }).length === 1;

  if (isExactlyOneAttachmentPointFree) {
    return defaultAttachmentPoint;
  }

  return null;
}

export { MonomerConnection };
