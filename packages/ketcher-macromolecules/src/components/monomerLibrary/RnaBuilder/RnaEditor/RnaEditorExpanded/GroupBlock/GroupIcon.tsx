import { GroupIcon as StyledGroupIcon, GroupIconContainer } from './styles';
import { memo } from 'react';
import { IconName } from 'ketcher-react';

type Props = {
  name: IconName;
  selected: boolean | undefined;
  empty: boolean;
  multiple?: boolean;
};

const GroupIcon = ({ selected, empty, name, multiple = false }: Props) => {
  return (
    <GroupIconContainer multiple={multiple}>
      {Array.from({ length: multiple ? 4 : 1 }, (_, index) => (
        <StyledGroupIcon
          key={index}
          selected={selected}
          empty={empty}
          name={name}
        />
      ))}
    </GroupIconContainer>
  );
};

export default memo(GroupIcon);
