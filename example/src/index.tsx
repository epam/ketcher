import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import 'url-search-params-polyfill';
import './index.css';
import { Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import App from './App';

const PopupApp = lazy(() => import('./PopupApp'));
const DuoApp = lazy(() => import('./DuoApp'));
const ClosableApp = lazy(() => import('./ClosableApp'));

const loadingFallback = <div>Loading...</div>;

const container = document.getElementById('root');
const root = createRoot(container as HTMLElement);
root.render(
  <BrowserRouter>
    <Suspense fallback={loadingFallback}>
      <Routes>
        <Route path="/closable" element={<ClosableApp />} />
        <Route path="/popup" element={<PopupApp />} />
        <Route path="/duo" element={<DuoApp />} />
        <Route path="*" element={<App />} />
      </Routes>
    </Suspense>
  </BrowserRouter>,
);
