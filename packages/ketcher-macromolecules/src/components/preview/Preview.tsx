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

import { useEffect, useRef, useState } from 'react';
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

const PreviewContainer = styled.div`
  display: inline-block;
  position: absolute;
  background: ${({ theme }) => theme.ketcher.color.background.primary};
  z-index: ${({ theme }) => theme.ketcher.zIndex.overlay};
`;

export const Preview = () => {
  const preview = useAppSelector(selectShowPreview);
  const previewRef = useRef<HTMLDivElement>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const editor = useSelector(selectEditor);

  useEffect(() => {
    if (!previewRef.current || preview.style) {
      return;
    }

    if (preview?.type) {
      previewRef.current.setAttribute('style', '');
      setIsPreviewVisible(true);

      const PREVIEW_OFFSET = 5;

      const previewBoundingClientRect =
        previewRef.current?.getBoundingClientRect();
      const previewHeight = previewBoundingClientRect?.height || 0;
      const previewWidth = previewBoundingClientRect?.width || 0;

      const canvasWrapperBoundingClientRect = ZoomTool.instance?.canvasWrapper
        .node()
        ?.getBoundingClientRect();
      const canvasWrapperBottom = canvasWrapperBoundingClientRect?.bottom || 0;
      const canvasWrapperLeft = canvasWrapperBoundingClientRect?.left || 0;
      const canvasWrapperRight = canvasWrapperBoundingClientRect?.right || 0;

      const targetBoundingClientRect = preview.target?.getBoundingClientRect();
      const targetTop = targetBoundingClientRect?.top || 0;
      const targetBottom = targetBoundingClientRect?.bottom || 0;
      const targetLeft = targetBoundingClientRect?.left || 0;
      const targetWidth = targetBoundingClientRect?.width || 0;
      const targetCenterX = targetLeft - targetWidth / 2;

      const ketcherRootRect = editor?.ketcherRootElementBoundingClientRect;
      const ketcherRootOffsetX = ketcherRootRect?.x || 0;
      const ketcherRootOffsetY = ketcherRootRect?.y || 0;

      const topPreviewPosition =
        targetTop - previewHeight - PREVIEW_OFFSET - ketcherRootOffsetY;
      const bottomPreviewPosition = targetBottom + PREVIEW_OFFSET;
      const leftPreviewPosition =
        targetLeft + targetWidth / 2 - previewWidth / 2 - ketcherRootOffsetX;

      if (targetTop > previewHeight + PREVIEW_OFFSET) {
        previewRef.current.style.top = `${topPreviewPosition}px`;
      } else if (
        targetBottom + previewHeight > canvasWrapperBottom &&
        targetBottom > canvasWrapperBottom / 2
      ) {
        previewRef.current.style.top = `${topPreviewPosition}px`;
      } else {
        previewRef.current.style.top = `${bottomPreviewPosition}px`;
      }

      if (
        targetCenterX > previewWidth / 2 &&
        targetCenterX + previewWidth / 2 < canvasWrapperRight
      ) {
        previewRef.current.style.left = `${leftPreviewPosition}px`;
      } else if (targetCenterX < previewWidth / 2) {
        previewRef.current.style.left = `${canvasWrapperLeft}px`;
      } else {
        const SCROLL_BAR_OFFSET = 10;

        previewRef.current.style.left = `${
          canvasWrapperRight - previewWidth - SCROLL_BAR_OFFSET
        }px`;
      }
    } else if (isPreviewVisible) {
      setIsPreviewVisible(false);
      previewRef.current.setAttribute('style', '');
    }
  }, [preview]);

  if (!preview) {
    return null;
  }

  return (
    <PreviewContainer ref={previewRef} style={{ ...preview?.style }}>
      {preview.type === PreviewType.Monomer && <MonomerPreview />}
      {preview.type === PreviewType.Preset && <PresetPreview />}
      {preview.type === PreviewType.Bond && <BondPreview />}
      {preview.type === PreviewType.AmbiguousMonomer && (
        <AmbiguousMonomerPreview preview={preview} />
      )}
    </PreviewContainer>
  );
};
