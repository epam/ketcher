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

import { FC, useEffect, useState } from 'react';
import {
  getStructure,
  KetcherLogger,
  ketcherProvider,
  SupportedFormat,
  type Struct,
} from 'ketcher-core';
import { useAppContext } from 'src/hooks';
import { ketcherInitEventName } from 'src/constants';
import { useAppDispatch } from '../../../state/hooks';
import { showSnackbarNotification } from '../../../state/notifications';
import classes from './SelectedSmiles.module.less';

const COPY_SUCCESS_MESSAGE = 'SMILES copied';
const COPY_ERROR_MESSAGE = 'This feature is not available in your browser';

type BasicSelection = {
  atoms?: number[];
  bonds?: number[];
} | null;

function hasSelectedAtomsOrBonds(selection: BasicSelection): boolean {
  return Boolean(selection?.atoms?.length || selection?.bonds?.length);
}

function isSingleMoleculeSelection(selectedStruct: Struct): boolean {
  if (
    selectedStruct.isBlank() ||
    selectedStruct.atoms.size === 0 ||
    selectedStruct.simpleObjects.size > 0 ||
    selectedStruct.texts.size > 0 ||
    selectedStruct.images.size > 0 ||
    selectedStruct.hasRxnArrow() ||
    selectedStruct.rxnPluses.size > 0 ||
    selectedStruct.hasMultitailArrow()
  ) {
    return false;
  }

  return selectedStruct.findConnectedComponents(true).length === 1;
}

export const SelectedSmiles: FC = () => {
  const dispatch = useAppDispatch();
  const { ketcherId } = useAppContext();
  const [selectedSmiles, setSelectedSmiles] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let selectionSubscriber: unknown;
    let changeSubscriber: unknown;
    let isSubscribed = false;

    const updateRevision = () => {
      setRevision((currentRevision) => currentRevision + 1);
    };

    const subscribe = () => {
      if (isSubscribed) {
        return;
      }

      try {
        const editor = ketcherProvider.getKetcher(ketcherId).editor;

        if (!editor) {
          return;
        }

        selectionSubscriber = editor.subscribe(
          'selectionChange',
          updateRevision,
        );
        changeSubscriber = editor.subscribe('change', updateRevision);
        isSubscribed = true;
        updateRevision();
      } catch {
        // Ketcher instance is not ready yet. Subscription will be retried on init event.
      }
    };

    const unsubscribe = () => {
      if (!isSubscribed) {
        return;
      }

      try {
        const editor = ketcherProvider.getKetcher(ketcherId).editor;

        editor.unsubscribe('selectionChange', selectionSubscriber);
        editor.unsubscribe('change', changeSubscriber);
      } catch {
        // Ketcher instance was already disposed.
      } finally {
        isSubscribed = false;
      }
    };

    const initEventName = ketcherInitEventName(ketcherId);

    window.addEventListener(initEventName, subscribe);
    subscribe();

    return () => {
      unsubscribe();
      window.removeEventListener(initEventName, subscribe);
    };
  }, [ketcherId]);

  useEffect(() => {
    let isCancelled = false;

    const updateSelectedSmiles = async () => {
      try {
        if (window.isPolymerEditorTurnedOn) {
          if (!isCancelled) {
            setSelectedSmiles(null);
          }

          return;
        }

        const ketcher = ketcherProvider.getKetcher(ketcherId);
        const editor = ketcher.editor;
        const selection = editor.selection();

        if (!selection) {
          if (!isCancelled) {
            setSelectedSmiles(null);
          }

          return;
        }

        const explicitSelection = editor.explicitSelected();

        if (!hasSelectedAtomsOrBonds(explicitSelection)) {
          if (!isCancelled) {
            setSelectedSmiles(null);
          }

          return;
        }

        const selectedStruct = editor.structSelected();

        if (!isSingleMoleculeSelection(selectedStruct)) {
          if (!isCancelled) {
            setSelectedSmiles(null);
          }

          return;
        }

        const smiles = await getStructure(
          ketcher.id,
          ketcher.formatterFactory,
          selectedStruct,
          SupportedFormat.smiles,
        );

        if (!isCancelled) {
          setSelectedSmiles(smiles.trim() || null);
        }
      } catch (error) {
        KetcherLogger.error('SelectedSmiles.tsx::updateSelectedSmiles', error);

        if (!isCancelled) {
          setSelectedSmiles(null);
        }
      }
    };

    updateSelectedSmiles();

    return () => {
      isCancelled = true;
    };
  }, [ketcherId, revision]);

  const handleCopy = async () => {
    if (!selectedSmiles) {
      return;
    }

    try {
      if (typeof navigator?.clipboard?.writeText !== 'function') {
        throw new Error(COPY_ERROR_MESSAGE);
      }

      await navigator.clipboard.writeText(selectedSmiles);
      dispatch(showSnackbarNotification(COPY_SUCCESS_MESSAGE));
    } catch (error) {
      KetcherLogger.error('SelectedSmiles.tsx::handleCopy', error);
      ketcherProvider
        .getKetcher(ketcherId)
        .editor.errorHandler?.(COPY_ERROR_MESSAGE);
    }
  };

  if (!selectedSmiles) {
    return null;
  }

  return (
    <div className={classes.container}>
      <span className={classes.label}>SMILES</span>
      <button
        className={classes.button}
        onClick={handleCopy}
        title={selectedSmiles}
        type="button"
        data-testid="selected-smiles-button"
      >
        <span className={classes.value}>{selectedSmiles}</span>
      </button>
    </div>
  );
};
