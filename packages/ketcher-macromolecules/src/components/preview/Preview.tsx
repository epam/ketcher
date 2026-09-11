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

import { useLayoutEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';
import { ZoomTool } from 'ketcher-core';
import { AmbiguousMonomerPreview } from 'ketcher-react';
import { useAppSelector } from 'hooks';
import { PreviewType } from 'state';
import { selectShowPreview, selectEditor } from 'state/common';
import MonomerPreview from './components/MonomerPreview/MonomerPreview';
import PresetPreview from './components/PresetPreview/PresetPreview';
import BondPreview from './components/BondPreview/BondPreview';
import TextPreview from './components/TextPreview/TextPreview';

const PreviewContainer = styled.div`
  display: inline-block;
  position: absolute;
  background: ${({ theme }) => theme.ketcher.color.background.primary};
  z-index: ${({ theme }) => theme.ketcher.zIndex.overlay};
`;

export const Preview = () => {
  const preview = useAppSelector(selectShowPreview);
  const previewRef = useRef<HTMLDivElement>(null);
  const isPreviewVisible = Boolean(preview?.type);
  const editor = useSelector(selectEditor);

  useLayoutEffect(() => {
    if (!previewRef.current || preview.style) {
      return;
    }

    if (preview?.type) {
      previewRef.current.setAttribute('style', '');

      const PREVIEW_OFFSET = 5;

      const previewBoundingClientRect =
        previewRef.current?.getBoundingClientRect();
      const previewHeight = previewBoundingClientRect?.height || 0;
      const previewWidth = previewBoundingClientRect?.width || 0;

      const canvasWrapperBoundingClientRect = ZoomTool.instance?.canvasWrapper
        .node()
        ?.getBoundingClientRect();
      const canvasWrapperTop = canvasWrapperBoundingClientRect?.top || 0;
      const canvasWrapperBottom = canvasWrapperBoundingClientRect?.bottom || 0;
      const canvasWrapperLeft = canvasWrapperBoundingClientRect?.left || 0;
      const canvasWrapperRight = canvasWrapperBoundingClientRect?.right || 0;

      const targetBoundingClientRect = preview.target?.getBoundingClientRect();
      const targetTop = targetBoundingClientRect?.top || 0;
      const targetBottom = targetBoundingClientRect?.bottom || 0;
      const targetLeft = targetBoundingClientRect?.left || 0;
      const targetWidth = targetBoundingClientRect?.width || 0;

      const ketcherRootRect = editor?.ketcherRootElementBoundingClientRect;
      const ketcherRootOffsetX = ketcherRootRect?.x || 0;
      const ketcherRootOffsetY = ketcherRootRect?.y || 0;

      const position = calculatePreviewPosition({
        targetTop,
        targetBottom,
        targetLeft,
        targetWidth,
        previewHeight,
        previewWidth,
        canvasWrapperTop,
        canvasWrapperBottom,
        canvasWrapperLeft,
        canvasWrapperRight,
        ketcherRootOffsetX,
        ketcherRootOffsetY,
        previewOffset: PREVIEW_OFFSET,
      });

      previewRef.current.style.top = `${position.top}px`;
      previewRef.current.style.left = `${position.left}px`;
    } else {
      previewRef.current.setAttribute('style', '');
    }
  }, [editor?.ketcherRootElementBoundingClientRect, isPreviewVisible, preview]);

  if (!preview) {
    return null;
  }

  return (
    <PreviewContainer
      ref={previewRef}
      style={{
        ...preview?.style,
        pointerEvents: preview.style ? 'auto' : 'none',
      }}
    >
      {preview.type === PreviewType.Monomer && <MonomerPreview />}
      {preview.type === PreviewType.Preset && <PresetPreview />}
      {preview.type === PreviewType.Bond && <BondPreview />}
      {preview.type === PreviewType.AmbiguousMonomer && (
        <AmbiguousMonomerPreview preview={preview} />
      )}
      {preview.type === PreviewType.Text && <TextPreview />}
    </PreviewContainer>
  );
};

interface CalculatePreviewPositionParams {
  targetTop: number;
  targetBottom: number;
  targetLeft: number;
  targetWidth: number;
  previewHeight: number;
  previewWidth: number;
  canvasWrapperTop: number;
  canvasWrapperBottom: number;
  canvasWrapperLeft: number;
  canvasWrapperRight: number;
  ketcherRootOffsetX: number;
  ketcherRootOffsetY: number;
  previewOffset: number;
}

export function calculatePreviewPosition({
  targetTop,
  targetBottom,
  targetLeft,
  targetWidth,
  previewHeight,
  previewWidth,
  canvasWrapperTop,
  canvasWrapperBottom,
  canvasWrapperLeft,
  canvasWrapperRight,
  ketcherRootOffsetX,
  ketcherRootOffsetY,
  previewOffset,
}: CalculatePreviewPositionParams) {
  const topPosition = targetTop - previewHeight - previewOffset;
  const bottomPosition = targetBottom + previewOffset;

  if (ketcherRootOffsetX === 0 && ketcherRootOffsetY === 0) {
    const legacyTargetCenterX = targetLeft - targetWidth / 2;
    const shouldPositionAbove =
      topPosition >= canvasWrapperTop ||
      (targetBottom + previewHeight > canvasWrapperBottom &&
        targetBottom > canvasWrapperBottom / 2);

    let left = targetLeft + targetWidth / 2 - previewWidth / 2;
    if (legacyTargetCenterX < previewWidth / 2) {
      left = canvasWrapperLeft;
    } else if (legacyTargetCenterX + previewWidth / 2 >= canvasWrapperRight) {
      const scrollBarOffset = 10;
      left = canvasWrapperRight - previewWidth - scrollBarOffset;
    }

    return {
      top: shouldPositionAbove ? topPosition : bottomPosition,
      left,
    };
  }

  const canvasCenterY = (canvasWrapperTop + canvasWrapperBottom) / 2;
  const shouldPositionAbove =
    topPosition >= canvasWrapperTop ||
    (bottomPosition + previewHeight > canvasWrapperBottom &&
      targetBottom > canvasCenterY);

  const targetCenterX = targetLeft + targetWidth / 2;
  const centeredLeftPosition = targetCenterX - previewWidth / 2;
  const scrollBarOffset = 10;
  const maxLeftPosition = canvasWrapperRight - previewWidth - scrollBarOffset;
  const leftPosition = Math.max(
    canvasWrapperLeft,
    Math.min(centeredLeftPosition, maxLeftPosition),
  );

  return {
    top:
      (shouldPositionAbove ? topPosition : bottomPosition) - ketcherRootOffsetY,
    left: leftPosition - ketcherRootOffsetX,
  };
}
