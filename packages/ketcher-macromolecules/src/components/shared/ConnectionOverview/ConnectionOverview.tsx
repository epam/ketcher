import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { BaseMonomer } from 'ketcher-core';
import {
  AttachmentPointsRow,
  ConnectionSymbol,
  MonomerName,
} from './ConnectionOverview.styles';
import getMonomerName from 'helpers/getMonomerName';

interface Properties {
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
}: Properties) => {
  const { t } = useTranslation('macromoleculesDialogs');
  const firstMonomerName = getMonomerName(firstMonomer, t);
  const secondMonomerName = getMonomerName(secondMonomer, t);

  return (
    <AttachmentPointsRow>
      <>
        <MonomerName isExpanded={expanded}>{firstMonomerName}</MonomerName>
        {firstMonomerOverview}
        <span />
        <ConnectionSymbol />
        <span />
        <MonomerName isExpanded={expanded}>{secondMonomerName}</MonomerName>
        {secondMonomerOverview}
      </>
    </AttachmentPointsRow>
  );
};

export default ConnectionOverview;
