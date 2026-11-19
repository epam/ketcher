import { GroupIcon as StyledGroupIcon, GroupIconContainer } from './styles';
import { memo } from 'react';
import { IconName } from 'ketcher-react';

type Props = {
  name: IconName;
  selected: boolean | undefined;
  empty: boolean;
};

const GroupIcon = ({ selected, empty, name }: Props) => {
  return (
    <GroupIconContainer>
      <StyledGroupIcon selected={selected} empty={empty} name={name} />
    </GroupIconContainer>
  );
};

export default memo(GroupIcon);
