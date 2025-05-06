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
import { useCallback, useEffect, useRef, useState } from 'react';
import { Global, ThemeProvider } from '@emotion/react';
import { createTheme } from '@mui/material/styles';
import { merge } from 'lodash';
import {
  BaseMonomer,
  DeprecatedFlexModeOrSnakeModePolymerBondRenderer,
  NodeSelection,
  NodesSelection,
} from 'ketcher-core';
import { store } from 'state';
import {
  defaultTheme,
  EditorTheme,
  MergedThemeType,
  muiOverrides,
} from 'theming/defaultTheme';
import { getGlobalStyles } from 'theming/globalStyles';
import { Layout } from 'components/Layout';
import {
  MonomerLibrary,
  MonomerLibraryToggle,
} from 'components/monomerLibrary';
import {
  createEditor,
  destroyEditor,
  selectEditor,
  selectIsHandToolSelected,
  setContextMenuActive,
  toggleMacromoleculesPropertiesWindowVisibility,
} from 'state/common';
import {
  useAppDispatch,
  useAppSelector,
  useSequenceEditInRNABuilderMode,
} from 'hooks';
import { closeErrorTooltip, selectErrorTooltipText } from 'state/modal';
import { ModalContainer } from 'components/modal/modalContainer';
import { DeepPartial } from './types';
import { EditorClassName } from 'ketcher-react';
import { Snackbar } from '@mui/material';
import {
  StyledIconButton,
  StyledToast,
  StyledToastContent,
} from 'components/shared/StyledToast/styles';
import {
  ChemAvatar,
  PeptideAvatar,
  PhosphateAvatar,
  RNABaseAvatar,
  SugarAvatar,
  UnresolvedMonomerAvatar,
  NucleotideAvatar,
  SequenceStartArrow,
  ArrowMarker,
} from 'components/shared/monomerOnCanvas';
import { ErrorModal } from 'components/modal/Error';
import {
  CanvasWrapper,
  EditorWrapper,
  TogglerComponentWrapper,
  TopMenuRightWrapper,
} from './styledComponents';
import { useLoading } from './hooks/useLoading';
import useSetRnaPresets from './hooks/useSetRnaPresets';
import { Loader } from 'components/Loader';
import { FullscreenButton } from 'components/FullscreenButton';
import { LayoutModeButton } from 'components/LayoutModeButton';
import { TriggerEvent, useContextMenu } from 'react-contexify';
import { CONTEXT_MENU_ID } from 'components/contextMenu/types';
import { SequenceItemContextMenu } from 'components/contextMenu/SequenceItemContextMenu/SequenceItemContextMenu';
import { Preview } from 'components/preview/Preview';
import { SequenceTypeGroupButton } from 'components/SequenceTypeGroupButton';
import { TopMenuComponent } from 'components/TopMenuComponent';
import { LeftMenuComponent } from 'components/LeftMenuComponent';
import { ZoomControls } from 'components/ZoomControls/ZoomControls';
import { VerticalDivider } from 'components/menu/styles';
import { PolymerBondContextMenu } from 'components/contextMenu/PolymerBondContextMenu/PolymerBondContextMenu';
import { EditorEvents } from './EditorEvents';
import { SelectedMonomersContextMenu } from 'components/contextMenu/SelectedMonomersContextMenu/SelectedMonomersContextMenu';
import { SequenceSyncEditModeButton } from 'components/SequenceSyncEditModeButton';
import { RootSizeProvider } from './contexts';
import { MacromoleculePropertiesWindow } from 'components/macromoleculeProperties';

const muiTheme = createTheme(muiOverrides);

interface EditorProps {
  theme?: DeepPartial<EditorTheme>;
  togglerComponent?: JSX.Element;
  monomersLibraryUpdate?: string | JSON;
}

interface EditorContainerProps extends EditorProps {
  onInit?: () => void;
}

function EditorContainer({
  onInit,
  theme,
  togglerComponent,
  monomersLibraryUpdate,
}: EditorContainerProps) {
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
        <RootSizeProvider rootRef={rootElRef}>
          <EditorWrapper ref={rootElRef} className={EditorClassName}>
            <Editor
              theme={editorTheme}
              togglerComponent={togglerComponent}
              monomersLibraryUpdate={monomersLibraryUpdate}
            />
          </EditorWrapper>
        </RootSizeProvider>
      </ThemeProvider>
    </Provider>
  );
}

