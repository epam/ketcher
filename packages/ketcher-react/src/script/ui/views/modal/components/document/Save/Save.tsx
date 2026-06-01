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

import * as structFormat from '../../../../../data/convert/structConverter';

import React, { Component, createRef, RefObject } from 'react';
import { createSelector } from 'reselect';
import Form, { Field } from '../../../../../component/form/form/form';
import {
  FormatterFactory,
  KetSerializer,
  formatProperties,
  getPropertiesByFormat,
  getPropertiesByImgFormat,
  b64toBlob,
  KetcherLogger,
  Atom,
  isClipboardAPIAvailable,
  legacyCopy,
  Struct,
  StructService,
  SupportedFormat,
  OutputFormatType,
  StructServiceOptions,
  GenerateImageOptions,
  SupportedFormatProperties,
  provideEditorInstance,
} from 'ketcher-core';
import { saveAs } from 'file-saver';

import { Dialog } from '../../../../components';
import Tabs from 'src/script/ui/component/view/Tabs';
import { ErrorsContext } from '../../../../../../../contexts';
import { SaveButton } from '../../../../../component/view/savebutton';
import { check } from '../../../../../state/server';
import classes from './Save.module.less';
import { connect } from 'react-redux';
import { saveUserTmpl } from '../../../../../state/templates';
import { updateFormState } from '../../../../../state/modal/form';
import Select from '../../../../../component/form/Select';
import { getSelectOptionsFromSchema } from '../../../../../utils';
import { LoadingCircles } from 'src/script/ui/views/components/Spinner';
import { IconButton } from 'components';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';

const saveSchema = {
  title: 'Save',
  type: 'object',
  properties: {
    filename: {
      title: 'File name:',
      type: 'string',
      maxLength: 128,
      pattern: '^[^.<>:?"*\\\\|\\/][^<>:?"*\\\\|\\/]*$',
      invalidMessage: (res) => {
        if (!res) return 'Filename should contain at least one character';
        if (res.length > 128) return 'Filename is too long';
        return "A filename cannot contain characters: \\ / : * ? \" < > | and cannot start with '.'";
      },
    },
    format: {
      title: 'File format:',
      enum: Object.keys(formatProperties),
      enumNames: Object.keys(formatProperties).map(
        (format) => formatProperties[format].name,
      ),
    },
  },
};

// Type definitions for component props
interface LoadingStateProps {
  classes: typeof classes;
}

interface ImageContentProps {
  classes: typeof classes;
  imageSrc: string;
}

interface BinaryContentProps {
  classes: typeof classes;
  textAreaRef: RefObject<HTMLTextAreaElement | null>;
}

interface PreviewContentProps {
  classes: typeof classes;
  structStr: string;
  textAreaRef: RefObject<HTMLTextAreaElement | null>;
  handleCopy: (event: React.MouseEvent | React.ClipboardEvent) => void;
}

interface FormState {
  result: {
    filename: string;
    format: SupportedFormat | OutputFormatType | SupportedFormatProperties;
  };
  valid: boolean;
  errors: Record<string, string>;
  moleculeErrors?: Record<string, string>;
}

interface CheckState {
  checkOptions: unknown;
}

interface Editor {
  selection: () => { atoms?: number[] } | null;
  errorHandler: (message: string) => void;
  struct: () => Struct;
  render: {
    options: {
      ignoreChiralFlag: boolean;
    };
  };
}
interface SaveDialogProps {
  server: StructService | null;
  struct: Struct;
  options: StructServiceOptions;
  formState: FormState;
  moleculeErrors?: Record<string, string>;
  checkState: CheckState;
  bondThickness?: number;
  ignoreChiralFlag: boolean;
  editor: Editor;
  onCheck: (checkOptions: unknown) => void;
  onTmplSave: (struct: Struct) => void;
  onResetForm: (prevState: FormState) => void;
  onOk: (result?: Record<string, unknown> | unknown) => void;
  onCancel: () => void;
}

interface SaveDialogState {
  disableControls: boolean;
  imageFormat: string;
  tabIndex: number;
  isLoading: boolean;
  structStr?: string;
  imageSrc?: string;
}

interface AppState {
  options: {
    app: {
      server?: boolean;
    };
    getServerSettings: () => StructServiceOptions;
    check: CheckState;
    settings: {
      bondThickness?: number;
    };
  };
  server: StructService;
  editor: Editor;
  modal: {
    form: FormState;
  };
}

