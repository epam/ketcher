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
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import classes from './ColorPicker.module.less';
import clsx from 'clsx';
import { Icon } from 'components';
import { useSettings } from 'src/hooks';

interface ColorPickerProps {
  value: string;
  name: string;
}

interface ColorPickerCallProps {
  onChange: (value: string) => void;
}

type Props = ColorPickerProps & ColorPickerCallProps;

// Preset colors: 5 columns × 6 rows (light → dark per column)
const presetColors = [
  // Row 1 (blue/purple)
  '#B2B2FF',
  '#8080FF',
  '#4D4DFF',
  '#0000CD',
  '#000099',
  // Row 2 (yellow)
  '#FFE599',
  '#FFD559',
  '#FFBF00',
  '#CC9900',
  '#997300',
  // Row 3 (red)
  '#FFB2B2',
  '#FF8585',
  '#FF3232',
  '#FF0000',
  '#CC0000',
  // Row 4 (purple/violet)
  '#E6B3FF',
  '#D683FF',
  '#C040FF',
  '#9A33CC',
  '#732699',
  // Row 5 (green)
  '#84E184',
  '#5BD75B',
  '#2DB82D',
  '#228B22',
  '#186218',
  // Row 6 (grey)
  '#CCCCCC',
  '#ACACAC',
  '#808080',
  '#666666',
  '#4D4D4D',
];

const MAX_CUSTOM_COLORS = 10;

function isPresetColor(color: string): boolean {
  return presetColors.some(
    (presetColor) => presetColor.toUpperCase() === color.toUpperCase(),
  );
}

function normalizeHexColor(color: string): string {
  return color.toUpperCase();
}

function sanitizeCustomColors(colors: string[]): string[] {
  const uniqueColors = new Set<string>();

  colors.forEach((color) => {
    const normalizedColor = normalizeHexColor(color);

    if (!/^#[0-9A-F]{6}$/.test(normalizedColor)) {
      return;
    }

    if (isPresetColor(normalizedColor)) {
      return;
    }

    uniqueColors.add(normalizedColor);
  });

  return Array.from(uniqueColors).slice(0, MAX_CUSTOM_COLORS);
}

function addCustomColor(colors: string[], color: string): string[] {
  const normalizedColor = normalizeHexColor(color);

  if (isPresetColor(normalizedColor)) {
    return sanitizeCustomColors(colors);
  }

  return sanitizeCustomColors([normalizedColor, ...colors]);
}

// ── Color conversion helpers ──────────────────────────────────────────────────

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let s = 0;
  let h = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hslToHex(h: number, s: number, l: number): string {
  const sl = s / 100;
  const ll = l / 100;
  const a = sl * Math.min(ll, 1 - ll);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = ll - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

function isValidHex(hex: string): boolean {
  return /^[0-9A-Fa-f]{6}$/.test(hex);
}

// ── Custom slider with arrow-shaped thumb ───────────────────────────────────

interface ColorSliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onValueChange: (value: number) => void;
  background: string;
  thumbColor: string;
  ariaLabel: string;
}

function ColorSlider({
  value,
  min,
  max,
  step = 1,
  onValueChange,
  background,
  thumbColor,
  ariaLabel,
}: ColorSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Track container width as state so re-measuring on resize triggers re-render
  const [containerWidth, setContainerWidth] = useState(0);
  const dragRef = useRef<{ startX: number; startValue: number } | null>(null);

  // Measure once after mount (before paint) and on resize
  useLayoutEffect(() => {
    if (!containerRef.current) return;
    setContainerWidth(containerRef.current.offsetWidth);
    const ro = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Derive thumb position synchronously in render — no extra re-render cycle needed
  const thumbWidth = 10;
  const ratio = containerWidth > 0 ? (value - min) / (max - min) : 0;
  const thumbLeft = ratio * (containerWidth - thumbWidth);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      dragRef.current = { startX: e.clientX, startValue: value };
    },
    [value],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!dragRef.current || !containerRef.current) return;
      const containerW = containerRef.current.offsetWidth;
      const dx = e.clientX - dragRef.current.startX;
      const deltaValue = (dx / (containerW - thumbWidth)) * (max - min);
      const raw = dragRef.current.startValue + deltaValue;
      const stepped = Math.round(raw / step) * step;
      const clamped = Math.min(max, Math.max(min, stepped));
      onValueChange(clamped);
    },
    [min, max, step, onValueChange],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      dragRef.current = null;
      e.currentTarget.releasePointerCapture(e.pointerId);
    },
    [],
  );

  return (
    <div ref={containerRef} className={classes.sliderContainer}>
      <svg
        className={classes.sliderThumb}
        style={{ left: thumbLeft }}
        width="10"
        height="15"
        viewBox="0 0 10 15"
        aria-hidden="true"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <path
          d="M 0.5,0.5 L 9.5,0.5 L 9.5,9.5 L 5,14.5 L 0.5,9.5 Z"
          fill={thumbColor}
          stroke="#585858"
          strokeWidth="1"
          strokeLinejoin="round"
        />
      </svg>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onValueChange(parseInt(e.target.value, 10))}
        className={classes.sliderInput}
        style={{ background }}
        aria-label={ariaLabel}
      />
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

