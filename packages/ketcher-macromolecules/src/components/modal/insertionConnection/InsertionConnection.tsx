import React, { useState } from 'react';
import styled from '@emotion/styled';
import { useTranslation } from 'react-i18next';
import { Modal } from 'components/shared/modal';
import { useAppSelector } from 'hooks';
import { selectEditor } from 'state/common';
import { ModalContent } from 'components/modal/monomerConnection/styledComponents';
import { InsertionConnectionProps } from '../modalContainer/types';
import {
  AmbiguousMonomer,
  BaseMonomer,
  UsageInMacromolecule,
  AttachmentPointName,
} from 'ketcher-core';
import {
  StyledStructRender,
  AttachmentPointList,
} from 'components/shared/ConnectionOverview/components/MonomerOverview/MonomerOverview.styles';
import {
  MonomerName as MonomerNameBase,
  ConnectionSymbol,
} from 'components/shared/ConnectionOverview/ConnectionOverview.styles';

const MonomerName = styled(MonomerNameBase)({
  width: '100%',
  maxWidth: 'none',
  textAlign: 'center',
});
import getMonomerName from 'helpers/getMonomerName';
import {
  ActionButtonLeft,
  ActionButtonRight,
} from 'components/modal/monomerConnection/MonomerConnections';

const StyledModal = styled(Modal)({
  '& .MuiPaper-root': {
    background: '#fff !important',
  },
  '& .MuiDialogContent-root': {
    overflow: 'hidden',
  },
});

const ThreeMonomerRow = styled.div({
  display: 'grid',
  gridAutoFlow: 'column',
  gridTemplateRows: 'auto 1fr auto',
  // minmax(0, 1fr), not 1fr: an AP row with many buttons must wrap within
  // its column instead of growing the column (and the whole modal) to fit.
  gridTemplateColumns: 'minmax(0, 1fr) 10px minmax(0, 1fr) 10px minmax(0, 1fr)',
  justifyContent: 'center',
  alignItems: 'flex-start',
  padding: '12px',
  paddingBottom: 0,
  height: '100%',
  columnGap: '12px',
  rowGap: '8px',
});

interface ILargeStructRenderProps {
  isExpanded?: boolean;
}

const LargeStructRender = styled(StyledStructRender)<ILargeStructRenderProps>(
  ({ isExpanded }) =>
    isExpanded
      ? { alignSelf: 'stretch' }
      : {
          width: '200px',
          height: '200px',
          minHeight: '200px',
        },
);

interface ApButtonProps {
  selected: boolean;
  disabled?: boolean;
}

const ApButton = styled.button<ApButtonProps>(
  ({ theme, selected, disabled }) => ({
    width: '28px',
    height: '28px',
    padding: 0,
    borderRadius: '4px',
    // A selectable-but-unselected AP (the swap target) gets an outline so it
    // reads as clickable, not as a disabled/fixed value like the read-only rows.
    border:
      !selected && !disabled
        ? `1px solid ${theme.ketcher.color.border.secondary}`
        : 'none',
    cursor: 'pointer',
    backgroundColor: selected
      ? theme.ketcher.color.button.primary.active
      : disabled
        ? '#E1E5EA'
        : '#fff',
    color: selected ? '#fff' : '#333333',
    fontSize: theme.ketcher.font.size.small,
    fontWeight: selected ? 'bold' : 'normal',
    '&:hover': {
      borderColor:
        !selected && !disabled
          ? theme.ketcher.color.button.primary.active
          : undefined,
    },
    '&:disabled': {
      opacity: 0.4,
      cursor: 'default',
    },
  }),
);

const ApName = styled.span(({ theme }) => ({
  textAlign: 'center',
  fontSize: theme.ketcher.font.size.small,
  color: theme.ketcher.color.text.light,
}));

const ApItem = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '2px',
});

type ApRowAlign = 'left' | 'right' | 'center';

const ApRow = styled.div<{ align?: ApRowAlign }>(({ align = 'center' }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent:
    align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center',
  gap: '6px',
  width: '100%',
  maxWidth: '200px',
  marginLeft: align === 'right' ? 'auto' : 0,
  marginRight: align === 'left' ? 'auto' : 0,
  ...(align === 'center' && { margin: '0 auto' }),
}));

interface ITwoApRowsProps {
  isExpanded?: boolean;
}

