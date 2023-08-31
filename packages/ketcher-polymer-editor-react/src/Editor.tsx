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
  selectTool,
} from 'state/common';
import { loadMonomerLibrary } from 'state/library';
import { useAppDispatch, useAppSelector } from 'hooks';
import {
  closeErrorTooltip,
  openErrorTooltip,
  openModal,
  selectErrorTooltipText,
} from 'state/modal';
import {
  modalComponentList,
  ModalContainer,
} from 'components/modal/modalContainer';
import { FullscreenButton } from 'components/FullscreenButton';
import { DeepPartial } from './types';
import { EditorClassName } from './constants';
import { Snackbar } from '@mui/material';
import {
  StyledIconButton,
  StyledToast,
  StyledToastContent,
} from 'components/shared/StyledToast/styles';

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
  const errorTooltipText = useAppSelector(selectErrorTooltipText);
  const editor = useAppSelector(selectEditor);
  useEffect(() => {
    dispatch(createEditor({ theme, canvas: canvasRef.current }));
    const serializer = new SdfSerializer();
    const library = serializer.deserialize(monomersData);
    dispatch(loadMonomerLibrary(library));
  }, [dispatch]);

  useEffect(() => {
    if (editor) {
      editor.events.error.add((errorText) =>
        dispatch(openErrorTooltip(errorText)),
      );
    }
  }, [editor]);

  const handleCloseErrorTooltip = () => {
    dispatch(closeErrorTooltip());
  };

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
              <symbol
                id="peptide-selection"
                viewBox="0 0 70 61"
                width="70"
                height="61"
              >
                <path
                  d="M18.2246 1.75116C18.3137 1.59581 18.4792 1.5 18.6583 1.5L51.3417 1.5C51.5208 1.5 51.6863 1.59581 51.7754 1.75116L53.06 1.01408L51.7754 1.75117L68.1279 30.2512C68.2163 30.4053 68.2163 30.5947 68.1279 30.7488L51.7754 59.2488C51.6863 59.4042 51.5208 59.5 51.3417 59.5H18.6583C18.4792 59.5 18.3137 59.4042 18.2246 59.2488L1.87215 30.7488C1.78372 30.5947 1.78372 30.4053 1.87215 30.2512L18.2246 1.75116Z"
                  fill="none"
                  stroke="#0097A8"
                  strokeWidth="3"
                />{' '}
              </symbol>
              <symbol id="chem" viewBox="0 0 59 59" width="59" height="59">
                <rect width="59" height="59" rx="1.5" fill="#F5F6F7" />
              </symbol>
              <symbol
                id="chem-selection"
                viewBox="0 0 59 59"
                width="59"
                height="59"
              >
                <rect
                  width="59"
                  height="59"
                  rx="1.5"
                  stroke="#0097A8"
                  fill="none"
                  strokeWidth="3"
                />
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

      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={Boolean(errorTooltipText)}
        onClose={handleCloseErrorTooltip}
        autoHideDuration={6000}
      >
        <StyledToast id="error-tooltip">
          <StyledToastContent>{errorTooltipText}</StyledToastContent>
          <StyledIconButton
            iconName="close"
            onClick={handleCloseErrorTooltip}
          ></StyledIconButton>
        </StyledToast>
      </Snackbar>
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
      dispatch(selectTool(name));
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
        <Menu.Item itemId="bond-single" title="Single Bond (1)" />
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
