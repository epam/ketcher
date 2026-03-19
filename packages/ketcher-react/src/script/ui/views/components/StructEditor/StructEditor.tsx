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
  Component,
  ComponentType,
  ElementType,
  RefObject,
  createRef,
} from 'react';

import Editor from '../../../../editor';
import { LoadingCircles } from '../Spinner/LoadingCircles';
import classes from './StructEditor.module.less';
import clsx from 'clsx';
import { upperFirst } from 'lodash/fp';
import { omit } from 'lodash';
import { FloatingToolContainer } from '../../toolbars';
import { ContextMenu, ContextMenuTrigger } from '../ContextMenu';
import InfoPanel from './InfoPanel';
import { KetcherLogger, Struct, ketcherProvider } from 'ketcher-core';
import { getSmoothScrollDelta } from './helpers';
import InfoTooltip from './InfoTooltip';
import MonomerCreationWizard from '../MonomerCreationWizard/MonomerCreationWizard';
import { Tooltip } from '../Tooltip';

interface StructEditorProps {
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
  clientX: number;
  clientY: number;
  tooltip: string;
}

// TODO: need to update component after making refactoring of store
function setupEditor(
  editor: Editor,
  props: StructEditorProps,
  oldProps: Partial<StructEditorProps> = {},
) {
  const { struct, tool, toolOpts, options } = props;

  if (struct !== oldProps.struct) editor.struct(struct);

  if (tool !== oldProps.tool || toolOpts !== oldProps.toolOpts) {
    editor.tool(tool, toolOpts);
    if (toolOpts !== oldProps.toolOpts) {
      editor.event.message.dispatch({ info: JSON.stringify(toolOpts) });
    }
  }

  if (oldProps.options && options !== oldProps.options) {
    editor.options(options);
    editor.setServerSettings(props.serverSettings);
  }

  Object.keys(editor.event).forEach((name) => {
    const eventName = `on${upperFirst(name)}`;

    if (props[eventName] !== oldProps[eventName]) {
      if (oldProps[eventName]) {
        editor.event[name].remove(oldProps[eventName]);
      }

      if (props[eventName]) {
        editor.event[name].add(props[eventName]);
      }
    }
  });

  editor.render.unobserveCanvasResize();
  editor.render.observeCanvasResize();
}

function removeEditorHandlers(editor: Editor, props: StructEditorProps) {
  Object.keys(editor.event).forEach((name) => {
    const eventName = `on${upperFirst(name)}`;

    if (props[eventName]) editor.event[name].remove(props[eventName]);
  });
}

class StructEditor extends Component<StructEditorProps, StructEditorState> {
  editor!: Editor;
  editorRef: RefObject<HTMLDivElement | null>;
  logRef: RefObject<HTMLDivElement | null>;

  constructor(props: StructEditorProps) {
    super(props);
    this.state = {
      enableCursor: false,
      clientX: 0,
      clientY: 0,
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
      this.editor.tool()?.mousemove?.(this.editor.lastEvent);
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
    this.editor.render.setViewBox((prev) => ({
      ...prev,
      minX:
        prev.minX -
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
    this.editor.render.setViewBox((prev) => ({
      ...prev,
      minX: prev.minX + getSmoothScrollDelta(event.deltaX, this.editor.zoom()),
      minY: prev.minY + getSmoothScrollDelta(event.deltaY, this.editor.zoom()),
    }));
  }

  shouldComponentUpdate(
    nextProps: StructEditorProps,
    nextState: StructEditorState,
  ) {
    return (
      this.props.indigoVerification !== nextProps.indigoVerification ||
      nextState.enableCursor !== this.state.enableCursor ||
      nextState.tooltip !== this.state.tooltip
    );
  }

  UNSAFE_componentWillReceiveProps(props: StructEditorProps) {
    setupEditor(this.editor, props, this.props);
  }

  componentDidMount() {
    const prevKetcher = this.props.prevKetcherId
      ? ketcherProvider.getKetcher(this.props.prevKetcherId)
      : undefined;

    const ketcher = ketcherProvider.getKetcher(this.props.ketcherId);

    this.editor = new Editor(
      this.props.ketcherId,
      this.editorRef.current,
      {
        ...this.props.options,
      },
      { ...this.props.serverSettings },
      prevKetcher?.editor,
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

    this.editor.event.message.add((msg) => {
      const el = this.logRef.current;
      if (!el) return;
      if (msg.info && this.props.showAttachmentPoints) {
        try {
          const parsedInfo = JSON.parse(msg.info);
          el.innerHTML = `Atom Id: ${parsedInfo.atomid}, Bond Id: ${parsedInfo.bondid}`;
        } catch (e) {
          KetcherLogger.error(
            'StructEditor.tsx::StructEditor::componentDidMount',
            e,
          );
          el.innerHTML = msg.info;
        }
        el.classList.add(classes.visible);
      } else {
        el.classList.remove(classes.visible);
      }
    });

    this.editor.event.tooltip.add((data) => {
      const message = data ? data.message : undefined;

      this.setState({
        tooltip: message,
      });
    });

    this.editor.event.cursor.add((csr) => {
      let clientX, clientY;

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

          clientX = csr.cursorPosition.clientX;
          clientY = csr.cursorPosition.clientY;

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

        case 'move': {
          this.editorRef.current?.classList.add(classes.enableCursor);
          this.setState({
            enableCursor: true,
            clientX,
            clientY,
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

        case 'mouseover': {
          this.editorRef.current?.classList.add(classes.enableCursor);
          this.setState({
            enableCursor: true,
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
  }

  render() {
    const omittedProps = [
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

    const remaining = omit(this.props, omittedProps) as StructEditorProps;
    const { Tag = 'div', className, indigoVerification, ...props } = remaining;

    const { clientX = 0, clientY = 0, tooltip } = this.state;
    const lastCursorPosition = this.editor?.lastCursorPosition;

    const TagComponent = (Tag || 'div') as ElementType;

    const infoPanelProps = {
      clientX,
      clientY,
      render: this.props.render,
      groupStruct: this.props.groupStruct,
      sGroup: this.props.sGroup,
    };
    // @ts-expect-error ownProps not exposed by connected component types
    const infoPanel = <InfoPanel {...infoPanelProps} />;
    // @ts-expect-error ownProps not exposed by connected component types
    const infoTooltip = <InfoTooltip render={this.props.render} />;
    const tooltipElement = (
      // @ts-expect-error Tooltip return type includes falsy value
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
        {...props}
        data-testid="ketcher-canvas"
        data-canvasmode="molecules-mode"
      >
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
