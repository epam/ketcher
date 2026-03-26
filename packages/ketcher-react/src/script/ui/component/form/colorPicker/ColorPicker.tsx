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
  ChangeEvent,
  KeyboardEvent,
  MouseEvent as ReactMouseEvent,
  CSSProperties,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import classes from './ColorPicker.module.less';
import clsx from 'clsx';
import { Icon } from 'components';

interface ColorPickerProps {
  value: string;
  name: string;
}

interface ColorPickerCallProps {
  onChange: (value: string) => void;
}

type Props = ColorPickerProps & ColorPickerCallProps;

const presetColors = [
  '#8FC8F4',
  '#5CAFEF',
  '#2090E5',
  '#1B77BE',
  '#165C93',
  '#FDE396',
  '#FAD35E',
  '#F9BE00',
  '#D1A300',
  '#A37E00',
  '#F9A0A4',
  '#FE7177',
  '#FF3138',
  '#D42A2A',
  '#AA2020',
  '#D5A2F0',
  '#BF70EA',
  '#B43BE3',
  '#9937C9',
  '#79309F',
  '#93E2AD',
  '#59D47B',
  '#08C83C',
  '#0BA531',
  '#0B7F26',
  '#C8C8CA',
  '#ABABAD',
  '#8E8E90',
  '#717173',
  '#565658',
];

const DEFAULT_COLOR = '#000000';
const COMPLETE_HEX_PATTERN = /^[0-9A-F]{6}$/;
const HUE_SLIDER_BACKGROUND =
  'linear-gradient(90deg, #FF0000 0%, #FFFF00 17%, #00FF00 33%, #00FFFF 50%, #0000FF 67%, #FF00FF 83%, #FF0000 100%)';
const PORTAL_OFFSET = 4;
const PORTAL_EDGE_OFFSET = 8;
const PICKER_FALLBACK_WIDTH = 396;
const PICKER_FALLBACK_COLLAPSED_HEIGHT = 240;
const PICKER_FALLBACK_EXPANDED_HEIGHT = 420;

type HslColor = {
  h: number;
  s: number;
  l: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const normalizeHexInput = (value = '') =>
  value
    .replace(/[^0-9A-F]/gi, '')
    .slice(0, 6)
    .toUpperCase();

const normalizeHexColor = (value = DEFAULT_COLOR) => {
  const normalized = normalizeHexInput(value.replace('#', ''));

  if (!COMPLETE_HEX_PATTERN.test(normalized)) {
    return DEFAULT_COLOR;
  }

  return `#${normalized}`;
};

const hexToRgb = (color: string) => {
  const normalized = normalizeHexColor(color).slice(1);

  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
};

const rgbToHex = ({ r, g, b }: { r: number; g: number; b: number }) =>
  `#${clamp(Math.round(r), 0, 255).toString(16).padStart(2, '0')}${clamp(
    Math.round(g),
    0,
    255,
  )
    .toString(16)
    .padStart(2, '0')}${clamp(Math.round(b), 0, 255)
    .toString(16)
    .padStart(2, '0')}`.toUpperCase();

const rgbToHsl = ({
  r,
  g,
  b,
}: {
  r: number;
  g: number;
  b: number;
}): HslColor => {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  const lightness = (max + min) / 2;

  if (delta === 0) {
    return {
      h: 0,
      s: 0,
      l: Math.round(lightness * 100),
    };
  }

  const saturation =
    lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);

  let hue = 0;

  switch (max) {
    case red:
      hue = (green - blue) / delta + (green < blue ? 6 : 0);
      break;
    case green:
      hue = (blue - red) / delta + 2;
      break;
    default:
      hue = (red - green) / delta + 4;
      break;
  }

  return {
    h: Math.round(hue * 60),
    s: Math.round(saturation * 100),
    l: Math.round(lightness * 100),
  };
};

const hueToRgb = (p: number, q: number, t: number) => {
  let normalized = t;

  if (normalized < 0) {
    normalized += 1;
  }

  if (normalized > 1) {
    normalized -= 1;
  }

  if (normalized < 1 / 6) {
    return p + (q - p) * 6 * normalized;
  }

  if (normalized < 1 / 2) {
    return q;
  }

  if (normalized < 2 / 3) {
    return p + (q - p) * (2 / 3 - normalized) * 6;
  }

  return p;
};

const hslToRgb = ({ h, s, l }: HslColor) => {
  const hue = (((h % 360) + 360) % 360) / 360;
  const saturation = clamp(s, 0, 100) / 100;
  const lightness = clamp(l, 0, 100) / 100;

  if (saturation === 0) {
    const channel = lightness * 255;

    return {
      r: channel,
      g: channel,
      b: channel,
    };
  }

  const q =
    lightness < 0.5
      ? lightness * (1 + saturation)
      : lightness + saturation - lightness * saturation;
  const p = 2 * lightness - q;

  return {
    r: hueToRgb(p, q, hue + 1 / 3) * 255,
    g: hueToRgb(p, q, hue) * 255,
    b: hueToRgb(p, q, hue - 1 / 3) * 255,
  };
};