const MIN_EXPORT_MARGIN = 6;
const MAX_EXPORT_MARGIN = 24;
const EXPORT_MARGIN_RATIO = 0.03;
const VERTICAL_MARGIN_BOOST_RATIO = 0.04;
const MIN_PAINT_SAFETY_MARGIN = 4;
const MAX_PAINT_SAFETY_MARGIN = 14;
const PAINT_SAFETY_MARGIN_RATIO = 0.012;
const EXPORT_EDGE_GUARD_HORIZONTAL = 20;
const EXPORT_EDGE_GUARD_VERTICAL = 10;
const SVG_NAMESPACE_URI = 'http://www.w3.org/2000/svg';
const SVG_XLINK_NAMESPACE_URI = 'http://www.w3.org/1999/xlink';
const NON_EXPORT_LAYER_CLASSES = [
  'backgroundLayer',
  'selectionPlateLayer',
  'selectionPointsLayer',
  'hoveringLayer',
  'transient-views-layer',
  'transient-views-top-layer',
];
const NON_EXPORT_ELEMENT_CLASSES = ['dynamic-element', 'blinking'];
const SELECTION_OVERLAY_COLOR = '#57ff8f';
const ROTATION_GUIDE_COLOR = '#b4b9d6';
const SCROLLBAR_TRACK_COLOR = '#b2bbc3';
const MIN_PNG_RASTER_SCALE = 2;
const MAX_PNG_RASTER_SCALE = 4;
const MAX_PNG_CANVAS_PIXELS = 16777216;

// Extracted components for better performance and React best practices
const LoadingState = ({ classes }: LoadingStateProps) => (
  <div className={classes.loadingCirclesContainer}>
    <LoadingCircles />
  </div>
);

const ImageContent = ({ classes, imageSrc }: ImageContentProps) => (
  <div className={classes.imageContainer}>
    {imageSrc ? (
      <img src={imageSrc} alt="Preview" data-testid="preview-area" />
    ) : null}
  </div>
);

const BinaryContent = ({ classes, textAreaRef }: BinaryContentProps) => (
  <div className={classes.previewBackground}>
    <textarea
      value="Can not display binary content"
      className={classes.previewArea}
      readOnly
      ref={textAreaRef}
      data-testid="preview-area"
    />
  </div>
);

const PreviewContent = ({
  classes,
  structStr,
  textAreaRef,
  handleCopy,
}: PreviewContentProps) => (
  <div className={classes.previewBackground}>
    <textarea
      value={structStr}
      className={classes.previewArea}
      readOnly
      ref={textAreaRef}
      data-testid="preview-area"
    />
    <IconButton
      onClick={handleCopy}
      iconName="copy"
      title="Copy to clipboard"
      testId="copy-to-clipboard"
    />
  </div>
);

class SaveDialog extends Component<SaveDialogProps, SaveDialogState> {
  static readonly contextType = ErrorsContext;
  declare context: React.ContextType<typeof ErrorsContext>;
  private readonly isRxn: boolean;
  private readonly textAreaRef: RefObject<HTMLTextAreaElement | null>;
  private readonly saveSchema: typeof saveSchema;
  private previewObjectUrl?: string;

  constructor(props: SaveDialogProps) {
    super(props);
    this.state = {
      disableControls: true,
      imageFormat: 'svg',
      tabIndex: 0,
      isLoading: true,
    };
    this.isRxn =
      this.props.struct.hasRxnArrow() || this.props.struct.hasMultitailArrow();
    this.textAreaRef = createRef();

    const formats = !this.props.server
      ? [
          SupportedFormat.ket,
          this.isRxn ? SupportedFormat.rxn : SupportedFormat.mol,
          SupportedFormat.smiles,
        ]
      : [
          SupportedFormat.ket,
          this.isRxn ? SupportedFormat.rxn : SupportedFormat.mol,
          this.isRxn ? SupportedFormat.rxnV3000 : SupportedFormat.molV3000,
          SupportedFormat.sdf,
          SupportedFormat.sdfV3000,
          SupportedFormat.rdf,
          SupportedFormat.rdfV3000,
          SupportedFormat.smarts,
          SupportedFormat.smiles,
          SupportedFormat.smilesExt,
          SupportedFormat.cml,
          '<----firstDivider--->', // for dividers in select list
          SupportedFormat.inChI,
          SupportedFormat.inChIAuxInfo,
          SupportedFormat.inChIKey,
          '<----secondDivider--->', // for dividers in select list
          'svg',
          'png',
          SupportedFormat.cdxml,
          SupportedFormat.cdx,
          SupportedFormat.binaryCdx,
        ];

    this.saveSchema = saveSchema;
    this.saveSchema.properties.format = Object.assign(
      this.saveSchema.properties.format,
      {
        enum: formats,
        enumNames: formats.map((format) => {
          const formatProps = this.isImageFormat(format)
            ? getPropertiesByImgFormat(format)
            : getPropertiesByFormat(format as SupportedFormat);
          return formatProps?.name;
        }),
      },
    );
  }

  componentDidMount() {
    const { checkOptions } = this.props.checkState;
    this.props.onCheck(checkOptions);
    this.changeType(
      this.isRxn ? SupportedFormat.rxn : SupportedFormat.mol,
    ).then(
      (res) => res instanceof Error && this.setState({ disableControls: true }),
    );
  }

  componentWillUnmount() {
    if (this.previewObjectUrl) {
      URL.revokeObjectURL(this.previewObjectUrl);
      this.previewObjectUrl = undefined;
    }
  }

  isImageFormat = (format: string): format is OutputFormatType => {
    return !!getPropertiesByImgFormat(format);
  };

