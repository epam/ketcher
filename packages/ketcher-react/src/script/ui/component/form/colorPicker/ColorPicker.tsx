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
import {
  addCustomColor,
  hslToHex,
  hexToHsl,
  isValidHex,
  sanitizeHexInput,
} from './ColorPicker.utils';
import PresetGrid from './PresetGrid';
import CustomColorSwatches from './CustomColorSwatches';
import CustomColorEditor from './CustomColorEditor';

interface Props {
  value: string;
  name: string;
  onChange: (value: string) => void;
}

const DEFAULT_COLOR = '#FF3232';

const ColorPicker = (props: Props) => {
  const { onChange, value } = props;
  const { settings, updateSettings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [pendingColor, setPendingColor] = useState(value || DEFAULT_COLOR);
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
      const initialColor = value || DEFAULT_COLOR;
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
      const raw = sanitizeHexInput(e.target.value);
      setHexInput(raw);
      if (isValidHex(raw)) {
        applyHexColor('#' + raw);
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
            <PresetGrid
              selectedColor={pendingColor}
              onSelectColor={applyHexColor}
            />

            <div className={classes.customSection}>
              <CustomColorSwatches
                customColors={customColors}
                pendingColor={pendingColor}
                onSelectColor={applyHexColor}
                isCustomOpen={isCustomOpen}
                onToggleCustomOpen={() => setIsCustomOpen((prev) => !prev)}
              />

              {isCustomOpen && (
                <CustomColorEditor
                  customColors={customColors}
                  pendingColor={pendingColor}
                  hue={hue}
                  lightness={lightness}
                  hexInput={hexInput}
                  onHueChange={handleHueChange}
                  onLightnessChange={handleLightnessChange}
                  onHexInputChange={handleHexInputChange}
                  onDeleteCustomColor={handleDeleteCustomColor}
                />
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
