import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import 'url-search-params-polyfill';
import './index.css';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import App from './App';
import PopupApp from './PopupApp';
import DuoApp from './DuoApp';
import ClosableApp from './ClosableApp';

const container = document.getElementById('root');
const root = createRoot(container as HTMLElement);
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/closable" element={<ClosableApp />} />
      <Route path="/popup" element={<PopupApp />} />
      <Route path="/duo" element={<DuoApp />} />
      <Route path="*" element={<App />} />
    </Routes>
  </BrowserRouter>,
);
