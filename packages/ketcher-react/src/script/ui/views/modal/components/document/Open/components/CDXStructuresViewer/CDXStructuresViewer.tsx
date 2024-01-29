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

import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { MenuList } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import { Icon } from 'components';
import { Struct } from 'ketcher-core';
import { LoadingCircles } from '../../../../../../components';
import { serverSelector } from '../../../../../../../state/server/selectors';
import StructRender from '../../../../../../../../../components/StructRender/StructRender';
import { parseStruct } from '../../../../../../../state/shared';
import styles from './CDXStructuresViewer.module.less';
import { editorOptionsSelector } from '../../../../../../../state/editor/selectors';

export type CDXStructuresViewerProps = {
  structList?: string[];
  inputHandler: (str: string) => void;
  structStr: string;
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!itemsMap[selectedIndex] || itemsMap[selectedIndex].error) {
      inputHandler('');
    } else {
      inputHandler(itemsMap[selectedIndex].base64struct);
    }
  }, [inputHandler, itemsMap, selectedIndex]);

  const getImages = useCallback(() => {
    const itemsList = {};
    setLoading(true);
    const promises = structList.map((str) => {
      return parseStruct(str, server)
        .then((struct) => {
          return {
            base64struct: str,
            struct,
          };
        })
        .catch((error) => {
          return {
            base64struct: str,
            error: error.message || error,
          };
        });
    });
    Promise.allSettled(promises).then((values) => {
      values.forEach((el, index) => {
        if (el.status === 'fulfilled') {
          itemsList[index] = el.value;
        }
      });
      setItemsMap(itemsList);
      setLoading(false);
      setSelectedIndex(0);
    });
  }, [server, structList]);

  useEffect(() => {
    getImages();
  }, [getImages]);

  const renderStructure = (structure: item) => {
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
    const menuList = Object.values(itemsMap) || [];
    return (
      <div className={styles.structuresWrapper}>
        <div className={styles.menuListWrapper}>
          <div className={styles.header}>Select structure</div>
          <MenuList>
            {menuList.map((value, index) => (
              <MenuItem
                key={value.base64struct + index}
                selected={index === selectedIndex}
                onClick={() => setSelectedIndex(index)}
              >
                {`Structure ${index + 1}`}
                {value.error && <Icon name="error" />}
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
      {loading ? (
        <div className={styles.centerWrapper}>
          <LoadingCircles />
        </div>
      ) : (
        renderStructures()
      )}
    </div>
  );
};
export default CDXStructuresViewer;
