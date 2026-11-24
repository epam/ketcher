import { createRoot } from 'react-dom/client';
import { OFFICE_DIALOG_FLAG } from '../shared/messages';
import { EditorApp } from './EditorApp';
import './editor.css';

const inOfficeDialog = new URLSearchParams(window.location.search).has(
  OFFICE_DIALOG_FLAG,
);

void Office.onReady(() => {
  createRoot(document.getElementById('root') as HTMLElement).render(
    <EditorApp inOfficeDialog={inOfficeDialog} />,
  );
});