// A fixed max-width (matching the collapsed struct picture) keeps a monomer
// with many APs wrapping onto extra lines instead of widening the modal.
const TwoApRows = styled.div<ITwoApRowsProps>(({ isExpanded }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-start',
  width: '100%',
  maxWidth: isExpanded ? 'none' : '200px',
}));

const ApRowGroup = styled.div({
  flex: '1 1 0',
  minWidth: 0,
});

const ApRowSeparator = styled.div({
  flex: '0 0 auto',
  width: '1px',
  height: '50px',
  margin: '0 6px',
  backgroundColor: '#B4B9D6',
});

function getLeavingGroup(monomer: BaseMonomer, ap: string): string | null {
  const isAmbiguous = monomer instanceof AmbiguousMonomer;
  if (!monomer.monomerCaps) return isAmbiguous ? null : 'H';
  return monomer.monomerCaps[ap] ?? null;
}

interface ApButtonSetProps {
  monomer: BaseMonomer;
  selectedAp: string | null;
  onSelect?: (ap: string) => void;
  readOnly?: boolean;
  align?: ApRowAlign;
  testIdPrefix?: string;
}

function ApButtonSet({
  monomer,
  selectedAp,
  onSelect,
  readOnly = false,
  align = 'center',
  testIdPrefix = 'ap',
}: ApButtonSetProps): React.ReactElement {
  return (
    <ApRow align={align}>
      {monomer.listOfAttachmentPoints.map((ap) => (
        <ApItem key={ap}>
          <ApButton
            selected={ap === selectedAp}
            disabled={readOnly}
            onClick={() => !readOnly && onSelect?.(ap)}
            data-testid={`${testIdPrefix}-${ap}`}
          >
            {ap}
          </ApButton>
          <ApName>{getLeavingGroup(monomer, ap)}</ApName>
        </ApItem>
      ))}
    </ApRow>
  );
}

