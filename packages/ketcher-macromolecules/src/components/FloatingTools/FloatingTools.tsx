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

import { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { Icon, IconName } from 'ketcher-react';
import { useAppSelector } from 'hooks';
import { selectEditor } from 'state/common';
import { Vec2 } from 'ketcher-core';

const FloatingToolsWrapper = styled.div<{ left: number; top: number }>`
  position: absolute;
  left: ${(props) => props.left}px;
  top: ${(props) => props.top}px;
  display: flex;
  flex-direction: row;
  gap: 4px;
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
  border: 1px solid #b4b9d6;
  border-radius: 4px;
  cursor: pointer;
  padding: 0;

  &:hover {
    background: #e1e5ea;
    border-color: #365cff;
  }

  &:active {
    background: #ccd4ff;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

export interface FloatingToolsProps {
  visible: boolean;
  position: Vec2;
}

export const FloatingTools = () => {
  const editor = useAppSelector(selectEditor);
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState<Vec2>(new Vec2(0, 0));

  useEffect(() => {
    if (!editor) return;

    const handleSelectEntities = () => {
      // Show floating tools only when 2+ monomers are selected
      const selectedMonomers = editor.drawingEntitiesManager?.selectedMonomers;
      const shouldShow =
        selectedMonomers &&
        selectedMonomers.length >= 2 &&
        editor.mode.modeName !== 'sequence-layout-mode';

      if (shouldShow) {
        const bbox =
          editor.drawingEntitiesManager?.getSelectedEntitiesBoundingBox();
        if (bbox) {
          // Position the floating tools above the bounding box center
          const centerX = (bbox.left + bbox.right) / 2;
          const topY = bbox.top;
          // Convert from model coordinates to view coordinates
          const viewPos = new Vec2(centerX * 40, topY * 40);
          setPosition(viewPos);
          setVisible(true);
        }
      } else {
        setVisible(false);
      }
    };

    editor.events.selectEntities.add(handleSelectEntities);

    return () => {
      editor.events.selectEntities.remove(handleSelectEntities);
    };
  }, [editor]);

  const handleFlipHorizontal = () => {
    editor?.events.flipHorizontal.dispatch();
  };

  const handleFlipVertical = () => {
    editor?.events.flipVertical.dispatch();
  };

  const handleDelete = () => {
    editor?.events.deleteSelectedStructure.dispatch();
  };

  if (!visible) {
    return null;
  }

  return (
    <FloatingToolsWrapper left={position.x} top={position.y}>
      <ToolButton
        onClick={handleFlipHorizontal}
        title="Flip horizontally"
        data-testid="floating-tool-flip-h"
      >
        <Icon name={'transform-flip-h' as IconName} />
      </ToolButton>
      <ToolButton
        onClick={handleFlipVertical}
        title="Flip vertically"
        data-testid="floating-tool-flip-v"
      >
        <Icon name={'transform-flip-v' as IconName} />
      </ToolButton>
      <ToolButton
        onClick={handleDelete}
        title="Delete"
        data-testid="floating-tool-delete"
      >
        <Icon name={'delete' as IconName} />
      </ToolButton>
    </FloatingToolsWrapper>
  );
};

export default FloatingTools;
