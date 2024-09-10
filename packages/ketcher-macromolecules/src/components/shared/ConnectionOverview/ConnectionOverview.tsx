import { ReactNode } from 'react';
import { BaseMonomer } from 'ketcher-core';
import {
  AttachmentPointsRow,
  ConnectionSymbol,
  MonomerName,
} from './ConnectionOverview.styles';
import getMonomerName from 'helpers/getMonomerName';

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
  const firstMonomerName = getMonomerName(firstMonomer);
  const secondMonomerName = getMonomerName(secondMonomer);

  return (
    <AttachmentPointsRow>
      <MonomerName isExpanded={expanded}>{firstMonomerName}</MonomerName>
      {firstMonomerOverview}
      <span />
      <ConnectionSymbol />
      <span />
      <MonomerName isExpanded={expanded}>{secondMonomerName}</MonomerName>
      {secondMonomerOverview}
    </AttachmentPointsRow>
  );
};

export default ConnectionOverview;
