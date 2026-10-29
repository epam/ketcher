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
  type ButtonHTMLAttributes,
  type ChangeEvent,
  type PropsWithChildren,
  Component,
} from 'react';
import clsx from 'clsx';

import { fileOpener } from '../../utils';
import classes from './buttons.module.less';
import type { FileContent, OpenerFunction } from './openButton.types';

type OpenButtonOwnProperties = {
  server?: unknown;
  type?: string;
  className?: string;
  onLoad?: (content: File | FileContent) => void;
  onError?: (error: Error) => void;
};

type OpenButtonProperties = PropsWithChildren<
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof OpenButtonOwnProperties> &
    OpenButtonOwnProperties
>;

type OpenButtonState = {
  opener?: OpenerFunction;
};

class OpenButton extends Component<OpenButtonProperties, OpenButtonState> {
  private btn: HTMLInputElement | null = null;
  private isMounted = false;
  private initOpenerRequestId = 0;

  constructor(properties: OpenButtonProperties) {
    super(properties);
    this.state = {};
  }

  componentDidMount() {
    this.isMounted = true;
    this.initOpener(this.props.server);
  }

  componentDidUpdate(previousProperties: OpenButtonProperties) {
    if (previousProperties.server !== this.props.server) {
      this.initOpener(this.props.server);
    }
  }

  componentWillUnmount() {
    this.isMounted = false;
  }

  initOpener(server?: unknown) {
    const requestId = ++this.initOpenerRequestId;
    if (server) {
      fileOpener(server).then((opener: OpenerFunction) => {
        if (!this.isMounted || requestId !== this.initOpenerRequestId) return;
        this.setState({ opener });
      });
    } else {
      this.setState({ opener: undefined });
    }
  }

  open(event_: ChangeEvent<HTMLInputElement>) {
    const files = event_.target.files;
    const noop = () => null;
    const { onLoad = noop, onError = noop } = this.props;

    if (this.state.opener && files?.length) {
      this.state.opener(files[0]).then(onLoad, onError);
    } else if (files?.length) {
      onLoad(files[0]);
    }
    event_.target.value = '';
    event_.preventDefault();
  }

  render() {
    const {
      children,
      type,
      onLoad: _onLoad,
      onError: _onError,
      className,
      ...buttonProperties
    } = this.props;

    return (
      <button
        onClick={() => this.btn?.click()}
        className={clsx(classes.openButton, className)}
        {...buttonProperties}
      >
        <input
          onChange={(event_) => this.open(event_)}
          accept={type}
          type="file"
          ref={(element) => {
            this.btn = element;
          }}
        />
        {children}
      </button>
    );
  }
}

export default OpenButton;
