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

import {
  type ComponentType,
  type ElementType,
  type RefObject,
  Component,
  createRef,
} from 'react';

import Editor from '../../../../editor';
import { LoadingCircles } from '../Spinner/LoadingCircles';
import classes from './StructEditor.module.less';
import clsx from 'clsx';
import { upperFirst } from 'lodash/fp';
import { isEqual, omit } from 'lodash';
import { FloatingToolContainer } from '../../toolbars';
import { ContextMenu, ContextMenuTrigger } from '../ContextMenu';
import InfoPanel from './InfoPanel';
import { type Struct, KetcherLogger, ketcherProvider } from 'ketcher-core';
import { getSmoothScrollDelta } from './helpers';
import InfoTooltip from './InfoTooltip';
import MonomerCreationWizard from '../MonomerCreationWizard/MonomerCreationWizard';
import MonomerCreationWizardBackdrop from '../MonomerCreationWizard/MonomerCreationWizardBackdrop';
import { Tooltip } from '../Tooltip';

interface StructEditorProperties {
  ketcherId: string;
  prevKetcherId?: string;
  struct?: Struct;
  tool?: string;
  toolOpts?: Record<string, unknown>;
  options?: Record<string, unknown>;
  serverSettings?: Record<string, unknown>;
  indigoVerification?: boolean;
  showAttachmentPoints?: boolean;
  Tag?: ComponentType | string;
  className?: string;
  render?: unknown;
  groupStruct?: unknown;
  sGroup?: unknown;
  onInit?: (editor: Editor) => void;
  onZoomIn?: (event: WheelEvent) => void;
  onZoomOut?: (event: WheelEvent) => void;
  onShowMacromoleculesErrorMessage?: (error: string) => void;
  [key: string]: unknown;
}

interface StructEditorState {
  enableCursor: boolean;
  tooltip: string;
}

// TODO: need to update component after making refactoring of store
function setupEditor(
  editor: Editor,
  properties: StructEditorProperties,
  oldProperties: Partial<StructEditorProperties> = {},
) {
  const { struct, tool, toolOpts, options } = properties;
  const optionsChanged = !isEqual(options, oldProperties.options);

  if (struct !== oldProperties.struct) editor.struct(struct);

  if (tool !== oldProperties.tool || toolOpts !== oldProperties.toolOpts) {
    editor.tool(tool, toolOpts);
    if (toolOpts !== oldProperties.toolOpts) {
      editor.event.message.dispatch({ info: JSON.stringify(toolOpts) });
    }
  }

  if (oldProperties.options && optionsChanged) {
    editor.options(options);
    editor.setServerSettings(properties.serverSettings);
  } else if (properties.serverSettings !== oldProperties.serverSettings) {
    editor.setServerSettings(properties.serverSettings);
  }

  Object.keys(editor.event).forEach((name) => {
    const eventName = `on${upperFirst(name)}`;

    if (properties[eventName] !== oldProperties[eventName]) {
      if (oldProperties[eventName]) {
        editor.event[name].remove(oldProperties[eventName]);
      }

      if (properties[eventName]) {
        editor.event[name].add(properties[eventName]);
      }
    }
  });

  if (struct !== oldProperties.struct || optionsChanged) {
    editor.render.unobserveCanvasResize();
    editor.render.observeCanvasResize();
  }
}

function removeEditorHandlers(
  editor: Editor,
  properties: StructEditorProperties,
) {
  Object.keys(editor.event).forEach((name) => {
    const eventName = `on${upperFirst(name)}`;

    if (properties[eventName]) editor.event[name].remove(properties[eventName]);
  });
}

class StructEditor extends Component<
  StructEditorProperties,
  StructEditorState
