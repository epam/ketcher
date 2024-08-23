import { ReactNode } from 'react';
import { BaseMonomer } from 'ketcher-core';
import {
  AttachmentPointsRow,
  ConnectionSymbol,
  MonomerName,
} from './ConnectionOverview.styles';

interface Props {
  firstMonomer: BaseMonomer;
  secondMonomer: BaseMonomer;
  expanded?: boolean;
  firstMonomerOverview: ReactNode;
  secondMonomerOverview: ReactNode;
}

const ConnectionOverview = ({
  firstMonomer,
  secondMonomer,
  expanded,
  firstMonomerOverview,
  secondMonomerOverview,
}: Props) => {
  return (
    <AttachmentPointsRow>
      <MonomerName isExpanded={expanded}>
        {firstMonomer.monomerItem.props.Name}
      </MonomerName>
      {firstMonomerOverview}
      <span />
      <ConnectionSymbol />
      <span />
      <MonomerName isExpanded={expanded}>
        {secondMonomer.monomerItem.props.Name}
      </MonomerName>
      {secondMonomerOverview}
    </AttachmentPointsRow>
  );
};

export default ConnectionOverview;