  private getCanvasSvgElement = (): SVGSVGElement | undefined => {
    const editorWithRender = this.props.editor as {
      render?: {
        paper?: {
          canvas?: unknown;
        };
      };
    };
    const renderCanvas = editorWithRender?.render?.paper?.canvas;
    if (renderCanvas instanceof SVGSVGElement) {
      return renderCanvas;
    }

    const testCanvas = document.querySelector('[data-testid="canvas"]');
    if (testCanvas instanceof SVGSVGElement) {
      return testCanvas;
    }

    const editor = provideEditorInstance();
    if (editor?.canvas) {
      return editor.canvas;
    }

    const canvasRoot = document.querySelector('[data-testid="ketcher-canvas"]');
    if (!canvasRoot) {
      return undefined;
    }

    if (canvasRoot instanceof SVGSVGElement) {
      return canvasRoot;
    }

    const drawnStructures = canvasRoot.querySelector('.drawn-structures');
    const svgFromDrawn = drawnStructures?.closest('svg');
    if (svgFromDrawn instanceof SVGSVGElement) {
      return svgFromDrawn;
    }

    const firstSvg = canvasRoot.querySelector('svg');
    return firstSvg instanceof SVGSVGElement ? firstSvg : undefined;
  };

  private getExportMargins = (bounds: { width: number; height: number }) => {
    const dominantSize = Math.max(bounds.width, bounds.height);
    const adaptiveMargin = dominantSize * EXPORT_MARGIN_RATIO;
    const paintSafetyMargin = Math.min(
      MAX_PAINT_SAFETY_MARGIN,
      Math.max(
        MIN_PAINT_SAFETY_MARGIN,
        dominantSize * PAINT_SAFETY_MARGIN_RATIO,
      ),
    );
    const horizontalMargin = Math.min(
      MAX_EXPORT_MARGIN,
      Math.max(MIN_EXPORT_MARGIN, adaptiveMargin) + paintSafetyMargin,
    );
    const verticalMargin = Math.min(
      MAX_EXPORT_MARGIN,
      Math.max(
        horizontalMargin,
        horizontalMargin * (1 + VERTICAL_MARGIN_BOOST_RATIO),
      ),
    );

    return {
      horizontalMargin,
      verticalMargin,
    };
  };

  private isTransientSelectionRect = (el: SVGGraphicsElement) => {
    if (el.tagName.toLowerCase() !== 'rect') {
      return false;
    }

    const strokeDashArray = el.getAttribute('stroke-dasharray') || '';
    const fill = (el.getAttribute('fill') || '').toLowerCase();
    const opacity = el.getAttribute('opacity');

    return !!strokeDashArray && (fill === 'none' || opacity === '0');
  };

  private isTransientSelectionHandleRect = (el: SVGGraphicsElement) => {
    if (el.tagName.toLowerCase() !== 'rect') {
      return false;
    }

    const width = Number.parseFloat(el.getAttribute('width') || '0') || 0;
    const height = Number.parseFloat(el.getAttribute('height') || '0') || 0;
    const rx = Number.parseFloat(el.getAttribute('rx') || '0') || 0;
    const fill = (el.getAttribute('fill') || '').toLowerCase();
    const stroke = (el.getAttribute('stroke') || '').toLowerCase();

    const looksLikeSelectionHandle =
      width >= 20 &&
      width <= 40 &&
      height >= 20 &&
      height <= 40 &&
      rx >= 8 &&
      !!fill &&
      fill === stroke;

    return looksLikeSelectionHandle;
  };

  private isTransientScrollbarRect = (el: SVGGraphicsElement) => {
    if (el.tagName.toLowerCase() !== 'rect') {
      return false;
    }

    const fill = (el.getAttribute('fill') || '').toLowerCase();
    const stroke = (el.getAttribute('stroke') || '').toLowerCase();

    if (fill !== SCROLLBAR_TRACK_COLOR || stroke !== SCROLLBAR_TRACK_COLOR) {
      return false;
    }

    const width = Number.parseFloat(el.getAttribute('width') || '0') || 0;
    const height = Number.parseFloat(el.getAttribute('height') || '0') || 0;

    if (width > 0 && height > 0) {
      const isVerticalScrollbarTrack = width <= 6 && height >= 120;
      const isHorizontalScrollbarTrack = height <= 6 && width >= 120;
      return isVerticalScrollbarTrack || isHorizontalScrollbarTrack;
    }

    const box = el.getBBox();
    return (
      (box.width <= 6 && box.height >= 120) ||
      (box.height <= 6 && box.width >= 120)
    );
  };

  private isImageResizeHandleElement = (el: SVGGraphicsElement) => {
    const testId = (el.getAttribute('data-testid') || '').toLowerCase();
    return testId.startsWith('imageresize-');
  };

  private isInvisibleImageResizeHandleCircle = (el: SVGGraphicsElement) => {
    if (el.tagName.toLowerCase() !== 'circle') {
      return false;
    }

    const fill = (el.getAttribute('fill') || '').toLowerCase();
    const fillOpacity = Number.parseFloat(
      el.getAttribute('fill-opacity') || '1',
    );
    const pointerEvents = (
      el.getAttribute('pointer-events') || ''
    ).toLowerCase();
    const radius = Number.parseFloat(el.getAttribute('r') || '0') || 0;
    const strokeWidth =
      Number.parseFloat(el.getAttribute('stroke-width') || '0') || 0;

    return (
      fill === '#000000' &&
      fillOpacity === 0 &&
      pointerEvents === 'none' &&
      radius >= 4 &&
      radius <= 6 &&
      strokeWidth >= 1
    );
  };

