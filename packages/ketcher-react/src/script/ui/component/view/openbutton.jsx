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

import { Component } from 'react';
import clsx from 'clsx';

import { fileOpener } from '../../utils';
import classes from './buttons.module.less';

class OpenButton extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    if (props.server) {
      fileOpener(props.server).then((opener) => {
        this.setState({ opener });
      });
    }
  }

  open(ev) {
    const files = ev.target.files;
    const noop = () => null;
    const { onLoad = noop, onError = noop } = this.props;

    if (this.state.opener && files.length)
      this.state.opener(files[0]).then(onLoad, onError);
    else if (files.length) onLoad(files[0]);
    ev.target.value = null;
    ev.preventDefault();
  }

  render() {
    const {
      children,
      type,
      /* eslint-disable @typescript-eslint/no-unused-vars */
      server,
      /* eslint-enable @typescript-eslint/no-unused-vars */
      className,
      ...props
    } = this.props;

    return (
      <button
        onClick={() => this.btn.click()}
        className={clsx(classes.openButton, className)}
        {...props}
      >
        <input
          onChange={(ev) => this.open(ev)}
          accept={type}
          type="file"
          ref={(el) => {
            this.btn = el;
          }}
        />
        {children}
      </button>
    );
  }
}

export default OpenButton;
