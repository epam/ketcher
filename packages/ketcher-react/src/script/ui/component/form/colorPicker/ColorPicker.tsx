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

import { useCallback, useEffect, useId, useRef, useState } from 'react';
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

// Preset colors: 5 columns × 6 rows (light → dark per column)
const presetColors: string[] = [
  // Row 1
  '#99D5FF',
  '#59BAFF',
  '#0095FF',
  '#0077CC',
  '#005999',
  // Row 2
  '#FFE599',
  '#FFD559',
  '#FFBF00',
  '#CC9900',
  '#997300',
  // Row 3
  '#FFADAD',
  '#FF7A7A',
  '#FF3232',
  '#CC2828',
  '#991E1E',
  // Row 4
  '#E6B3FF',
  '#D683FF',
  '#C040FF',
  '#9A33CC',
  '#732699',
  // Row 5
  '#99EBB4',
  '#59DE85',
  '#00CC44',
  '#00A336',
  '#007A29',
  // Row 6
  '#CCCCCC',
  '#ACACAC',
  '#808080',
  '#666666',
  '#4D4D4D',
];

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

// ── Component ─────────────────────────────────────────────────────────────────

const ColorPicker = (props: Props) => {
  const { onChange, value } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [pendingColor, setPendingColor] = useState(value || '#FF3232');
  const [customColors, setCustomColors] = useState<string[]>([]);
  const [hue, setHue] = useState(0);
  const [lightness, setLightness] = useState(50);
  const [hexInput, setHexInput] = useState('');
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const paletteId = 'color-picker-' + useId();

  // Sync internal state and compute popup position when popup opens
  useEffect(() => {
    if (isOpen) {
      const initialColor = value || '#FF3232';
      setPendingColor(initialColor);
      const { h, l } = hexToHsl(initialColor);
      setHue(h);
      setLightness(l);
      setHexInput(initialColor.replace('#', '').toUpperCase());
      setIsCustomOpen(false);

      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setPopupPosition({ top: rect.bottom + 4, left: rect.left });
      }
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const handlePresetClick = useCallback((color: string) => {
    setPendingColor(color);
    const { h, l } = hexToHsl(color);
    setHue(h);
    setLightness(l);
    setHexInput(color.replace('#', '').toUpperCase());
  }, []);

  const handleCustomColorClick = useCallback((color: string) => {
    setPendingColor(color);
    const { h, l } = hexToHsl(color);
    setHue(h);
    setLightness(l);
    setHexInput(color.replace('#', '').toUpperCase());
  }, []);

  const handleHueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const h = parseInt(e.target.value, 10);
      setHue(h);
      applyColorFromHsl(h, lightness);
    },
    [lightness, applyColorFromHsl],
  );

  const handleLightnessChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const sliderLightness = parseInt(e.target.value, 10);
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
        const hex = '#' + raw;
        setPendingColor(hex);
        const { h, l } = hexToHsl(hex);
        setHue(h);
        setLightness(l);
      }
    },
    [],
  );

  const handleDeleteCustomColor = useCallback(() => {
    setHexInput('');
    setPendingColor('#FF3232');
    setHue(0);
    setLightness(50);
  }, []);

  const handleApply = useCallback(() => {
    onChange(pendingColor);
    if (isCustomOpen && !customColors.includes(pendingColor)) {
      setCustomColors((prev) => [pendingColor, ...prev].slice(0, 5));
    }
    setIsOpen(false);
  }, [onChange, pendingColor, isCustomOpen, customColors]);

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
      {/* Trigger button */}
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
            style={{ top: popupPosition.top, left: popupPosition.left }}
          >
            {/* Preset color grid */}
            <div
              className={classes.presetGrid}
              data-testid="color-picker-preset-grid"
            >
              {presetColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handlePresetClick(color)}
                  style={{ backgroundColor: color }}
                  className={clsx(
                    classes.presetSwatch,
                    pendingColor.toUpperCase() === color.toUpperCase() &&
                      classes.presetSwatchSelected,
                  )}
                  aria-label={color}
                />
              ))}
            </div>

            {/* Custom Colors section */}
            <div className={classes.customSection}>
              {/* Header group: label + optional saved swatches */}
              <div className={classes.headerGroup}>
                {/* Custom Colors header */}
                <div className={classes.customHeader}>
                  <span className={classes.customLabel}>Custom Colors</span>
                  <button
                    type="button"
                    className={clsx(
                      classes.customToggleBtn,
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

                {/* Saved custom color swatches */}
                {customColors.length > 0 && (
                  <div className={classes.customSwatchRow}>
                    {customColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => handleCustomColorClick(color)}
                        style={{ backgroundColor: color }}
                        className={clsx(
                          classes.customSwatch,
                          pendingColor.toUpperCase() === color.toUpperCase() &&
                            classes.customSwatchSelected,
                        )}
                        aria-label={color}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Custom color editor */}
              {isCustomOpen && (
                <>
                  {/* Sliders + preview */}
                  <div
                    className={classes.slidersRow}
                    data-testid="color-palette"
                  >
                    <div className={classes.slidersCol}>
                      {/* Hue slider */}
                      <div className={classes.sliderTrackWrap}>
                        <input
                          type="range"
                          min={0}
                          max={360}
                          step={1}
                          value={hue}
                          onChange={handleHueChange}
                          className={classes.slider}
                          style={{ background: hueBg }}
                          aria-label="Hue"
                        />
                      </div>
                      {/* Lightness slider */}
                      <div className={classes.sliderTrackWrap}>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          step={1}
                          value={100 - lightness}
                          onChange={handleLightnessChange}
                          className={classes.slider}
                          style={{ background: lightnessBg }}
                          aria-label="Lightness"
                        />
                      </div>
                    </div>
                    {/* Color preview */}
                    <div
                      className={classes.colorPreviewBox}
                      style={{ backgroundColor: pendingColor }}
                      aria-label="Color preview"
                    />
                  </div>

                  {/* HEX input row */}
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
                      aria-label="Clear custom color"
                    >
                      <Icon name="delete" className={classes.deleteIcon} />
                    </button>
                  </div>
                </>
              )}

              {/* Action buttons */}
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
                  <Icon name="check" className={classes.checkIcon} />
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
