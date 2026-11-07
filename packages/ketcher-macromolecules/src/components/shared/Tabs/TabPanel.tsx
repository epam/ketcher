import { ReactNode } from 'react';
import Box from '@mui/material/Box';

import styles from './TabPanel.module.less';

type TabPanelProperties = {
  index: number;
  value: number;
  children: ReactNode;
};

const TabPanel = ({ children, value, index }: TabPanelProperties) => {
  return (
    <div
      className={styles.tabPanelDiv}
      role="tabpanel"
      hidden={value !== index}
      id={index.toString()}
    >
      {value === index && (
        <Box className={styles.tabPanelBox}>
          <>{children}</>
        </Box>
      )}
    </div>
  );
};

export default TabPanel;