  private isTransientSelectionOverlayElement = (el: SVGGraphicsElement) => {
    const testId = (el.getAttribute('data-testid') || '').toLowerCase();
    if (testId === 'rotation-handle' || testId === 'rotation-center-handle') {
      return true;
    }

    const fill = (el.getAttribute('fill') || '').toLowerCase();
    const stroke = (el.getAttribute('stroke') || '').toLowerCase();
    const opacity = (el.getAttribute('opacity') || '').toLowerCase();
    const tagName = el.tagName.toLowerCase();

    const isSelectionGreen =
      fill === SELECTION_OVERLAY_COLOR || stroke === SELECTION_OVERLAY_COLOR;
    if (isSelectionGreen && ['circle', 'path', 'rect', 'g'].includes(tagName)) {
      return true;
    }

    // Invisible hit-zones generated for selection controls.
    if (opacity === '0' && tagName === 'circle' && fill === '#000000') {
      return true;
    }

    return false;
  };

  private isTransientRotationGuideElement = (el: SVGGraphicsElement) => {
    const testId = (el.getAttribute('data-testid') || '').toLowerCase();
    if (testId === 'rotation-handle' || testId === 'rotation-center-handle') {
      return true;
    }

    const tagName = el.tagName.toLowerCase();
    const fill = (el.getAttribute('fill') || '').toLowerCase();
    const stroke = (el.getAttribute('stroke') || '').toLowerCase();
    const strokeDashArray = el.getAttribute('stroke-dasharray') || '';

    if (tagName === 'path' && stroke === ROTATION_GUIDE_COLOR) {
      return true;
    }

    if (
      tagName === 'path' &&
      fill === 'none' &&
      stroke === ROTATION_GUIDE_COLOR &&
      !!strokeDashArray
    ) {
      return true;
    }

    return false;
  };

  private getCanvasSvgSnapshot = (): string | undefined => {
    const sourceSvg = this.getCanvasSvgElement();
    if (!sourceSvg) {
      return undefined;
    }

    const clonedSvg = this.getSanitizedExportSvg(sourceSvg);
    const bounds = this.getMeasuredSvgBounds(clonedSvg);
    if (!bounds) {
      return undefined;
    }
    const { horizontalMargin, verticalMargin } = this.getExportMargins(bounds);

    const viewBoxX = bounds.x - horizontalMargin - EXPORT_EDGE_GUARD_HORIZONTAL;
    const viewBoxY = bounds.y - verticalMargin - EXPORT_EDGE_GUARD_VERTICAL;
    const viewBoxWidth =
      bounds.width + horizontalMargin * 2 + EXPORT_EDGE_GUARD_HORIZONTAL * 2;
    const viewBoxHeight =
      bounds.height + verticalMargin * 2 + EXPORT_EDGE_GUARD_VERTICAL * 2;
    const svgInnerHTML = clonedSvg.innerHTML.replace(
      /\bcursor:\s*pointer;\s*/g,
      '',
    );

    return `<svg width='${viewBoxWidth}' height='${viewBoxHeight}' viewBox='${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}' xmlns='${SVG_NAMESPACE_URI}' xmlns:xlink='${SVG_XLINK_NAMESPACE_URI}'>${svgInnerHTML}</svg>`;
  };

  private getSanitizedExportSvg = (sourceSvg: SVGSVGElement): SVGSVGElement => {
    const clonedSvg = sourceSvg.cloneNode(true) as SVGSVGElement;

    clonedSvg.querySelector('#rectangle-selection-area')?.remove();
    NON_EXPORT_LAYER_CLASSES.forEach((layerClass) => {
      clonedSvg.querySelectorAll(`.${layerClass}`).forEach((el) => el.remove());
    });
    NON_EXPORT_ELEMENT_CLASSES.forEach((excludedClass) => {
      clonedSvg
        .querySelectorAll(`.${excludedClass}`)
        .forEach((el) => el.remove());
    });

    clonedSvg.querySelectorAll('text').forEach((el) => {
      el.setAttribute('cursor', 'default');
    });

    clonedSvg.querySelectorAll('rect').forEach((el) => {
      if (el.getAttribute('cursor') === 'text') {
        el.removeAttribute('cursor');
      }

      const svgEl = el as unknown as SVGGraphicsElement;
      if (
        this.isTransientSelectionRect(svgEl) ||
        this.isTransientSelectionHandleRect(svgEl) ||
        this.isTransientScrollbarRect(svgEl) ||
        this.isImageResizeHandleElement(svgEl) ||
        this.isTransientSelectionOverlayElement(svgEl) ||
        this.isTransientRotationGuideElement(svgEl)
      ) {
        el.remove();
      }
    });

    clonedSvg.querySelectorAll('circle, path, g').forEach((el) => {
      const svgEl = el as unknown as SVGGraphicsElement;
      if (
        this.isImageResizeHandleElement(svgEl) ||
        this.isInvisibleImageResizeHandleCircle(svgEl) ||
        this.isTransientSelectionOverlayElement(svgEl) ||
        this.isTransientRotationGuideElement(svgEl)
      ) {
        el.remove();
      }
    });

    return clonedSvg;
  };

