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

import { MAX_CUSTOM_COLORS, presetColors } from './ColorPicker.constants';

export function isPresetColor(color: string): boolean {
  return presetColors.some(
    (presetColor) => presetColor.toUpperCase() === color.toUpperCase(),
  );
}

export function normalizeHexColor(color: string): string {
  return color.toUpperCase();
}

export function sanitizeCustomColors(
  colors: string[] | readonly string[],
): string[] {
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

export function addCustomColor(
  colors: string[] | readonly string[],
  color: string,
): string[] {
  const normalizedColor = normalizeHexColor(color);

  if (isPresetColor(normalizedColor)) {
    return sanitizeCustomColors(colors);
  }

  return sanitizeCustomColors([normalizedColor, ...colors]);
}

export function hexToHsl(hex: string): { h: number; s: number; l: number } {
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

export function hslToHex(h: number, s: number, l: number): string {
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

export function isValidHex(hex: string): boolean {
  return /^[0-9A-Fa-f]{6}$/.test(hex);
}

export function sanitizeHexInput(rawInput: string): string {
  return rawInput
    .replace(/[^0-9a-fA-F]/g, '')
    .slice(0, 6)
    .toUpperCase();
}
