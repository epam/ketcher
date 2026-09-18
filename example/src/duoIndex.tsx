import './index.css';
import { createRoot } from 'react-dom/client';
import DuoApp from './DuoApp';

const container = document.getElementById('root');
const root = createRoot(container as HTMLElement);
root.render(<DuoApp />);
