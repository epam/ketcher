/** Matches `npm run serve:standalone` (see root package.json / CI workflows). */
const DEFAULT_KETCHER_ORIGIN = 'http://127.0.0.1:4002';

/** Paths are relative to the static root of `example/dist/<mode>` (served by `serve`). */
export const STANDALONE_URL = '/index.html';
export const REMOTE_URL = '/index.html';
export const STANDALONE_POPUP_URL = `/popup.html`;
export const REMOTE_POPUP_URL = `/popup.html`;

export const DEFAULT_KETCHER_STANDALONE_URL = `${DEFAULT_KETCHER_ORIGIN}${STANDALONE_URL}`;
export const DEFAULT_KETCHER_POPUP_URL = `${DEFAULT_KETCHER_ORIGIN}${STANDALONE_POPUP_URL}`;

export const API_INDIGO_URL = `${process.env.KETCHER_URL}/v2/indigo`;
export const MODES = {
  STANDALONE: 'standalone',
  REMOTE: 'remote',
};

export const PROFILES = {
  FULLSCALE: 'fullscale',
  REACT_MUI_MATERIAL_DIALOG_857X648: 'react-mui-material-dialog-857x648',
};

export const MAX_BOND_LENGTH = 50;
export const REQUEST_IS_FINISHED = 'REQUEST_IS_FINISHED';
