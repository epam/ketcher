/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/
import { Provider } from 'react-redux';
import { useEffect, useRef } from 'react';
import { Global, ThemeProvider } from '@emotion/react';
import { createTheme } from '@mui/material/styles';
import { merge } from 'lodash';
import { SdfSerializer } from 'ketcher-core';
import monomersData from './data/monomers.sdf';

import { store } from 'state';
import {
  defaultTheme,
  muiOverrides,
  EditorTheme,
  MergedThemeType,
} from 'theming/defaultTheme';
import { getGlobalStyles } from 'theming/globalStyles';
import { Layout } from 'components/Layout';
import { MonomerLibrary } from 'components/monomerLibrary';
import { Menu } from 'components/menu';
import {
  createEditor,
  selectEditor,
  selectEditorActiveTool,
} from 'state/common';
import { loadMonomerLibrary } from 'state/library';
import { useAppDispatch, useAppSelector } from 'hooks';
import { openModal } from 'state/modal';
import {
  modalComponentList,
  ModalContainer,
} from 'components/modal/modalContainer';
import { FullscreenButton } from 'components/FullscreenButton';
import { DeepPartial } from './types';
import { EditorClassName } from './constants';

const muiTheme = createTheme(muiOverrides);

interface EditorContainerProps {
  onInit?: () => void;
  theme?: DeepPartial<EditorTheme>;
}

interface EditorProps {
  theme?: DeepPartial<EditorTheme>;
}

function EditorContainer({ onInit, theme }: EditorContainerProps) {
  const rootElRef = useRef<HTMLDivElement>(null);
  const editorTheme: EditorTheme = theme
    ? merge(defaultTheme, theme)
    : defaultTheme;

  const mergedTheme: MergedThemeType = merge(muiTheme, {
    ketcher: editorTheme,
  });

  useEffect(() => {
    onInit?.();
  }, [onInit]);

  return (
    <Provider store={store}>
      <ThemeProvider theme={mergedTheme}>
        <Global styles={getGlobalStyles} />
        <div ref={rootElRef} className={EditorClassName}>
          <Editor theme={editorTheme} />
        </div>
      </ThemeProvider>
    </Provider>
  );
}

function Editor({ theme }: EditorProps) {
  const dispatch = useAppDispatch();
  const canvasRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    dispatch(createEditor({ theme, canvas: canvasRef.current }));
    const serializer = new SdfSerializer();
    const library = serializer.deserialize(monomersData);
    dispatch(loadMonomerLibrary(library));
  }, [dispatch]);

  return (
    <>
      <Layout>
        <Layout.Left>
          <MenuComponent />
        </Layout.Left>

        <Layout.Main>
          <svg
            id="polymer-editor-canvas"
            ref={canvasRef}
            width="100%"
            height="100%"
          >
            <defs>
              <symbol id="peptide" viewBox="0 0 70 61" width="70" height="61">
                <path d="M16.9236 1.00466C17.2801 0.383231 17.9418 6.10888e-07 18.6583 5.98224e-07L51.3417 2.04752e-08C52.0582 7.81036e-09 52.7199 0.383234 53.0764 1.00466L69.4289 29.5047C69.7826 30.1211 69.7826 30.8789 69.4289 31.4953L53.0764 59.9953C52.7199 60.6168 52.0582 61 51.3417 61H18.6583C17.9418 61 17.2801 60.6168 16.9236 59.9953L0.571095 31.4953C0.217407 30.8789 0.217408 30.1211 0.571096 29.5047L16.9236 1.00466Z"></path>
              </symbol>
            </defs>
          </svg>
        </Layout.Main>

        <Layout.Right>
          <MonomerLibrary />
        </Layout.Right>
      </Layout>

      <FullscreenButton />

      <ModalContainer />
    </>
  );
}

function MenuComponent() {
  const dispatch = useAppDispatch();
  const activeTool = useAppSelector(selectEditorActiveTool);
  const editor = useAppSelector(selectEditor);
  const menuItemChanged = (name) => {
    if (modalComponentList[name]) {
      dispatch(openModal(name));
    } else {
      editor.events.selectTool.dispatch(name);
    }
  };

  return (
    <Menu onItemClick={menuItemChanged} activeMenuItem={activeTool}>
      <Menu.Group>
        <Menu.Submenu>
          <Menu.Item itemId="open" />
          <Menu.Item itemId="save" />
        </Menu.Submenu>
      </Menu.Group>
      <Menu.Group>
        <Menu.Item itemId="undo" />
      </Menu.Group>
      <Menu.Group>
        <Menu.Item itemId="erase" />
        <Menu.Submenu vertical>
          <Menu.Item itemId="select-lasso" />
          <Menu.Item itemId="select-rectangle" />
          <Menu.Item itemId="select-fragment" />
        </Menu.Submenu>
        <Menu.Submenu>
          <Menu.Item itemId="shape-rectangle" />
          <Menu.Item itemId="shape-ellipse" />
        </Menu.Submenu>
        <Menu.Submenu>
          <Menu.Item itemId="transform-flip-h" />
          <Menu.Item itemId="transform-flip-v" />
        </Menu.Submenu>
      </Menu.Group>
      <Menu.Group>
        <Menu.Item itemId="bond-single" />
      </Menu.Group>
      <Menu.Group divider>
        <Menu.Item itemId="bracket" />
      </Menu.Group>
      <Menu.Group>
        <Menu.Item itemId="settings" />
        <Menu.Item itemId="help" />
      </Menu.Group>
    </Menu>
  );
}

export { EditorContainer as Editor };