const ColorPicker = (props: Props) => {
  const { onChange, value } = props;
  const { settings, updateSettings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [pendingColor, setPendingColor] = useState(value || '#FF3232');
  const [customColors, setCustomColors] = useState<string[]>([]);
  const [hue, setHue] = useState(0);
  const [lightness, setLightness] = useState(50);
  const [hexInput, setHexInput] = useState('');
  const [popupPosition, setPopupPosition] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    visibility: 'hidden' | 'visible';
  }>({ left: 0, visibility: 'hidden' });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const paletteId = 'color-picker-' + useId();

  const applyHexColor = useCallback((hex: string) => {
    setPendingColor(hex);
    const { h, l } = hexToHsl(hex);
    setHue(h);
    setLightness(l);
    setHexInput(hex.replace('#', '').toUpperCase());
  }, []);

  // Sync internal state and compute popup position when popup opens
  useEffect(() => {
    if (isOpen) {
      const initialColor = value || '#FF3232';
      applyHexColor(initialColor);
      setIsCustomOpen(false);

      const newColors = addCustomColor(
        [...(settings?.colorPickerCustomColors ?? [])],
        initialColor,
      );
      setCustomColors(newColors);
      updateSettings({ colorPickerCustomColors: newColors });

      // Position is calculated by useLayoutEffect after the popup renders
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset popup position visibility when closed so next open starts hidden (prevents flash)
  useEffect(() => {
    if (!isOpen) {
      setPopupPosition({ left: 0, visibility: 'hidden' });
    }
  }, [isOpen]);

  // Calculate popup position after it renders — open upward if not enough space below
  useLayoutEffect(() => {
    if (!isOpen || !triggerRef.current || !popupRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const popupHeight = popupRef.current.offsetHeight;
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - triggerRect.bottom - 4;
    const spaceAbove = triggerRect.top - 4;

    if (spaceBelow < popupHeight && spaceAbove > spaceBelow) {
      // Not enough space below — open upward
      setPopupPosition({
        bottom: viewportHeight - triggerRect.top + 4,
        left: triggerRect.left,
        visibility: 'visible',
      });
    } else {
      // Enough space below (or more space below than above) — open downward
      setPopupPosition({
        top: triggerRect.bottom + 4,
        left: triggerRect.left,
        visibility: 'visible',
      });
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const applyColorFromHsl = useCallback((h: number, l: number) => {
    const hex = hslToHex(h, 100, l);
    setPendingColor(hex);
    setHexInput(hex.replace('#', ''));
  }, []);

  const handleToggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleHueChange = useCallback(
    (h: number) => {
      setHue(h);
      applyColorFromHsl(h, lightness);
    },
    [lightness, applyColorFromHsl],
  );

  const handleLightnessChange = useCallback(
    (sliderLightness: number) => {
      const l = 100 - sliderLightness;
      setLightness(l);
      applyColorFromHsl(hue, l);
    },
    [hue, applyColorFromHsl],
  );

  const handleHexInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6);
      setHexInput(raw.toUpperCase());
      if (isValidHex(raw)) {
        applyHexColor('#' + raw.toUpperCase());
      }
    },
    [applyHexColor],
  );

  const selectedCustomColor = customColors.find(
    (color) => color.toUpperCase() === pendingColor.toUpperCase(),
  );

  const handleDeleteCustomColor = useCallback(() => {
    if (!selectedCustomColor) {
      return;
    }

    const newColors = customColors.filter(
      (color) => color.toUpperCase() !== selectedCustomColor.toUpperCase(),
    );
    setCustomColors(newColors);
    updateSettings({ colorPickerCustomColors: newColors });
  }, [selectedCustomColor, customColors, updateSettings]);

  const handleApply = useCallback(() => {
    onChange(pendingColor);
    if (isCustomOpen) {
      const newColors = addCustomColor(customColors, pendingColor);
      setCustomColors(newColors);
      updateSettings({ colorPickerCustomColors: newColors });
    }
    setIsOpen(false);
  }, [onChange, pendingColor, isCustomOpen, customColors, updateSettings]);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleToggleOpen();
      }
    },
    [handleToggleOpen],
  );

  const handleWrapperKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      setIsOpen(false);
    }
  }, []);

  const hueBg =
    'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)';
  const lightnessBg = `linear-gradient(to right, #ffffff, ${hslToHex(
    hue,
    100,
    50,
  )}, #000000)`;

  return (
    <div
      className={classes.colorPickerWrapper}
      data-testid={isOpen ? 'color-picker-field-open' : 'color-picker-field'}
      onClick={(e) => e.preventDefault()}
      onKeyDown={handleWrapperKeyDown}
      role="none"
    >
      <button
        ref={triggerRef}
        type="button"
        className={clsx(
          classes.colorPickerInput,
          isOpen && classes.selectedInput,
        )}
        aria-controls={paletteId}
        aria-expanded={isOpen}
        aria-haspopup="true"
        onClick={handleToggleOpen}
        onKeyDown={handleKeyDown}
      >
        <div
          className={classes.colorPickerPreview}
          data-testid={`${props.name}-color-picker-preview`}
          style={{ backgroundColor: value }}
        />
        <Icon
          className={clsx(classes.expandIcon, !isOpen && classes.turnedIcon)}
          name="chevron"
        />
      </button>

      {/* Dropdown popup — rendered in a portal to escape modal overflow:hidden */}
      {isOpen &&
        createPortal(
          <div
            ref={popupRef}
            className={classes.colorPickerWrap}
            id={paletteId}
            data-testid="color-picker-preset"
            role="none"
            tabIndex={-1}
            style={{
              top: popupPosition.top,
              bottom: popupPosition.bottom,
              left: popupPosition.left,
              visibility: popupPosition.visibility,
            }}
          >
            <div
              className={classes.presetGrid}
              data-testid="color-picker-preset-grid"
            >
              {presetColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => applyHexColor(color)}
                  style={{ backgroundColor: color }}
                  className={clsx(
                    classes.presetSwatch,
                    pendingColor.toUpperCase() === color.toUpperCase() &&
                      classes.swatchSelected,
                  )}
                  aria-label={color}
                />
              ))}
            </div>

            <div className={classes.customSection}>
              <div className={classes.headerGroup}>
                <div className={classes.customHeader}>
                  <span className={classes.customLabel}>Custom Colors</span>
                  <button
                    type="button"
                    className={clsx(
                      classes.customToggleBtn,
                      !isCustomOpen && classes.customToggleBtnPlus,
                      isCustomOpen && classes.customToggleBtnClose,
                    )}
                    onClick={() => setIsCustomOpen((prev) => !prev)}
                    aria-label={
                      isCustomOpen
                        ? 'Close custom colors'
                        : 'Open custom colors'
                    }
                    data-testid="color-picker-btn"
                  >
                    {isCustomOpen ? (
                      <Icon name="close" className={classes.toggleIcon} />
                    ) : (
                      <span className={classes.plusIcon}>+</span>
                    )}
                  </button>
                </div>

                {customColors.length > 0 && (
                  <div className={classes.customSwatchRow}>
                    {customColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => applyHexColor(color)}
                        style={{ backgroundColor: color }}
                        className={clsx(
                          classes.customSwatch,
                          pendingColor.toUpperCase() === color.toUpperCase() &&
                            classes.swatchSelected,
                        )}
                        aria-label={color}
                      />
                    ))}
                  </div>
                )}
              </div>

              {isCustomOpen && (
                <>
                  <div
                    className={classes.slidersRow}
                    data-testid="color-palette"
                  >
                    <div className={classes.slidersCol}>
                      <ColorSlider
                        value={hue}
                        min={0}
                        max={360}
                        onValueChange={handleHueChange}
                        background={hueBg}
                        thumbColor={hslToHex(hue, 100, 50)}
                        ariaLabel="Hue"
                      />
                      <ColorSlider
                        value={100 - lightness}
                        min={0}
                        max={100}
                        onValueChange={handleLightnessChange}
                        background={lightnessBg}
                        thumbColor={pendingColor}
                        ariaLabel="Lightness"
                      />
                    </div>
                    <div
                      className={classes.colorPreviewBox}
                      style={{ backgroundColor: pendingColor }}
                      aria-label="Color preview"
                    />
                  </div>

                  <div className={classes.hexRow}>
                    <div className={classes.hexInputGroup}>
                      <label className={classes.hexLabel} htmlFor="hex-input">
                        HEX#
                      </label>
                      <input
                        id="hex-input"
                        type="text"
                        value={hexInput}
                        onChange={handleHexInputChange}
                        className={classes.hexInput}
                        maxLength={6}
                        placeholder="RRGGBB"
                        data-testid="color-picker-input"
                      />
                    </div>
                    <button
                      type="button"
                      className={classes.deleteBtn}
                      onClick={handleDeleteCustomColor}
                      aria-label="Delete custom color"
                      disabled={!selectedCustomColor}
                    >
                      <Icon name="delete" className={classes.deleteIcon} />
                    </button>
                  </div>
                </>
              )}

              <div className={classes.actionRow}>
                <button
                  type="button"
                  className={classes.cancelBtn}
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={classes.applyBtn}
                  onClick={handleApply}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default ColorPicker;
