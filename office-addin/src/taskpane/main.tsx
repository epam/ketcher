import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { TaskPane } from './TaskPane';
import './taskpane.css';

void Office.onReady((info) => {
  createRoot(document.getElementById('root') as HTMLElement).render(
    <StrictMode>
      <TaskPane inPowerPoint={info.host === Office.HostType.PowerPoint} />
    </StrictMode>,
  );
});
