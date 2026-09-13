import './index.css';
import { createRoot } from 'react-dom/client';
import PopupApp from './PopupApp';

const container = document.getElementById('root');
const root = createRoot(container as HTMLElement);
root.render(<PopupApp />);
