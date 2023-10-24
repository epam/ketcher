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

import { Component, createRef } from 'react';
import clsx from 'clsx';
import classes from './cliparea.module.less';
import { KetcherLogger } from 'ketcher-core';
import { isControlKey } from '../../data/convert/keynorm';

const ieCb = window.clipboardData;

export const CLIP_AREA_BASE_CLASS = 'cliparea';

class ClipArea extends Component {
  constructor(props) {
    super(props);
    this.textAreaRef = createRef();
  }

  componentDidMount() {
    const el = this.textAreaRef.current;
    this.target = this.props.target || el.parentNode;

    this.listeners = {
      mouseup: (event) => {
        if (
          el === event.target ||
          (!isActiveElement(event.target) && this.props.focused())
        ) {
          autoselect(el);
        }
      },
      mousedown: (event) => {
        if (event.shiftKey && !isActiveElement(event.target))
          event.preventDefault();
      },
      copy: (event) => {
        if (this.props.focused() && this.props.onCopy) {
          const data = this.props.onCopy();

          if (data) copy(event.clipboardData, data);

          event.preventDefault();
        }
      },
      cut: (event) => {
        if (this.props.focused() && this.props.onCut) {
          const data = this.props.onCut();

          if (data) copy(event.clipboardData, data);

          event.preventDefault();
        }
      },
      paste: (event) => {
        if (this.props.focused() && this.props.onPaste) {
          const data = paste(event.clipboardData, this.props.formats);

          if (data) this.props.onPaste(data);

          event.preventDefault();
        }
      },
      keydown: async (event) => {
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
            window.ketcher.editor.errorHandler?.(
              "Your browser doesn't support pasting clipboard content via Ctrl-Alt-V. Please use Google Chrome browser or load SMARTS structure from .smarts file instead.",
            );
          }
        }
      },
    };

    Object.keys(this.listeners).forEach((en) => {
      this.target.addEventListener(en, this.listeners[en]);
    });
  }

  shouldComponentUpdate() {
    return false;
  }

  componentWillUnmount() {
    Object.keys(this.listeners).forEach((en) => {
      this.target.removeEventListener(en, this.listeners[en]);
    });
  }

  render() {
    return (
      <textarea
        ref={this.textAreaRef}
        className={clsx(CLIP_AREA_BASE_CLASS, classes.cliparea)}
        contentEditable
        autoFocus // eslint-disable-line jsx-a11y/no-autofocus
        suppressContentEditableWarning={true}
      />
    );
  }
}

function isActiveElement(el) {
  if (el.tagName === 'INPUT' && el.type === 'button') return false;
  return ['INPUT', 'SELECT', 'TEXTAREA', 'OPTION', 'LABEL'].includes(
    el.tagName,
  );
}

function autoselect(cliparea) {
  cliparea.value = ' ';
  cliparea.select();
}

function copy(cb, data) {
  if (!cb && ieCb) {
    ieCb.setData('text', data['text/plain']);
  } else {
    let curFmt = null;
    cb.setData('text/plain', data['text/plain']);
    try {
      Object.keys(data).forEach((fmt) => {
        curFmt = fmt;
        cb.setData(fmt, data[fmt]);
      });
    } catch (e) {
      KetcherLogger.error('cliparea.jsx::copy', e);
      console.info(`Could not write exact type ${curFmt}`);
    }
  }
}

function paste(cb, formats) {
  let data = {};
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

async function pasteByKeydown(clipboardData) {
  const data = {};
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

export function exec(action) {
  let enabled = document.queryCommandSupported(action);
  if (enabled) {
    try {
      enabled = document.execCommand(action) || window.ClipboardEvent || ieCb;
    } catch (e) {
      // FF < 41
      KetcherLogger.error('cliparea.jsx::exec', e);
      enabled = false;
    }
  }
  return enabled;
}

export default ClipArea;
