import React, { useLayoutEffect, useRef } from 'react';
import lodashUrl from '../../../node_modules/lodash/lodash.min.js?url';
import miewStylesUrl from '../../../packages/ketcher-react/node_modules/miew/dist/Miew.min.css?url';
import miewUrl from '../../../packages/ketcher-react/node_modules/miew/dist/Miew.min.js?url';
import threeModuleUrl from '../../../node_modules/three/build/three.module.min.js?url';

const loadedScripts = new Map();
const loadedStylesheets = new Map();

let miewRuntimePromise;

const loadScript = (src, getGlobal) => {
  if (getGlobal()) {
    return Promise.resolve();
  }

  const cachedScript = loadedScripts.get(src);
  if (cachedScript) {
    return cachedScript;
  }

  const scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');

    script.async = true;
    script.src = src;
    script.onload = () => {
      if (!getGlobal()) {
        reject(
          new Error(`Runtime script did not expose expected global: ${src}`),
        );
        return;
      }

      resolve();
    };
    script.onerror = () => {
      reject(new Error(`Failed to load runtime script: ${src}`));
    };

    document.head.appendChild(script);
  }).catch((error) => {
    loadedScripts.delete(src);
    throw error;
  });

  loadedScripts.set(src, scriptPromise);

  return scriptPromise;
};

const loadStylesheet = (href) => {
  const cachedStylesheet = loadedStylesheets.get(href);
  if (cachedStylesheet) {
    return cachedStylesheet;
  }

  const stylesheetPromise = new Promise((resolve, reject) => {
    const link = document.createElement('link');

    link.rel = 'stylesheet';
    link.href = href;
    link.onload = () => resolve();
    link.onerror = () =>
      reject(new Error(`Failed to load stylesheet: ${href}`));

    document.head.appendChild(link);
  }).catch((error) => {
    loadedStylesheets.delete(href);
    throw error;
  });

  loadedStylesheets.set(href, stylesheetPromise);

  return stylesheetPromise;
};

const loadMiewRuntime = () => {
  if (!miewRuntimePromise) {
    miewRuntimePromise = (async () => {
      await Promise.all([
        loadStylesheet(miewStylesUrl),
        loadScript(lodashUrl, () => window._),
      ]);

      const threeModule = await import(/* @vite-ignore */ threeModuleUrl);
      window.THREE = threeModule;

      await loadScript(miewUrl, () => window.Miew);

      return window.Miew;
    })().catch((error) => {
      miewRuntimePromise = undefined;
      throw error;
    });
  }

  return miewRuntimePromise;
};

const MiewViewer = ({ onInit, options }) => {
  const containerRef = useRef(null);
  const miewRef = useRef(null);

  useLayoutEffect(() => {
    let isDisposed = false;

    loadMiewRuntime()
      .then((Miew) => {
        if (isDisposed || !containerRef.current) {
          return;
        }

        const settings = {
          axes: false,
          fps: false,
          ...options?.settings,
        };
        const miew = new Miew({
          ...options,
          container: containerRef.current,
          settings,
        });

        if (miew.init()) {
          miewRef.current = miew;
          miew.run();
          onInit?.(miew);
        }
      })
      .catch((error) => {
        console.error(error);
      });

    return () => {
      isDisposed = true;
      miewRef.current?.term?.();
      miewRef.current = null;
    };
  }, [onInit, options]);

  return React.createElement(
    'div',
    { ref: containerRef, style: { width: '100%', height: '100%' } },
    'Viewer',
  );
};

export default MiewViewer;