function Editor({
  theme,
  togglerComponent,
  monomersLibraryUpdate,
}: EditorProps) {
  const dispatch = useAppDispatch();
  const canvasRef = useRef<SVGSVGElement>(null);
  const errorTooltipText = useAppSelector(selectErrorTooltipText);
  const editor = useAppSelector(selectEditor);
  const isHandToolSelected = useAppSelector(selectIsHandToolSelected);
  const isLoading = useLoading();
  const [isMonomerLibraryHidden, setIsMonomerLibraryHidden] = useState(false);
  const isSequenceEditInRNABuilderMode = useSequenceEditInRNABuilderMode();
  const [selections, setSelections] = useState<NodeSelection[][]>();
  const [selectedMonomers, setSelectedMonomers] = useState<BaseMonomer[]>([]);
  const { show: showSequenceContextMenu } = useContextMenu({
    id: CONTEXT_MENU_ID.FOR_SEQUENCE,
  });
  const { show: showPolymerBondContextMenu } = useContextMenu({
    id: CONTEXT_MENU_ID.FOR_POLYMER_BOND,
  });
  const { show: showSelectedMonomersContextMenu } = useContextMenu({
    id: CONTEXT_MENU_ID.FOR_SELECTED_MONOMERS,
  });

  useEffect(() => {
    dispatch(
      createEditor({ theme, canvas: canvasRef.current, monomersLibraryUpdate }),
    );

    return () => {
      dispatch(destroyEditor(null));
    };
  }, [dispatch]);

  useSetRnaPresets();

  useEffect(() => {
    editor?.events.rightClickSequence.add(([event, selections]) => {
      setSelections(selections);
      window.dispatchEvent(new Event('hidePreview'));
      dispatch(setContextMenuActive(true));
      showSequenceContextMenu({
        event,
        props: {
          sequenceItemRenderer: event.target.__data__,
        },
      });
    });
    editor?.events.rightClickPolymerBond.add(
      ([event, polymerBondRenderer]: [
        TriggerEvent,
        DeprecatedFlexModeOrSnakeModePolymerBondRenderer,
      ]): void => {
        showPolymerBondContextMenu({
          event,
          props: {
            polymerBondRenderer,
          },
        });
      },
    );
    editor?.events.rightClickSelectedMonomers.add(
      ([event, selectedMonomers]: [TriggerEvent, BaseMonomer[]]) => {
        setSelectedMonomers(selectedMonomers);
        showSelectedMonomersContextMenu({
          event,
          props: { selectedMonomers },
        });
      },
    );
    editor?.events.rightClickCanvas.add(
      ([event, selections]: [TriggerEvent, NodesSelection]) => {
        setSelections(selections);
        showSequenceContextMenu({
          event,
          props: {},
        });
      },
    );
    editor?.events.toggleMacromoleculesPropertiesVisibility.add(() => {
      dispatch(toggleMacromoleculesPropertiesWindowVisibility({}));
    });
  }, [editor]);

  useEffect(() => {
    editor?.zoomTool.observeCanvasResize();
    return () => {
      editor?.zoomTool.destroy();
    };
  }, [editor]);

  const handleCloseErrorTooltip = () => {
    dispatch(closeErrorTooltip());
  };

  const toggleLibraryVisibility = useCallback(() => {
    setIsMonomerLibraryHidden((prev) => !prev);
  }, []);

  return (
    <>
      <Layout>
        <Layout.Top
          shortened={isMonomerLibraryHidden}
          data-testid="top-toolbar"
        >
          <TopMenuComponent />
          <TopMenuRightWrapper>
            <SequenceSyncEditModeButton />
            <LayoutModeButton />
            <SequenceTypeGroupButton />
            <TogglerComponentWrapper
              className={
                isSequenceEditInRNABuilderMode
                  ? 'toggler-component-wrapper--disabled'
                  : ''
              }
            >
              {togglerComponent}
            </TogglerComponentWrapper>
            <FullscreenButton />
            <VerticalDivider />
            <ZoomControls />
          </TopMenuRightWrapper>
        </Layout.Top>

        <Layout.Left>
          <LeftMenuComponent />
        </Layout.Left>

        <Layout.Main>
          <EditorEvents />
          <CanvasWrapper
            id="polymer-editor-canvas"
            data-testid="ketcher-canvas"
            preserveAspectRatio="xMidYMid meet"
            ref={canvasRef}
            width="100%"
            height="100%"
            style={{
              overflow: 'hidden',
              overflowClipMargin: 'content-box',
            }}
          >
            <defs>
              <PeptideAvatar />
              <ChemAvatar />
              <SugarAvatar />
              <PhosphateAvatar />
              <RNABaseAvatar />
              <UnresolvedMonomerAvatar />
              <NucleotideAvatar />
              <SequenceStartArrow />
              <ArrowMarker />
            </defs>
            <g className="drawn-structures" />
            {isHandToolSelected && (
              <rect
                x={0}
                y={0}
                width="100%"
                height="100%"
                fill="transparent"
                pointerEvents="all"
              />
            )}
          </CanvasWrapper>
          {isLoading && <Loader />}
        </Layout.Main>

        <Layout.Right hide={isMonomerLibraryHidden}>
          <MonomerLibrary toggleLibraryVisibility={toggleLibraryVisibility} />
        </Layout.Right>

        <Layout.Bottom>
          <MacromoleculePropertiesWindow />
        </Layout.Bottom>
        <Layout.InsideRoot>
          {isMonomerLibraryHidden && (
            <MonomerLibraryToggle onClick={toggleLibraryVisibility} />
          )}
        </Layout.InsideRoot>
      </Layout>
      <Preview />
      <SequenceItemContextMenu selections={selections} />
      <PolymerBondContextMenu />
      <SelectedMonomersContextMenu selectedMonomers={selectedMonomers} />
      <ModalContainer />
      <ErrorModal />
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={Boolean(errorTooltipText)}
        onClose={handleCloseErrorTooltip}
        autoHideDuration={6000}
      >
        <StyledToast id="error-tooltip">
          <StyledToastContent data-testid="error-tooltip">
            {errorTooltipText}
          </StyledToastContent>
          <StyledIconButton
            testId="error-tooltip-close"
            iconName="close"
            onClick={handleCloseErrorTooltip}
          ></StyledIconButton>
        </StyledToast>
      </Snackbar>
    </>
  );
}

export default EditorContainer;