const hexToHsl = (color: string) => rgbToHsl(hexToRgb(color));

const hslToHex = (color: HslColor) => rgbToHex(hslToRgb(color));

const getPickerPosition = (
  triggerRect: DOMRect,
  isPaletteOpen: boolean,
  pickerRect?: DOMRect,
): CSSProperties => {
  const pickerWidth = pickerRect?.width ?? PICKER_FALLBACK_WIDTH;
  const pickerHeight =
    pickerRect?.height ??
    (isPaletteOpen
      ? PICKER_FALLBACK_EXPANDED_HEIGHT
      : PICKER_FALLBACK_COLLAPSED_HEIGHT);
  const maxLeft = window.innerWidth - pickerWidth - PORTAL_EDGE_OFFSET;
  const maxTop = window.innerHeight - pickerHeight - PORTAL_EDGE_OFFSET;

  return {
    left: `${Math.max(
      PORTAL_EDGE_OFFSET,
      Math.min(triggerRect.left, maxLeft),
    )}px`,
    top: `${Math.max(
      PORTAL_EDGE_OFFSET,
      Math.min(triggerRect.bottom + PORTAL_OFFSET, maxTop),
    )}px`,
  };
};

const ColorPicker = (props: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [draftColor, setDraftColor] = useState(normalizeHexColor(props.value));
  const [draftHexValue, setDraftHexValue] = useState(
    normalizeHexColor(props.value).slice(1),
  );
  const [draftHsl, setDraftHsl] = useState<HslColor>(
    hexToHsl(normalizeHexColor(props.value)),
  );
  const { onChange, value } = props;
  const paletteId = 'color-picker-' + useId();
  const inputId = 'color-picker-input-' + useId();
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [pickerPosition, setPickerPosition] = useState<CSSProperties>({
    left: '0px',
    top: '0px',
  });

  const syncDraftState = useCallback((nextColor: string) => {
    const normalizedColor = normalizeHexColor(nextColor);

    setDraftColor(normalizedColor);
    setDraftHexValue(normalizedColor.slice(1));
    setDraftHsl(hexToHsl(normalizedColor));
  }, []);

  useEffect(() => {
    if (!isOpen) {
      syncDraftState(value);
    }
  }, [isOpen, syncDraftState, value]);

  const handlePaletteClose = useCallback(() => {
    syncDraftState(value);
    setIsPaletteOpen(false);
    setIsOpen(false);
  }, [syncDraftState, value]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleMouseDown = (event: globalThis.MouseEvent) => {
      if (
        !wrapperRef.current?.contains(event.target as Node) &&
        !pickerRef.current?.contains(event.target as Node)
      ) {
        handlePaletteClose();
      }
    };

    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [handlePaletteClose, isOpen]);

  const updatePickerPosition = useCallback(() => {
    if (!triggerRef.current) {
      return;
    }

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const pickerRect = pickerRef.current?.getBoundingClientRect();

    setPickerPosition(
      getPickerPosition(triggerRect, isPaletteOpen, pickerRect),
    );
  }, [isPaletteOpen]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const animationFrameId = window.requestAnimationFrame(updatePickerPosition);

    const handleViewportChange = () => {
      updatePickerPosition();
    };

    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
    };
  }, [isOpen, isPaletteOpen, updatePickerPosition]);

  const updateDraftFromColor = useCallback(
    (nextColor: string) => {
      syncDraftState(nextColor);
    },
    [syncDraftState],
  );

  const toggleField = () => {
    if (isOpen) {
      handlePaletteClose();
      return;
    }

    syncDraftState(value);
    setIsPaletteOpen(false);
    setIsOpen(true);
  };

  const handleFieldClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    toggleField();
  };

  const handlePaletteToggle = () => {
    setIsPaletteOpen((previousValue) => !previousValue);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleField();
    }
  };

  const handleWrapperKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      handlePaletteClose();
    }
  };

  const handleHueChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextHsl = {
      ...draftHsl,
      h: Number(event.target.value),
    };
    const nextHex = hslToHex(nextHsl);

    setDraftHsl(nextHsl);
    setDraftColor(nextHex);
    setDraftHexValue(nextHex.slice(1));
  };

  const handleLightnessChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextHsl = {
      ...draftHsl,
      l: Number(event.target.value),
    };
    const nextHex = hslToHex(nextHsl);

    setDraftHsl(nextHsl);
    setDraftColor(nextHex);
    setDraftHexValue(nextHex.slice(1));
  };

  const handleHexChange = (event: ChangeEvent<HTMLInputElement>) => {
    const normalizedHexValue = normalizeHexInput(event.target.value);

    setDraftHexValue(normalizedHexValue);

    if (COMPLETE_HEX_PATTERN.test(normalizedHexValue)) {
      updateDraftFromColor(`#${normalizedHexValue}`);
    }
  };

  const handleApply = () => {
    onChange(draftColor.toLowerCase());
    setIsPaletteOpen(false);
    setIsOpen(false);
  };

  const selectedLightnessBackground = useMemo(
    () =>
      `linear-gradient(90deg, #FFFFFF 0%, ${hslToHex({
        ...draftHsl,
        l: 50,
      })} 50%, #000000 100%)`,
    [draftHsl.h, draftHsl.s],
  );

  return (
    <div
      ref={wrapperRef}
      className={classes.colorPickerWrapper}
      data-testid={isOpen ? 'color-picker-field-open' : 'color-picker-field'}
      onKeyDown={handleWrapperKeyDown}
      role="none"
    >
      <button
        ref={triggerRef}
        type="button"
        className={clsx({
          [classes.colorPickerInput]: true,
          [classes.selectedInput]: isOpen,
        })}
        aria-controls={paletteId}
        aria-expanded={isOpen}
        aria-haspopup="true"
        onClick={handleFieldClick}
        onKeyDown={handleKeyDown}
      >
        <div
          className={classes.colorPickerPreview}
          data-testid={`${props.name}-color-picker-preview`}
          style={{ backgroundColor: value }}
        />

        <Icon
          className={clsx({
            [classes.expandIcon]: true,
            [classes.turnedIcon]: !isOpen,
          })}
          name="chevron"
        />
      </button>
      {isOpen &&
        createPortal(
          <div
            ref={pickerRef}
            className={classes.colorPickerWrap}
            id={paletteId}
            data-testid="color-picker-preset"
            role="dialog"
            aria-label="Color picker"
            style={pickerPosition}
          >
            <div className={classes.presetColors}>
              {presetColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => updateDraftFromColor(color)}
                  style={{ backgroundColor: color }}
                  className={clsx(
                    classes.presetColor,
                    draftColor === color && classes.selectedPresetColor,
                  )}
                  aria-label={`Select ${color} color`}
                />
              ))}
            </div>

            <div className={classes.paletteHeader}>
              <span className={classes.paletteTitle}>Custom Colors</span>
              <button
                type="button"
                className={classes.paletteToggle}
                onClick={handlePaletteToggle}
                data-testid="color-picker-btn"
                aria-expanded={isPaletteOpen}
                aria-controls={`${paletteId}-custom`}
              >
                <Icon name={isPaletteOpen ? 'close' : 'plus'} />
              </button>
            </div>

            {isPaletteOpen && (
              <div
                className={classes.colorPicker}
                data-testid="color-palette"
                id={`${paletteId}-custom`}
              >
                <div className={classes.colorPickerControls}>
                  <div className={classes.sliderContainer}>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={draftHsl.h}
                      onChange={handleHueChange}
                      className={classes.colorSlider}
                      style={{ backgroundImage: HUE_SLIDER_BACKGROUND }}
                      aria-label="Hue"
                    />
                  </div>
                  <div className={classes.sliderAndPreview}>
                    <div className={classes.sliderContainer}>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={draftHsl.l}
                        onChange={handleLightnessChange}
                        className={classes.colorSlider}
                        style={{ backgroundImage: selectedLightnessBackground }}
                        aria-label="Lightness"
                      />
                    </div>
                    <div
                      className={classes.colorPreviewBox}
                      style={{ backgroundColor: draftColor }}
                      aria-label={`Selected color ${draftColor}`}
                    />
                  </div>
                </div>
                <div className={classes.colorContainer}>
                  <label className={classes.hex} htmlFor={inputId}>
                    HEX#
                  </label>
                  <input
                    id={inputId}
                    data-testid="color-picker-input"
                    className={classes.hexInput}
                    value={draftHexValue}
                    onChange={handleHexChange}
                    maxLength={6}
                    inputMode="text"
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <button
                    type="button"
                    className={classes.clearButton}
                    onClick={() => setDraftHexValue('')}
                    data-testid="clear-custom-color-button"
                    aria-label="Clear custom color"
                  >
                    <Icon name="delete" />
                  </button>
                </div>
              </div>
            )}
            <div className={classes.actions}>
              <button
                type="button"
                className={clsx(classes.actionButton, classes.cancelButton)}
                onClick={handlePaletteClose}
              >
                Cancel
              </button>
              <button
                type="button"
                className={clsx(classes.actionButton, classes.applyButton)}
                onClick={handleApply}
              >
                Apply
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default ColorPicker;
