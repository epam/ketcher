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

import { useEffect, useRef, useState, useCallback } from 'react';
import styled from '@emotion/styled';
import { Icon, IconName } from 'ketcher-react';
import { useAppSelector } from 'hooks';
import { selectEditor } from 'state/common';
import {
  Coordinates,
  Vec2,
  SelectBase,
  CoreAtom,
  BaseMonomer,
} from 'ketcher-core';

const FloatingToolsWrapper = styled.div<{ left: number; top: number }>`
  position: absolute;
  left: ${(props) => props.left}px;
  top: ${(props) => props.top}px;
  display: flex;
  flex-direction: row;
  gap: 8px;
  transform: translate(-50%, -100%) translateY(-10px);
  z-index: 100;
`;

const ToolButton = styled.button`
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  padding: 0;
  color: #2b2f3a;
  box-shadow: 0 6px 10px rgba(103, 104, 132, 0.15);

  &:hover {
    color: #188794;
  }

  &:active {
    background: #167782;
    color: #fff;
  }

  & > svg {
    width: 20px;
    height: 20px;
  }
`;

export interface FloatingToolsProps {
  visible: boolean;
  position: Vec2;
}

const POSITION_EPSILON = 0.1; // view-pixel threshold to avoid noisy updates

export const FloatingTools = () => {
  const editor = useAppSelector(selectEditor);
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState<Vec2>(new Vec2(0, 0));
  const positionRef = useRef<Vec2>(new Vec2(0, 0));

  const updatePosition = useCallback(() => {
    if (!editor) return;

    const bbox =
      editor.drawingEntitiesManager?.getSelectedEntitiesBoundingBox();
    if (!bbox) return;

    const centerX = (bbox.left + bbox.right) / 2;
    const yOffset = 1.7; // angstrom offset to position the tools slightly above the selected entities
    const topY = bbox.top - yOffset;

    const viewPos = Coordinates.modelToView(new Vec2(centerX, topY));
    const dx = Math.abs(viewPos.x - positionRef.current.x);
    const dy = Math.abs(viewPos.y - positionRef.current.y);

    if (dx > POSITION_EPSILON || dy > POSITION_EPSILON) {
      positionRef.current = viewPos;
      setPosition(viewPos);
    }
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    const handleSelectEntities = () => {
      const selectedEntities =
        editor.drawingEntitiesManager?.selectedEntitiesArr ?? [];
      const selectedMonomersAndAtoms = selectedEntities.filter(
        (entity) => entity instanceof CoreAtom || entity instanceof BaseMonomer,
      );

      const isTransforming =
        editor.selectedTool instanceof SelectBase &&
        (editor.selectedTool.mode === 'rotating' ||
          editor.selectedTool.mode === 'moving');

      const shouldShow =
        selectedMonomersAndAtoms.length >= 2 &&
        editor.mode.modeName !== 'sequence-layout-mode' &&
        editor.selectedTool instanceof SelectBase &&
        !isTransforming;

      if (shouldShow) {
        updatePosition();
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    editor.events.selectEntities.add(handleSelectEntities);

    return () => {
      editor.events.selectEntities.remove(handleSelectEntities);
    };
  }, [editor, updatePosition]);

  useEffect(() => {
    if (!editor || !visible) return;

    let rafId = 0;
    const tick = () => {
      const isTransforming =
        editor.selectedTool instanceof SelectBase &&
        (editor.selectedTool.mode === 'rotating' ||
          editor.selectedTool.mode === 'moving');
      if (isTransforming) {
        setVisible(false);
        return;
      }
      updatePosition();
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [editor, visible, updatePosition]);

  const handleFlipHorizontal = () => {
    editor?.events.flipHorizontal.dispatch();
  };

  const handleFlipVertical = () => {
    editor?.events.flipVertical.dispatch();
  };

  const handleDelete = () => {
    editor?.events.deleteSelectedStructure.dispatch();
    setVisible(false);
  };

  if (!visible) {
    return null;
  }

  return (
    <FloatingToolsWrapper left={position.x} top={position.y}>
      <ToolButton
        onClick={handleFlipHorizontal}
        title="Flip horizontally"
        data-testid="transform-flip-h"
      >
        <Icon name={'transform-flip-h' as IconName} />
      </ToolButton>
      <ToolButton
        onClick={handleFlipVertical}
        title="Flip vertically"
        data-testid="transform-flip-v"
      >
        <Icon name={'transform-flip-v' as IconName} />
      </ToolButton>
      <ToolButton
        onClick={handleDelete}
        title="Delete"
        data-testid="float-delete"
      >
        <Icon name={'delete' as IconName} />
      </ToolButton>
    </FloatingToolsWrapper>
  );
};

export default FloatingTools;
