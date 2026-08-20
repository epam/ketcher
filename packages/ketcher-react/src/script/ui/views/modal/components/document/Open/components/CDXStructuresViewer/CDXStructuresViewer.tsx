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
import { MenuList } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import { Icon } from 'components';
import type { Struct } from 'ketcher-core';
import { LoadingCircles } from '../../../../../../components';
import { serverSelector } from '../../../../../../../state/server/selectors';
import StructRender from '../../../../../../../../../components/StructRender/StructRender';
import { parseStruct } from '../../../../../../../state/shared';
import styles from './CDXStructuresViewer.module.less';
import { editorOptionsSelector } from '../../../../../../../state/editor/selectors';

export type CDXStructuresViewerProps = {
  structList?: string[];
  inputHandler: (str: string) => void;
  fileName: string;
};

type item = { base64struct: string; error?: string; struct?: Struct };

type itemsMapInterface = {
  [x: number]: item;
};

export const CDXStructuresViewer = ({
  structList = [],
  inputHandler,
  fileName,
}: CDXStructuresViewerProps) => {
  const server = useSelector(serverSelector);
  const editorOptions = useSelector(editorOptionsSelector);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [itemsMap, setItemsMap] = useState<itemsMapInterface>({});
  const loading = !!structList[selectedIndex] && !itemsMap[selectedIndex];
  const selectedIndexRef = useRef(selectedIndex);
  selectedIndexRef.current = selectedIndex;
  const itemsMapRef = useRef(itemsMap);
  itemsMapRef.current = itemsMap;

  const notifyInputHandler = (item?: item) => {
    if (!item || item.error) {
      inputHandler('');
    } else {
      inputHandler(item.base64struct);
    }
  };

  const getImage = (str: string, index: number) => {
    parseStruct(str, server)
      .then((struct) => {
        const newItem = { base64struct: str, struct };
        setItemsMap((state) => ({
          ...state,
          [index]: newItem,
        }));
        if (selectedIndexRef.current === index) {
          notifyInputHandler(newItem);
        }
      })
      .catch((error) => {
        const newItem = { base64struct: str, error: error.message || error };
        setItemsMap((state) => ({
          ...state,
          [index]: newItem,
        }));
        if (selectedIndexRef.current === index) {
          notifyInputHandler(newItem);
        }
      });
  };

  // Loads the structure for the currently selected index whenever a new
  // structList is provided (e.g. a new file is opened). Selection-driven
  // loading is handled directly in the selection click handler.
  useEffect(() => {
    const currentIndex = selectedIndexRef.current;
    if (structList[currentIndex] && !itemsMapRef.current[currentIndex]) {
      getImage(structList[currentIndex], currentIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [structList]);

  const handleSelectStructure = (index: number) => {
    setSelectedIndex(index);
    const existingItem = itemsMap[index];
    if (structList[index] && !existingItem) {
      getImage(structList[index], index);
    } else {
      notifyInputHandler(existingItem);
    }
  };

  const renderStructure = (structure: item) => {
    if (loading) {
      return (
        <div className={styles.centerWrapper}>
          <LoadingCircles />
        </div>
      );
    }
    if (structure?.error) {
      return <div>Error: {itemsMap[selectedIndex]?.error}</div>;
    }
    if (structure?.struct) {
      return (
        <StructRender
          className={styles.image}
          struct={structure.struct}
          options={{ ...editorOptions, autoScale: true, needCache: false }}
        />
      );
    }
    return null;
  };
  const renderStructures = () => {
    if (!structList?.length) {
      return (
        <div className={styles.centerWrapper}>
          <div>No embedded structures found in the file</div>
        </div>
      );
    }
    return (
      <div className={styles.structuresWrapper}>
        <div className={styles.menuListWrapper}>
          <div className={styles.header}>Select structure</div>
          <MenuList>
            {structList.map((value, index) => (
              <MenuItem
                key={value + index}
                data-testid={`cdx-structure-${index + 1}`}
                selected={index === selectedIndex}
                onClick={() => handleSelectStructure(index)}
              >
                {`Structure ${index + 1}`}
                {itemsMap[index]?.error && <Icon name="error" />}
              </MenuItem>
            ))}
          </MenuList>
        </div>
        <div className={styles.imageWrapper}>
          {renderStructure(itemsMap[selectedIndex])}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.wrapper}>
      <div>
        File: <span className={styles.fileName}>{fileName}</span>
      </div>
      {renderStructures()}
    </div>
  );
};
export default CDXStructuresViewer;
