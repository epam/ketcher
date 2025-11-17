import Tab from '@mui/material/Tab';
import { Icon } from 'components';
import Tabs from '@mui/material/Tabs';
import { useState } from 'react';

export const RnaPresetTabs = () => {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleChange = (_, newValue: number) => {
    setSelectedTab(newValue);
  };

  return (
    <div>
      <Tabs value={selectedTab} onChange={handleChange}>
        <Tab label="Preset" icon={<Icon name="preset" />} />
        <Tab label="Base" icon={<Icon name="base" />} />
        <Tab label="Sugar" icon={<Icon name="sugar" />} />
        <Tab label="Phosphate" icon={<Icon name="phosphate" />} />
      </Tabs>
      <div>
        {selectedTab === 0 && <div>Preset Content</div>}
        {selectedTab === 1 && <div>Base Content</div>}
        {selectedTab === 2 && <div>Sugar Content</div>}
        {selectedTab === 3 && <div>Phosphate Content</div>}
      </div>
    </div>
  );
};
