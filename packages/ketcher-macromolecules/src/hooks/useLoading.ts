import { KetcherAsyncEvents, ketcherProvider } from 'ketcher-core';
import { useCallback, useEffect, useState } from 'react';

export function useLoading() {
  const ketcher = ketcherProvider.getKetcher();
  const [isLoading, setIsLoading] = useState(false);

  const onLoadingStart = useCallback(() => setIsLoading(true), [setIsLoading]);
  const onLoadingFinish = useCallback(
    () => setIsLoading(false),
    [setIsLoading],
  );

  useEffect(() => {
    ketcher.eventBus.addListener(KetcherAsyncEvents.LOADING, onLoadingStart);
    ketcher.eventBus.addListener(KetcherAsyncEvents.SUCCESS, onLoadingFinish);
    ketcher.eventBus.addListener(KetcherAsyncEvents.FAILURE, onLoadingFinish);

    return () => {
      ketcher.eventBus.removeListener(
        KetcherAsyncEvents.LOADING,
        onLoadingStart,
      );
      ketcher.eventBus.removeListener(
        KetcherAsyncEvents.SUCCESS,
        onLoadingFinish,
      );
      ketcher.eventBus.removeListener(
        KetcherAsyncEvents.FAILURE,
        onLoadingFinish,
      );
    };
  }, [ketcher.eventBus, onLoadingFinish, onLoadingStart]);

  return isLoading;
}
