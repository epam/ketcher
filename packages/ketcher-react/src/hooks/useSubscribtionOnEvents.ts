/* eslint-disable react-hooks/exhaustive-deps */
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

import { indigoVerification } from '../script/ui/state/request';
import {
  type Ketcher,
  KetcherAsyncEvents,
  KetcherLogger,
  ketcherProvider,
} from 'ketcher-core';
import { useEffect } from 'react';
import { useAppContext } from './useAppContext';
import { ketcherInitEventName } from '../constants';
import { useAppDispatch } from '../script/ui/state/hooks';

export const useSubscriptionOnEvents = () => {
  const dispatch = useAppDispatch();
  const { ketcherId } = useAppContext();

  useEffect(() => {
    const loadingHandler = () => {
      dispatch(indigoVerification(true));
    };
    const actionResultHandler = () => {
      dispatch(indigoVerification(false));
    };

    const subscribe = (ketcher: Ketcher) => {
      ketcher.eventBus.addListener(KetcherAsyncEvents.LOADING, loadingHandler);
      ketcher.eventBus.addListener(
        KetcherAsyncEvents.SUCCESS,
        actionResultHandler,
      );
      ketcher.eventBus.addListener(
        KetcherAsyncEvents.FAILURE,
        actionResultHandler,
      );
    };

    const unsubscribe = (ketcher: Ketcher) => {
      ketcher.eventBus.removeListener(
        KetcherAsyncEvents.LOADING,
        loadingHandler,
      );
      ketcher.eventBus.removeListener(
        KetcherAsyncEvents.SUCCESS,
        actionResultHandler,
      );
      ketcher.eventBus.removeListener(
        KetcherAsyncEvents.FAILURE,
        actionResultHandler,
      );
    };

    // Instance may already be removed from the provider (fast mount/unmount, duo mode) - #3515, #7568.
    const getKetcherSafely = () => {
      try {
        return ketcherProvider.getKetcher(ketcherId);
      } catch (error) {
        KetcherLogger.error(
          `Failed to get ketcher instance with id ${ketcherId}`,
          error,
        );
        return undefined;
      }
    };

    const subscribeOnInit = () => {
      const ketcher = getKetcherSafely();
      if (ketcher) {
        subscribe(ketcher);
      }
    };

    const initEventName = ketcherInitEventName(ketcherId);
    window.addEventListener(initEventName, subscribeOnInit);
    return () => {
      const ketcher = getKetcherSafely();
      if (ketcher) {
        unsubscribe(ketcher);
      }
      window.removeEventListener(initEventName, subscribeOnInit);
    };
  }, [ketcherId, dispatch]);
};
