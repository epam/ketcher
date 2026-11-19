/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import {
  type SdfItem,
  KetcherLogger,
  KetSerializer,
  SdfSerializer,
  SettingsManager,
} from 'ketcher-core';

import { appUpdate } from '../options/actions';
import { storage } from '../../storage-extension';
import templatesRawData from '../../../../templates/library.sdf';
import type { AnyAction, Dispatch } from 'redux';

let cachedInitData: [Dispatch<AnyAction>, string, Element];
let shouldReinitializeTemplateLibrary = false;

interface TemplateLibrary {
  type: string;
  data: { lib: SdfItem[] };
}

export function initLibrary(library: SdfItem[]): TemplateLibrary {
  return {
    type: 'TMPL_INIT',
    data: { lib: library },
  };
}

const deserializeSdfTemplates = async (
  baseUrl: string,
  cacheElement: Element,
  _fileName: string,
): Promise<SdfItem[]> => {
  const options = {
    ignoreChiralFlag: SettingsManager.ignoreChiralFlag,
  };

  const sdfSerializer = new SdfSerializer(options);
  const tmpls = sdfSerializer.deserialize(templatesRawData);
  const prefetch = prefetchRender(tmpls, baseUrl + '/templates/', cacheElement);

  const cachedFiles = await prefetch;
  return tmpls.map((tmpl) => {
    const pr = prefetchSplit(tmpl);
    if (pr.file)
      tmpl.props.prerender = cachedFiles.includes(pr.file) ? `#${pr.id}` : '';

    return tmpl;
  });
};

export default async function initTmplLibrary(
  dispatch: Dispatch<AnyAction>,
  baseUrl: string,
  cacheElement: Element,
): Promise<void> {
  cachedInitData = [dispatch, baseUrl, cacheElement];

  const fileName = 'library.sdf';

  const result = await deserializeSdfTemplates(baseUrl, cacheElement, fileName);
  const library = [...result, ...userTmpls()];
  dispatch(initLibrary(library));
  dispatch(appUpdate({ templates: true }) as unknown as AnyAction);
  if (shouldReinitializeTemplateLibrary) {
    reinitializeTemplateLibrary();
    shouldReinitializeTemplateLibrary = false;
  }
}

export function reinitializeTemplateLibrary(): void {
  if (!cachedInitData) {
    shouldReinitializeTemplateLibrary = true;
    return;
  }

  initTmplLibrary(...cachedInitData);
}

function userTmpls(): SdfItem[] {
  const userLibrary = storage.getItem('ketcher-tmpls');
  if (!Array.isArray(userLibrary) || userLibrary.length === 0) return [];
  const ketSerializer = new KetSerializer();
  return userLibrary
    .map((tmpl) => {
      try {
        if (tmpl.props === '') tmpl.props = {};
        tmpl.props.group = 'User Templates';

        return {
          struct: ketSerializer.deserialize(tmpl.struct),
          props: tmpl.props,
        };
      } catch (error) {
        KetcherLogger.error('init-library.ts::userTmpls', error);
        return null;
      }
    })
    .filter((tmpl): tmpl is SdfItem => tmpl !== null);
}

export async function prefetchStatic(url: string): Promise<string> {
  const resp = await fetch(url, { credentials: 'same-origin' });
  if (resp.ok) return resp.text();
  throw new Error('Could not fetch ' + url);
}

function prefetchSplit(tmpl: SdfItem) {
  const pr = tmpl.props.prerender;
  const result = pr && `${pr}`.split('#', 2);

  return {
    file: pr && result[0],
    id: pr && result[1],
  };
}

async function prefetchRender(
  tmpls: SdfItem[],
  baseUrl: string,
  cacheElement: Element,
): Promise<string[]> {
  const files = tmpls.reduce((result, tmpl) => {
    const file = prefetchSplit(tmpl).file;

    if (file && !result.includes(file)) result.push(file);

    return result;
  }, [] as string[]);
  const svgs = await Promise.all(
    files.map(async (function_) => {
      try {
        return await prefetchStatic(baseUrl + function_);
      } catch (error) {
        KetcherLogger.error('init-library.ts::prefetchRender', error);
        return undefined;
      }
    }),
  );

  svgs.forEach((svgContent) => {
    if (svgContent) cacheElement.innerHTML += svgContent;
  });

  return files.filter((_, index) => !!svgs[index]);
}
