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

import classes from './combobox.module.less';

class ComboBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      suggestsHidden: true,
    };

    this.click = this.click.bind(this);
    this.blur = this.blur.bind(this);
    this.updateInput = this.updateInput.bind(this);
  }

  updateInput(event) {
    const value = event.target.value || event.target.textContent;
    this.setState({ suggestsHidden: true });
    this.props.onChange(value);
  }

  click() {
    this.setState({ suggestsHidden: false });
  }

  blur() {
    this.setState({ suggestsHidden: true });
  }

  render() {
    const { value, type = 'text', schema } = this.props;
    const suggestList = schema.enumNames
      .filter((item) => item !== value)
      .map((item) => (
        <li key={item} onMouseDown={this.updateInput}>
          {item}
        </li>
      ));
    const suggestListStyles = {
      display: this.state.suggestsHidden ? 'none' : 'block',
    };
    return (
      <div>
        <input
          type={type}
          value={value}
          onClick={this.click}
          onBlur={this.blur}
          onChange={this.updateInput}
          autoComplete="off"
        />
        {suggestList.length !== 0 ? (
          <ul className={classes.suggestList} style={suggestListStyles}>
            {suggestList}
          </ul>
        ) : (
          ''
        )}
      </div>
    );
  }
}

export default ComboBox;