> {
  editor!: Editor;
  editorRef: RefObject<HTMLDivElement | null>;
  logRef: RefObject<HTMLDivElement | null>;

  constructor(properties: StructEditorProperties) {
    super(properties);
    this.state = {
      enableCursor: false,
      tooltip: '',
    };
    this.editorRef = createRef();
    this.logRef = createRef();
  }

  handleWheel = (event: WheelEvent) => {
    if (event.ctrlKey) {
      event.preventDefault();

      const zoomDelta = event.deltaY > 0 ? -1 : 1;

      if (zoomDelta === 1) {
        this.props.onZoomIn?.(event);
      } else {
        this.props.onZoomOut?.(event);
      }
    } else {
      this.scrollCanvas(event);
      this.editor.rotateController.updateFloatingToolsPosition();
      this.editor.hoverIcon.updatePosition();
      if (this.editor.lastEvent) {
        this.editor.tool()?.mousemove?.(this.editor.lastEvent);
      }
    }
  };

  // TODO https://github.com/epam/ketcher/issues/3472
  /**
   * @param {WheelEvent} event
   */
  scrollCanvas(event: WheelEvent) {
    if (event.shiftKey) {
      this.handleHorizontalScroll(event);
    } else {
      this.handleScroll(event);
    }
  }

  /**
   * @param {WheelEvent} event
   */
  handleHorizontalScroll(event: WheelEvent) {
    this.editor.render.setViewBox((previous) => ({
      ...previous,
      minX:
        previous.minX -
        getSmoothScrollDelta(
          (event as WheelEvent & { wheelDelta: number }).wheelDelta,
          this.editor.zoom(),
        ),
    }));
  }

  /**
   * For mouse wheel and touchpad
   * @param {WheelEvent} event
   */
  handleScroll(event: WheelEvent) {
    this.editor.render.setViewBox((previous) => ({
      ...previous,
      minX:
        previous.minX + getSmoothScrollDelta(event.deltaX, this.editor.zoom()),
      minY:
        previous.minY + getSmoothScrollDelta(event.deltaY, this.editor.zoom()),
    }));
  }

  shouldComponentUpdate(
    nextProperties: StructEditorProperties,
    nextState: StructEditorState,
  ) {
    return (
      this.props.indigoVerification !== nextProperties.indigoVerification ||
      nextState.enableCursor !== this.state.enableCursor ||
      nextState.tooltip !== this.state.tooltip
    );
  }

  // NOSONAR - canvas editor must be updated before React renders to prevent
  // white-screen states during struct changes; componentDidUpdate fires too late.
  UNSAFE_componentWillReceiveProps(properties: StructEditorProperties) {
    // NOSONAR
    setupEditor(this.editor, properties, this.props);
  }

  componentDidMount() {
    const previousKetcher = this.props.prevKetcherId
      ? ketcherProvider.getKetcher(this.props.prevKetcherId)
      : undefined;

    const ketcher = ketcherProvider.getKetcher(this.props.ketcherId);

    this.editor = new Editor(
      this.props.ketcherId,
      this.editorRef.current as HTMLDivElement,
      {
        ...this.props.options,
      },
      { ...this.props.serverSettings },
      previousKetcher?.editor,
    );

    ketcher.addEditor(this.editor);
    if (ketcher?.editor.macromoleculeConvertionError) {
      this.props.onShowMacromoleculesErrorMessage?.(
        ketcher.editor.macromoleculeConvertionError,
      );
      ketcher.editor.clearMacromoleculeConvertionError();
    }

    setupEditor(this.editor, this.props);
    if (this.props.onInit) this.props.onInit(this.editor);

    this.editor.event.message.add((message) => {
      const element = this.logRef.current;
      if (!element) return;
      if (message.info && this.props.showAttachmentPoints) {
        try {
          const parsedInfo = JSON.parse(message.info);
          element.innerHTML = `Atom Id: ${parsedInfo.atomid}, Bond Id: ${parsedInfo.bondid}`;
        } catch (error) {
          KetcherLogger.error(
            'StructEditor.tsx::StructEditor::componentDidMount',
            error,
          );
          element.innerHTML = message.info;
        }
        element.classList.add(classes.visible);
      } else {
        element.classList.remove(classes.visible);
      }
    });

    this.editor.event.tooltip.add((data) => {
      const message = data ? data.message : undefined;

      this.setState({
        tooltip: message,
      });
    });

    this.editor.event.cursor.add((csr) => {
      switch (csr.status) {
        case 'enable': {
          this.editorRef.current?.classList.add(classes.enableCursor);
          const { left, top, right, bottom } =
            this.editorRef.current?.getBoundingClientRect() ?? {
              left: 0,
              top: 0,
              right: 0,
              bottom: 0,
            };

          const clientX = csr.cursorPosition.clientX;
          const clientY = csr.cursorPosition.clientY;

          const handShouldBeShown =
            clientX >= left &&
            clientX <= right &&
            clientY >= top &&
            clientX <= bottom;
          if (!this.state.enableCursor && handShouldBeShown) {
            this.setState({
              enableCursor: true,
            });
          }
          break;
        }

        case 'move':
        case 'mouseover': {
          this.editorRef.current?.classList.add(classes.enableCursor);
          this.setState({
            enableCursor: true,
          });
          break;
        }

        case 'disable':
        case 'leave': {
          this.editorRef.current?.classList.remove(classes.enableCursor);
          this.setState({
            enableCursor: false,
          });
          break;
        }

        default:
          break;
      }
    });

    this.editor.event.message.dispatch({
      info: JSON.stringify(this.props.toolOpts),
    });

    this.editorRef.current?.addEventListener('wheel', this.handleWheel);
  }

  componentWillUnmount() {
    removeEditorHandlers(this.editor, this.props);
    this.editorRef.current?.removeEventListener('wheel', this.handleWheel);
    this.editor.render.unobserveCanvasResize();
    this.editor.hoverIcon.destroy();
  }

  render() {
    const omittedProperties = [
      'ketcherId',
      'prevKetcherId',
      'struct',
      'tool',
      'toolOpts',
      'options',
      'onInit',
      'onSelectionChange',
      'onElementEdit',
      'onEnhancedStereoEdit',
      'onQuickEdit',
      'onBondEdit',
      'onZoomIn',
      'onZoomOut',
      'onZoomChanged',
      'onRgroupEdit',
      'onSgroupEdit',
      'onRemoveFG',
      'onEditMonomer',
      'onMessage',
      'onAromatizeStruct',
      'onDearomatizeStruct',
      'onAttachEdit',
      'onCipChange',
      'onConfirm',
      'onShowInfo',
      'onApiSettings',
      'showAttachmentPoints',
      'onUpdateFloatingTools',
      'onShowMacromoleculesErrorMessage',
      'serverSettings',
    ];

    const remaining = omit(
      this.props,
      omittedProperties,
    ) as StructEditorProperties;
    const {
      Tag = 'div',
      className,
      indigoVerification,
      ...properties
    } = remaining;

    const { tooltip } = this.state;
    const lastCursorPosition = this.editor?.lastCursorPosition;

    const TagComponent = (Tag || 'div') as ElementType;

    const infoPanel = <InfoPanel />;
    const infoTooltip = <InfoTooltip />;
    const tooltipElement = (
      <Tooltip
        message={tooltip}
        position={{
          x: lastCursorPosition?.x ?? 0,
          y: lastCursorPosition?.y ?? 0,
        }}
      />
    );

    return (
      <TagComponent
        className={clsx(classes.canvas, className)}
        {...properties}
        dir="ltr"
        data-testid="ketcher-canvas"
        data-canvasmode="molecules-mode"
      >
        <MonomerCreationWizardBackdrop />

        <ContextMenuTrigger>
          <div
            ref={this.editorRef}
            className={clsx(classes.intermediateCanvas)}
          >
            {/* svg here */}
          </div>
        </ContextMenuTrigger>

        <div className={classes.measureLog} ref={this.logRef} />

        {indigoVerification && (
          <div
            className={`${classes.spinnerOverlay} loading-spinner`}
            data-testid="loading-spinner"
          >
            <LoadingCircles />
          </div>
        )}

        {infoPanel}
        {infoTooltip}

        <FloatingToolContainer />

        <ContextMenu />

        <MonomerCreationWizard />

        {tooltipElement}
      </TagComponent>
    );
  }
}

export default StructEditor;
