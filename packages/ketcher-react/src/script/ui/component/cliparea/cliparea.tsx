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

import { Component, createRef, RefObject } from 'react';
import clsx from 'clsx';
import classes from './cliparea.module.less';
import {
  KetcherLogger,
  notifyRequestCompleted,
  isControlKey,
  isClipboardAPIAvailable,
  notifyCopyCut,
} from 'ketcher-core';

const ieCb: DataTransfer | undefined =
  typeof window !== 'undefined'
    ? (window as Window & { clipboardData?: DataTransfer }).clipboardData
    : undefined;

export const CLIP_AREA_BASE_CLASS = 'cliparea';
let needSkipCopyEvent = false;

const isUserEditing = (): boolean => {
  const el = document.activeElement;
  if (!el) {
    return false;
  }

  // If focused on ClipArea's textarea, treat as not editing a user field
  if (el.hasAttribute?.('data-cliparea')) {
    return false;
  }
  // Check for input, textarea, or contenteditable
  return Boolean(
    el.tagName === 'TEXTAREA' ||
      (el.tagName === 'INPUT' &&
        (el as HTMLInputElement).type !== 'button' &&
        (el as HTMLInputElement).type !== 'submit' &&
        (el as HTMLInputElement).type !== 'reset') ||
      (el as HTMLElement).contentEditable === 'true',
  );
};

interface ClipboardData {
  'text/plain': string;
  [key: string]: string;
}

interface ClipAreaProps {
  formats: string[];
  focused: () => boolean;
  onCopy: () => Promise<ClipboardData | null | undefined>;
  onCut: () => Promise<ClipboardData | null | undefined>;
  onPaste: (
    data: ClipboardItem[] | ClipboardData,
    isSmarts?: boolean,
  ) => Promise<void>;
  onLegacyCut: () => ClipboardData | null | undefined;
  onLegacyPaste: (data: ClipboardData, isSmarts?: boolean) => void;
  target?: HTMLElement;
}

interface ClipAreaListeners {
  mouseup: (event: MouseEvent) => void;
  mousedown: (event: MouseEvent) => void;
  copy: (event: ClipboardEvent) => void;
  cut: (event: ClipboardEvent) => void;
  paste: (event: ClipboardEvent) => void;
  keydown: (event: KeyboardEvent) => void;
}

class ClipArea extends Component<ClipAreaProps> {
  private textAreaRef: RefObject<HTMLTextAreaElement | null>;
  private target: HTMLElement | null = null;
  private listeners: ClipAreaListeners | null = null;

  constructor(props: ClipAreaProps) {
    super(props);
    this.textAreaRef = createRef<HTMLTextAreaElement | null>();
  }

  componentDidMount(): void {
    const el = this.textAreaRef.current;
    if (!el) return;

    this.target =
      this.props.target || (el.parentNode as HTMLElement | null) || null;

    this.listeners = {
      mouseup: (event: MouseEvent) => {
        if (
          el === event.target ||
          (!isActiveElement(event.target as HTMLElement) &&
            this.props.focused())
        ) {
          autoselect(el);
        }
      },
      mousedown: (event: MouseEvent) => {
        if (event.shiftKey && !isActiveElement(event.target as HTMLElement))
          event.preventDefault();
      },
      copy: (event: ClipboardEvent) => {
        if (!this.props.focused() || isUserEditing()) {
          return;
        }
        if (isClipboardAPIAvailable()) {
          this.props.onCopy().then((data) => {
            if (!data) {
              return;
            }
            copy(data).then(() => {
              event.preventDefault();
              notifyCopyCut();
            });
          });
        } else {
          if (needSkipCopyEvent) {
            needSkipCopyEvent = false;
            return;
          }
          needSkipCopyEvent = true;

          this.props.onCopy().then((data) => {
            // It is possible to have access to clipboard data through evt.clipboardData
            // only in synchronous code. That's why we dispatch 'copy' event here after server call.
            // It will not work with long operations which time > 5 sec, because browser will close access
            // to clipboard data if user did not interact with application.
            addEventListener(
              'copy',
              (evt: Event) => {
                const clipboardEvent = evt as ClipboardEvent;
                if (clipboardEvent.clipboardData && data) {
                  legacyCopy(clipboardEvent.clipboardData, data);
                }
                evt.preventDefault();
              },
              { once: true },
            );
            document.execCommand('copy');
          });

          event.preventDefault();
        }
      },
      cut: async (event: ClipboardEvent) => {
        if (!this.props.focused() || isUserEditing()) {
          return;
        }
        if (isClipboardAPIAvailable()) {
          this.props.onCut().then((data) => {
            if (!data) {
              return;
            }
            copy(data).then(() => {
              event.preventDefault();
              notifyCopyCut();
            });
          });
        } else {
          const data = this.props.onLegacyCut();
          if (data && event.clipboardData) {
            legacyCopy(event.clipboardData, data);
          }
          event.preventDefault();
        }
      },
      paste: (event: ClipboardEvent) => {
        if (!this.props.focused() || isUserEditing()) {
          return;
        }
        if (isClipboardAPIAvailable()) {
          navigator.clipboard.read().then((data: ClipboardItem[]) => {
            if (!data) {
              return;
            }
            this.props.onPaste(data).then(() => {
              event.preventDefault();
              notifyRequestCompleted();
            });
          });
        } else {
          if (event.clipboardData) {
            const data = legacyPaste(event.clipboardData, this.props.formats);
            if (data) {
              this.props.onLegacyPaste(data);
            }
          }
          event.preventDefault();
        }
      },
      keydown: async (event: KeyboardEvent) => {
        if (!this.props.focused() || !this.props.onPaste) {
          return;
        }

        if (isControlKey(event) && event.altKey && event.code === 'KeyV') {
          if (navigator.clipboard?.read) {
            const clipboardData = await navigator.clipboard.read();
            const data = await pasteByKeydown(clipboardData);
            if (data) {
              this.props.onPaste(data, true);
            }
          } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).ketcher?.editor?.errorHandler?.(
              "Your browser doesn't support pasting clipboard content via Ctrl-Alt-V. Please use Google Chrome browser or load SMARTS structure from .smarts file instead.",
            );
          }
        }
      },
    };

    Object.keys(this.listeners).forEach((en) => {
      const eventName = en as keyof ClipAreaListeners;
      if (this.target && this.listeners) {
        this.target.addEventListener(
          eventName,
          this.listeners[eventName] as EventListener,
        );
      }
    });
  }

  shouldComponentUpdate(): boolean {
    return false;
  }

  componentWillUnmount(): void {
    if (!this.listeners || !this.target) return;

    Object.keys(this.listeners).forEach((en) => {
      const eventName = en as keyof ClipAreaListeners;
      if (this.target && this.listeners) {
        this.target.removeEventListener(
          eventName,
          this.listeners[eventName] as EventListener,
        );
      }
    });
  }

  render(): JSX.Element {
    return (
      <textarea
        ref={this.textAreaRef}
        className={clsx(CLIP_AREA_BASE_CLASS, classes.cliparea)}
        data-cliparea
        contentEditable
        autoFocus // eslint-disable-line jsx-a11y/no-autofocus
        suppressContentEditableWarning={true}
      />
    );
  }
}