  private getMeasuredSvgBounds = (svg: SVGSVGElement) => {
    const mount = document.createElement('div');
    mount.style.position = 'fixed';
    mount.style.left = '-100000px';
    mount.style.top = '-100000px';
    mount.style.visibility = 'hidden';
    mount.style.pointerEvents = 'none';

    document.body.appendChild(mount);
    mount.appendChild(svg);

    try {
      let minX = Number.POSITIVE_INFINITY;
      let minY = Number.POSITIVE_INFINITY;
      let maxX = Number.NEGATIVE_INFINITY;
      let maxY = Number.NEGATIVE_INFINITY;
      const screenToSvgMatrix = svg.getScreenCTM()?.inverse();

      const graphics = Array.from(svg.querySelectorAll('*')).filter(
        (el): el is SVGGraphicsElement => {
          return el instanceof SVGGraphicsElement && !el.closest('defs');
        },
      );

      graphics.forEach((el) => {
        try {
          const className = el.getAttribute('class') || '';
          if (
            el.tagName.toLowerCase() === 'rect' &&
            /\b\w*Layer\b/.test(className)
          ) {
            return;
          }

          const bbox = el.getBBox();
          if (!bbox || (!bbox.width && !bbox.height)) {
            return;
          }

          // Ignore tiny technical artifacts anchored at the top-left corner.
          if (
            bbox.x + bbox.width <= 20 &&
            bbox.y + bbox.height <= 20 &&
            bbox.width <= 20 &&
            bbox.height <= 20
          ) {
            return;
          }

          const strokeWidth =
            Number.parseFloat(el.getAttribute('stroke-width') || '0') || 0;
          const isTextElement = el.tagName.toLowerCase() === 'text';
          const fontSize = isTextElement
            ? Number.parseFloat(
                el.getAttribute('font-size') ||
                  window.getComputedStyle(el).fontSize ||
                  '12',
              ) || 12
            : 0;
          const textPadding = isTextElement ? Math.max(2, fontSize * 0.35) : 0;
          const strokePadding = strokeWidth > 0 ? strokeWidth / 2 + 1 : 0;
          const padding = Math.max(textPadding, strokePadding);

          minX = Math.min(minX, bbox.x - padding);
          minY = Math.min(minY, bbox.y - padding);
          maxX = Math.max(maxX, bbox.x + bbox.width + padding);
          maxY = Math.max(maxY, bbox.y + bbox.height + padding);

          // Include painted client bounds mapped to SVG coordinates.
          // This catches glyph overhang/antialiasing that tight getBBox can miss.
          if (screenToSvgMatrix) {
            const rect = el.getBoundingClientRect();
            if (rect.width || rect.height) {
              const corners = [
                new DOMPoint(rect.left, rect.top),
                new DOMPoint(rect.right, rect.top),
                new DOMPoint(rect.left, rect.bottom),
                new DOMPoint(rect.right, rect.bottom),
              ].map((point) => point.matrixTransform(screenToSvgMatrix));

              const paintedPadding = Math.max(3, padding);
              corners.forEach((point) => {
                minX = Math.min(minX, point.x - paintedPadding);
                minY = Math.min(minY, point.y - paintedPadding);
                maxX = Math.max(maxX, point.x + paintedPadding);
                maxY = Math.max(maxY, point.y + paintedPadding);
              });
            }
          }
        } catch {
          // Ignore non-measurable elements during export bounds calculation.
        }
      });

      if (!Number.isFinite(minX) || !Number.isFinite(minY)) {
        return undefined;
      }

      return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
      };
    } finally {
      mount.remove();
    }
  };

  getCanvasSvg = (): string | undefined => {
    return this.getCanvasSvgSnapshot();
  };

  private getCanvasImagePreviewDataUrl = async (
    type: OutputFormatType,
  ): Promise<string | undefined> => {
    const canvasSvg = this.getCanvasSvg();
    if (!canvasSvg) {
      return undefined;
    }

    try {
      return type === 'svg'
        ? this.createSvgPreviewUrl(canvasSvg)
        : await this.convertSvgToPngDataUrl(canvasSvg);
    } catch (e) {
      KetcherLogger.error(
        'Save.jsx::SaveDialog::getCanvasImagePreviewDataUrl',
        e,
      );
      return undefined;
    }
  };

  createSvgPreviewUrl = (svgData: string): string => {
    if (this.previewObjectUrl) {
      URL.revokeObjectURL(this.previewObjectUrl);
      this.previewObjectUrl = undefined;
    }

    const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
    this.previewObjectUrl = URL.createObjectURL(svgBlob);
    return this.previewObjectUrl;
  };

  convertSvgToPngDataUrl = (svgData: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const objectUrl = URL.createObjectURL(blob);
      const image = new Image();

      image.onload = () => {
        const sourceWidth = Math.max(1, image.naturalWidth || image.width || 1);
        const sourceHeight = Math.max(
          1,
          image.naturalHeight || image.height || 1,
        );
        const deviceScale =
          typeof window !== 'undefined' && window.devicePixelRatio
            ? window.devicePixelRatio
            : 1;
        const requestedScale = Math.min(
          MAX_PNG_RASTER_SCALE,
          Math.max(MIN_PNG_RASTER_SCALE, deviceScale),
        );
        const pixelScaleLimit = Math.sqrt(
          MAX_PNG_CANVAS_PIXELS / (sourceWidth * sourceHeight),
        );
        const rasterScale = Math.max(
          1,
          Math.min(requestedScale, pixelScaleLimit),
        );
        const rasterWidth = Math.max(1, Math.round(sourceWidth * rasterScale));
        const rasterHeight = Math.max(
          1,
          Math.round(sourceHeight * rasterScale),
        );

        const canvas = document.createElement('canvas');
        canvas.width = rasterWidth;
        canvas.height = rasterHeight;
        const context = canvas.getContext('2d');

        if (!context) {
          URL.revokeObjectURL(objectUrl);
          reject(new Error('Cannot create canvas context for PNG export'));
          return;
        }

        context.imageSmoothingEnabled = true;
        context.setTransform(rasterScale, 0, 0, rasterScale, 0, 0);
        context.drawImage(image, 0, 0, sourceWidth, sourceHeight);
        URL.revokeObjectURL(objectUrl);
        resolve(canvas.toDataURL('image/png'));
      };

      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Cannot convert SVG to PNG'));
      };

      image.src = objectUrl;
    });
  };

  getServerImageDataUrl = async (
    type: OutputFormatType,
    structStr: string,
    options: StructServiceOptions,
  ): Promise<string> => {
    const { server } = this.props;
    if (!server) {
      throw new Error('Server is not available for image generation');
    }

    const base64 = await server.generateImageAsBase64(structStr, {
      ...options,
      outputFormat: type,
    } as GenerateImageOptions);

    return type === 'svg'
      ? `data:image/svg+xml;base64,${base64}`
      : `data:image/png;base64,${base64}`;
  };

  saveImage = async (): Promise<void> => {
    const { filename, format } = this.props.formState.result;

    if (!(this.isValidStringFormat(format) && this.isImageFormat(format))) {
      return;
    }

    try {
      const svgData = this.getCanvasSvg();

      if (svgData) {
        if (format === 'svg') {
          const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
          saveAs(svgBlob, `${filename}.svg`);
          this.props.onOk();
          return;
        }

        const pngDataUrl = await this.convertSvgToPngDataUrl(svgData);
        const pngBlob = await fetch(pngDataUrl).then((response) =>
          response.blob(),
        );
        saveAs(pngBlob, `${filename}.png`);
        this.props.onOk();
        return;
      }

      const { imageFormat, structStr } = this.state;
      const imageDataUrl = await this.getServerImageDataUrl(
        imageFormat as OutputFormatType,
        structStr || '',
        this.props.options,
      );
      const imageBlob = await fetch(imageDataUrl).then((response) =>
        response.blob(),
      );
      saveAs(imageBlob, `${filename}.${imageFormat}`);
      this.props.onOk();
    } catch (e) {
      KetcherLogger.error('Save.jsx::SaveDialog::saveImage', e);
      const errorMessage = e instanceof Error ? e.message : String(e);
      this.context.errorHandler(errorMessage);
    }
  };

  isBinaryCdxFormat = (format: string): format is SupportedFormat.binaryCdx => {
    return format === SupportedFormat.binaryCdx;
  };

  showStructWarningMessage = (format: string): boolean => {
    const { errors } = this.props.formState;
    return format !== SupportedFormat.mol && Object.keys(errors).length > 0;
  };

  changeType = (
    type: SupportedFormat | OutputFormatType,
  ): Promise<Error | void> => {
    const { struct, server, options, formState, ignoreChiralFlag } = this.props;

    if (!server) {
      this.setState({
        disableControls: false,
        tabIndex: 0,
        isLoading: false,
      });
      return Promise.resolve();
    }

    const errorHandler = this.context.errorHandler;
    if (this.isImageFormat(type)) {
      const ketSerialize = new KetSerializer();
      const structStr = ketSerialize.serialize(struct);
      this.setState({
        disableControls: true,
        tabIndex: 0,
        imageFormat: type,
        structStr,
        isLoading: true,
      });
      const serverOptions = {
        ...options,
        outputFormat: type,
      };

      return Promise.resolve()
        .then(() => this.getCanvasImagePreviewDataUrl(type))
        .then((imageSrc) => {
          if (imageSrc) {
            return imageSrc;
          }

          return this.getServerImageDataUrl(type, structStr, serverOptions);
        })
        .then((imageSrc) => {
          this.setState({
            disableControls: false,
            tabIndex: 0,
            imageSrc,
            isLoading: false,
          });
        })
        .catch((e) => {
          KetcherLogger.error('Save.jsx::SaveDialog::changeType', e);
          errorHandler(e);
          this.props.onResetForm(formState);
          return e;
        });
    } else {
      this.setState({ disableControls: true, isLoading: true });
      const factory = new FormatterFactory(server);
      // temporary check if query properties are used
      const queryPropertiesAreUsed = !!(
        type === SupportedFormat.mol &&
        Array.from(struct.atoms).find(
          ([_, atom]) =>
            atom.queryProperties.aromaticity ||
            atom.queryProperties.connectivity ||
            atom.queryProperties.ringMembership ||
            atom.queryProperties.ringSize ||
            atom.queryProperties.customQuery ||
            atom.implicitHCount,
        )
      );
      const service = factory.create(
        type,
        { ...options, ignoreChiralFlag },
        queryPropertiesAreUsed,
      );
      const getStructFromStringByType = () => {
        if (type === SupportedFormat.ket) {
          const selection = this.props.editor.selection();
          if (selection?.atoms?.length && selection.atoms.length > 0) {
            selection.atoms = selection.atoms.filter((selectedAtomId) => {
              return !Atom.isSuperatomLeavingGroupAtom(struct, selectedAtomId);
            });
          }
          return service.getStringFromStructureAsync(
            struct,
            undefined,
            selection || undefined,
          );
        }
        return service.getStringFromStructureAsync(struct);
      };
      return getStructFromStringByType()
        .then(
          (structStr) => {
            this.setState({
              tabIndex: 0,
              structStr,
            });
          },
          (e) => {
            errorHandler(e.message);
            this.props.onResetForm(formState);
            return e;
          },
        )
        .finally(() => {
          this.setState({
            disableControls: false,
            tabIndex: 0,
            isLoading: false,
          });
        });
    }
  };

  changeTab = (index: number): void => {
    this.setState({ tabIndex: index });
  };

  getWarnings = (format: SupportedFormat | OutputFormatType): string[] => {
    const { struct, moleculeErrors } = this.props;
    const warnings: string[] = [];
    const structWarning =
      'Structure contains errors, please check the data, otherwise you ' +
      'can lose some properties or the whole structure after saving in this format.';
    if (!this.isImageFormat(format)) {
      const saveWarning = structFormat.couldBeSaved(struct, format);
      const isStructInvalid = this.showStructWarningMessage(format);
      if (isStructInvalid) {
        warnings.push(structWarning);
      }
      if (saveWarning) {
        warnings.push(saveWarning);
      }
    }

    if (moleculeErrors) {
      const filteredMoleculeErrors = Object.values(moleculeErrors).filter(
        (error) => {
          if (
            format === SupportedFormat.smarts ||
            format === SupportedFormat.ket
          ) {
            return !error.includes('Structure contains query features');
          } else {
            return true;
          }
        },
      );
      warnings.push(...filteredMoleculeErrors);
    }
    return warnings;
  };

  isValidStringFormat = (
    format: SupportedFormat | OutputFormatType | SupportedFormatProperties,
  ): format is SupportedFormat | OutputFormatType => {
    return (
      typeof format === 'string' &&
      !format.startsWith('<----') &&
      !!(
        getPropertiesByFormat(format as SupportedFormat) ||
        getPropertiesByImgFormat(format as OutputFormatType)
      )
    );
  };

  renderForm = (): JSX.Element => {
    const formState = { ...this.props.formState };
    const { filename, format } = formState.result;
    const warnings = this.isValidStringFormat(format)
      ? this.getWarnings(format)
      : [];
    const tabs =
      warnings.length === 0
        ? [
            {
              caption: 'Preview',
              component: this.renderSaveFile,
              tabIndex: 0,
            },
          ]
        : [
            {
              caption: 'Preview',
              component: this.renderSaveFile,
              tabIndex: 0,
            },
            {
              caption: 'Warnings',
              component: this.renderWarnings,
              tabIndex: 1,
            },
          ];

    return (
      <div className={classes.formContainer}>
        <Form
          schema={this.saveSchema}
          init={{
            filename,
            format: this.isRxn ? 'rxn' : 'mol',
          }}
          {...formState}
        >
          <Field name="filename" />
          <Field
            name="format"
            {...{ onChange: this.changeType }}
            options={getSelectOptionsFromSchema(
              this.saveSchema.properties.format,
            )}
            component={Select}
            className="file-format-list"
            data-testid="file-format-list"
          />
        </Form>
        <Tabs
          className={classes.tabs}
          captions={tabs}
          tabIndex={this.state.tabIndex}
          changeTab={this.changeTab}
          tabs={tabs}
        />
      </div>
    );
  };

  handleCopy = (event: React.MouseEvent | React.ClipboardEvent): void => {
    const { structStr } = this.state;

    try {
      if (isClipboardAPIAvailable()) {
        navigator.clipboard.writeText(structStr || '');
      } else if ('clipboardData' in event) {
        legacyCopy(event.clipboardData, {
          'text/plain': structStr,
        });
        event.preventDefault();
      }
    } catch (e) {
      KetcherLogger.error('copyAs.js::copyAs', e);
      this.props.editor.errorHandler(
        'This feature is not available in your browser',
      );
    }
  };

  renderSaveFile = (): JSX.Element | null => {
    const formState = { ...this.props.formState };
    delete formState.moleculeErrors;
    const { format } = formState.result;
    const { structStr, imageSrc, isLoading } = this.state;

    if (isLoading) return <LoadingState classes={classes} />;

    if (this.isValidStringFormat(format) && this.isImageFormat(format)) {
      return <ImageContent classes={classes} imageSrc={imageSrc || ''} />;
    }
    if (this.isValidStringFormat(format) && this.isBinaryCdxFormat(format)) {
      return <BinaryContent classes={classes} textAreaRef={this.textAreaRef} />;
    }
    return (
      <PreviewContent
        classes={classes}
        structStr={structStr || ''}
        textAreaRef={this.textAreaRef}
        handleCopy={this.handleCopy}
      />
    );
  };

  renderWarnings = (): JSX.Element | null => {
    const formState = { ...this.props.formState };
    const { format } = formState.result;

    if (!this.isValidStringFormat(format)) return null;

    const warnings = this.getWarnings(format);

    return warnings.length ? (
      <div className={classes.warnings}>
        {warnings.map((warning) => (
          <div className={classes.warningsContainer} key={warning}>
            <span className={classes.warningsArr} data-testid="WarningTextArea">
              {warning}
            </span>
          </div>
        ))}
      </div>
    ) : null;
  };

  getButtons = (): JSX.Element[] => {
    const { disableControls, isLoading, structStr } = this.state;
    const { formState } = this.props;
    const { filename, format } = formState.result;
    const isCleanStruct = this.props.struct.isBlank();

    const savingStruct =
      this.isValidStringFormat(format) &&
      this.isBinaryCdxFormat(format) &&
      !isLoading
        ? b64toBlob(structStr || '')
        : structStr;

    const isMoleculeContain =
      this.props.struct.atoms.size && this.props.struct.bonds.size;
    const buttons = [
      <button
        key="save-tmpl"
        className={classes.saveTmpl}
        disabled={disableControls || isCleanStruct || !isMoleculeContain}
        onClick={() => this.props.onTmplSave(this.props.struct)}
        data-testid="save-to-templates-button"
      >
        Save to Templates
      </button>,
    ];

    buttons.push(
      <button
        key="cancel"
        className={classes.cancel}
        onClick={() => this.props.onOk({})}
        type="button"
        data-testid="cancel-button"
      >
        Cancel
      </button>,
    );

    if (this.isValidStringFormat(format) && this.isImageFormat(format)) {
      buttons.push(
        <button
          key="save-image-button"
          className={classes.ok}
          onClick={this.saveImage}
          type="button"
          data-testid="save-button"
          disabled={
            disableControls ||
            !formState.valid ||
            isCleanStruct ||
            !this.props.server ||
            isLoading
          }
        >
          Save
        </button>,
      );
    } else {
      buttons.push(
        <SaveButton
          mode="saveFile"
          data={savingStruct || ''}
          testId="save-button"
          filename={
            filename +
            (this.isValidStringFormat(format)
              ? getPropertiesByFormat(format)?.extensions[0] || ''
              : format.name)
          }
          key="save-file-button"
          type={!this.isValidStringFormat(format) ? format.mime : undefined}
          server={this.props.server}
          onSave={this.props.onOk}
          disabled={disableControls || !formState.valid || isCleanStruct}
          className={classes.ok}
        >
          Save
        </SaveButton>,
      );
    }
    return buttons;
  };

  render(): JSX.Element {
    const DialogComponent = Dialog;
    return (
      <DialogComponent
        testId="save-structure-dialog"
        className={classes.dialog}
        title="Save Structure"
        params={this.props}
        buttons={this.getButtons()}
        needMargin={false}
        withDivider={true}
      >
        {this.renderForm()}
      </DialogComponent>
    );
  }
}

const SaveDialogConnectWrapper = (props: SaveDialogProps) => (
  <SaveDialog {...props} />
);

const getOptions = (state: AppState) => state.options;
const serverSettingsSelector = createSelector([getOptions], (options) =>
  options.getServerSettings(),
);

const mapStateToProps = (state: AppState) => ({
  server: state.options.app.server ? state.server : null,
  struct: state.editor.struct(),
  options: serverSettingsSelector(state),
  formState: state.modal.form,
  moleculeErrors: state.modal.form.moleculeErrors,
  checkState: state.options.check,
  bondThickness: state.options.settings.bondThickness,
  ignoreChiralFlag: state.editor.render.options.ignoreChiralFlag,
  editor: state.editor,
});

const mapDispatchToProps = (
  dispatch: ThunkDispatch<AppState, undefined, AnyAction>,
) => ({
  onCheck: (checkOptions: unknown) => dispatch(check(checkOptions)),
  onTmplSave: (struct: Struct) => dispatch(saveUserTmpl(struct)),
  onResetForm: (prevState: FormState) => dispatch(updateFormState(prevState)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SaveDialogConnectWrapper);
