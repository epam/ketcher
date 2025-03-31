import { TabPanelBox, TabPanelDiv } from './TabPanel.styles';
import { ReactNode } from 'react';

type TabPanelProps = {
  index: number;
  value: number;
  children: ReactNode;
};

const TabPanel = ({ children, value, index }: TabPanelProps) => {
  return (
    <TabPanelDiv role="tabpanel" hidden={value !== index} id={index.toString()}>
      {value === index && <TabPanelBox>{children}</TabPanelBox>}
    </TabPanelDiv>
  );
};

export default TabPanel;