function isActiveElement(el: HTMLElement): boolean {
  if (el.tagName === 'INPUT' && (el as HTMLInputElement).type === 'button')
    return false;
  return ['INPUT', 'SELECT', 'TEXTAREA', 'OPTION', 'LABEL'].includes(
    el.tagName,
  );
}

function autoselect(cliparea: HTMLTextAreaElement): void {
  cliparea.value = ' ';
  cliparea.select();
}

async function copy(data: ClipboardData): Promise<void> {
  try {
    const clipboardItemData: Record<string, Promise<Blob>> = {};
    Object.keys(data).forEach((mimeType) => {
      // https://developer.chrome.com/blog/web-custom-formats-for-the-async-clipboard-api/#writing-web-custom-formats-to-the-clipboard
      const mimeTypeToSet =
        mimeType === 'text/plain' ? mimeType : `web ${mimeType}`;
      clipboardItemData[mimeTypeToSet] = Promise.resolve(
        new Blob([data[mimeType]], {
          type: mimeTypeToSet,
        }),
      );
    });

    const clipboardItem = new ClipboardItem(clipboardItemData);

    // Chrome: clipboardItem.presentationStyle is undefined
    if (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (clipboardItem as any).presentationStyle &&
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (clipboardItem as any).presentationStyle === 'unspecified'
    ) {
      if (navigator.clipboard.writeText) {
        // Fallback to simple text copy
        const textData = data['text/plain'] || JSON.stringify(data);
        await navigator.clipboard.writeText(textData);
      }
    } else {
      await navigator.clipboard.write([clipboardItem]);
    }
  } catch (e) {
    KetcherLogger.error('cliparea.tsx::copy', e);
    console.info(`Could not write exact type ${JSON.stringify(data)}`);
  }
}

function legacyCopy(clipboardData: DataTransfer, data: ClipboardData): void {
  if (!clipboardData && ieCb) {
    ieCb.setData('text', data['text/plain']);
  } else {
    let curFmt: string | null = null;
    clipboardData.setData('text/plain', data['text/plain']);
    try {
      Object.keys(data).forEach((fmt) => {
        curFmt = fmt;
        clipboardData.setData(fmt, data[fmt]);
      });
    } catch (e) {
      console.error('cliparea.tsx::legacyCopy', e);
      console.info(`Could not write exact type ${curFmt}`);
    }
  }
}

function legacyPaste(cb: DataTransfer, formats: string[]): ClipboardData {
  let data: ClipboardData = { 'text/plain': '' };
  if (!cb && ieCb) {
    data['text/plain'] = ieCb.getData('text');
  } else {
    data['text/plain'] = cb.getData('text/plain');
    data = formats.reduce((res, fmt) => {
      const d = cb.getData(fmt);
      if (d) res[fmt] = d;
      return res;
    }, data);
  }
  return data;
}

async function pasteByKeydown(
  clipboardData: ClipboardItem[],
): Promise<ClipboardData> {
  const data: ClipboardData = { 'text/plain': '' };
  if (!clipboardData && ieCb) {
    data['text/plain'] = ieCb.getData('text');
  } else {
    for (const item of clipboardData) {
      const textPlain = await item.getType('text/plain');
      data['text/plain'] = await textPlain.text();
    }
  }
  return data;
}

export const actions = ['cut', 'copy', 'paste'];

export function exec(action: string): boolean {
  let enabled = document.queryCommandSupported(action);
  if (enabled) {
    try {
      const windowWithClipboardEvent = window as Window & {
        ClipboardEvent?: typeof ClipboardEvent;
      };
      enabled =
        document.execCommand(action) ||
        Boolean(windowWithClipboardEvent.ClipboardEvent) ||
        Boolean(ieCb);
    } catch (e) {
      // FF < 41
      KetcherLogger.error('cliparea.tsx::exec', e);
      enabled = false;
    }
  }
  return enabled;
}

export default ClipArea;