const InsertionConnection = ({
  onClose,
  isModalOpen,
  leftMonomer,
  newMonomer,
  rightMonomer,
  leftAp,
  rightAp,
}: Readonly<InsertionConnectionProps>): React.ReactElement => {
  const { t } = useTranslation('macromoleculesDialogs');
  const editor = useAppSelector(selectEditor);

  if (!leftMonomer || !newMonomer || !rightMonomer || !leftAp || !rightAp) {
    throw new Error('InsertionConnection: required props are missing');
  }

  const freeAps = newMonomer.listOfAttachmentPoints.filter(
    (ap) => newMonomer.attachmentPointsToBonds[ap] == null,
  );

  const [leftNewAp, setLeftNewAp] = useState<string | null>(freeAps[0] ?? null);
  const [rightNewAp, setRightNewAp] = useState<string | null>(
    freeAps[1] ?? null,
  );
  const [isModalExpanded, setIsModalExpanded] = useState(false);

  // Picking the AP already assigned to the other side swaps the two
  // selections instead of being blocked, so the user can flip a choice
  // without first clearing it.
  const selectLeftNewAp = (ap: string) => {
    if (ap === rightNewAp) {
      setRightNewAp(leftNewAp);
    }
    setLeftNewAp(ap);
  };

  const selectRightNewAp = (ap: string) => {
    if (ap === leftNewAp) {
      setLeftNewAp(rightNewAp);
    }
    setRightNewAp(ap);
  };

  const cancel = () => {
    editor?.events.cancelBondCreationViaModal.dispatch(newMonomer);
    onClose();
  };

  const connect = () => {
    if (!leftNewAp || !rightNewAp) return;
    editor?.events.createInsertionBondsViaModal.dispatch({
      leftMonomer,
      newMonomer,
      rightMonomer,
      leftAp: leftAp as AttachmentPointName,
      leftNewAp: leftNewAp as AttachmentPointName,
      rightNewAp: rightNewAp as AttachmentPointName,
      rightAp: rightAp as AttachmentPointName,
    });
    onClose();
  };

  return (
    <StyledModal
      title={t('monomerConnection.selectTitle')}
      isOpen={isModalOpen}
      onClose={cancel}
      showExpandButton
      modalWidth="auto"
      isDraggable
      isResizable={false}
      expanded={isModalExpanded}
      setExpanded={setIsModalExpanded}
      testId="insertion-connection-modal"
    >
      <Modal.Content>
        <ModalContent>
          <ThreeMonomerRow>
            {/* Left original monomer */}
            <MonomerName isExpanded={isModalExpanded}>
              {getMonomerName(leftMonomer, t)}
            </MonomerName>
            <LargeStructRender
              key={`left-${isModalExpanded}`}
              struct={leftMonomer.monomerItem.struct}
              options={{
                connectedMonomerAttachmentPoints: Object.entries(
                  leftMonomer.attachmentPointsToBonds,
                )
                  .filter(([, bond]) => bond != null)
                  .map(([ap]) => ap),
                currentlySelectedMonomerAttachmentPoint: leftAp,
                usageInMacromolecule:
                  UsageInMacromolecule.InsertionConnectionsModal,
                labelInMonomerConnectionsModal: true,
                needCache: false,
              }}
              update={isModalExpanded}
              isExpanded={isModalExpanded}
              testId="left-monomer-preview"
            />
            <AttachmentPointList>
              <ApButtonSet
                monomer={leftMonomer}
                selectedAp={leftAp}
                readOnly
                align="right"
                testIdPrefix="left-ap"
              />
            </AttachmentPointList>

            {/* Separator */}
            <span />
            <ConnectionSymbol />
            <span />

            {/* New (inserted) monomer — two selectable AP rows */}
            <MonomerName isExpanded={isModalExpanded}>
              {getMonomerName(newMonomer, t)}
            </MonomerName>
            <LargeStructRender
              key={`new-${isModalExpanded}`}
              struct={newMonomer.monomerItem.struct}
              options={{
                connectedMonomerAttachmentPoints: [],
                currentlySelectedMonomerAttachmentPoint: leftNewAp ?? undefined,
                usageInMacromolecule:
                  UsageInMacromolecule.InsertionConnectionsModal,
                labelInMonomerConnectionsModal: true,
                needCache: false,
              }}
              update={isModalExpanded}
              isExpanded={isModalExpanded}
              testId="new-monomer-preview"
            />
            <AttachmentPointList>
              <TwoApRows isExpanded={isModalExpanded}>
                <ApRowGroup>
                  <ApButtonSet
                    monomer={newMonomer}
                    selectedAp={leftNewAp}
                    onSelect={selectLeftNewAp}
                    align="left"
                    testIdPrefix="left-new-ap"
                  />
                </ApRowGroup>
                <ApRowSeparator />
                <ApRowGroup>
                  <ApButtonSet
                    monomer={newMonomer}
                    selectedAp={rightNewAp}
                    onSelect={selectRightNewAp}
                    align="right"
                    testIdPrefix="right-new-ap"
                  />
                </ApRowGroup>
              </TwoApRows>
            </AttachmentPointList>

            {/* Separator */}
            <span />
            <ConnectionSymbol />
            <span />

            {/* Right original monomer */}
            <MonomerName isExpanded={isModalExpanded}>
              {getMonomerName(rightMonomer, t)}
            </MonomerName>
            <LargeStructRender
              key={`right-${isModalExpanded}`}
              struct={rightMonomer.monomerItem.struct}
              options={{
                connectedMonomerAttachmentPoints: Object.entries(
                  rightMonomer.attachmentPointsToBonds,
                )
                  .filter(([, bond]) => bond != null)
                  .map(([ap]) => ap),
                currentlySelectedMonomerAttachmentPoint: rightAp,
                usageInMacromolecule:
                  UsageInMacromolecule.InsertionConnectionsModal,
                labelInMonomerConnectionsModal: true,
                needCache: false,
              }}
              update={isModalExpanded}
              isExpanded={isModalExpanded}
              testId="right-monomer-preview"
            />
            <AttachmentPointList>
              <ApButtonSet
                monomer={rightMonomer}
                selectedAp={rightAp}
                readOnly
                align="left"
                testIdPrefix="right-ap"
              />
            </AttachmentPointList>
          </ThreeMonomerRow>
        </ModalContent>
      </Modal.Content>

      <Modal.Footer>
        <ActionButtonLeft
          label={t('common:button.cancel')}
          data-testid="cancel-button"
          styleType="secondary"
          clickHandler={cancel}
        />
        <ActionButtonRight
          label={t('monomerConnection.connect')}
          data-testid="Connect-button"
          disabled={!leftNewAp || !rightNewAp || leftNewAp === rightNewAp}
          clickHandler={connect}
        />
      </Modal.Footer>
    </StyledModal>
  );
};

export { InsertionConnection };
