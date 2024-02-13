import { KetcherLogger } from 'ketcher-core';
import { useEffect } from 'react';

type ErrorHandlerFunc = (errorMessage: string) => void;

export const useWindowErrorSubscription = (
  handleError: ErrorHandlerFunc,
  enableLogging: boolean | undefined,
  setEnableLogging: React.Dispatch<React.SetStateAction<boolean | undefined>>,
) => {
  useEffect(() => {
    const globalErrorHandler = (errorEvent: ErrorEvent) => {
      const error = errorEvent.error;
      const message =
        error && error.message
          ? 'An error occurred: ' + error.message
          : 'Something went wrong. The error is on our side. Please try again later.';

      if (!enableLogging) {
        setEnableLogging(true);
        KetcherLogger.settings.enabled = true;
      }

      handleError(message);
    };
    window.addEventListener('error', globalErrorHandler);

    return () => {
      window.removeEventListener('error', globalErrorHandler);
    };
  }, [handleError, enableLogging, setEnableLogging]);
};
