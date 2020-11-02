/****************************************************************************
 * Copyright 2018 EPAM Systems
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

import { h, Component } from 'preact';

class ComboBox extends Component {
	constructor(props) {
		super(props);
		this.state = {
			suggestsHidden: true
		};

		this.click = this.click.bind(this);
		this.blur = this.blur.bind(this);
		this.updateInput = this.updateInput.bind(this);
	}

	updateInput(event) {
		const value = (event.target.value || event.target.textContent);
		this.setState({ suggestsHidden: true });
		this.props.onChange(value);
	}

	click() {
		this.setState({ suggestsHidden: false });
	}

	blur() {
		this.setState({ suggestsHidden: true });
	}

	render(props) {
		const { value, type = 'text', schema } = props;

		const suggestList = schema.enumNames
			.filter(item => item !== value)
			.map(item => <li onMouseDown={this.updateInput}>{item}</li>);

		return (
			<div>
				<input
					type={type}
					value={value}
					onClick={this.click}
					onBlur={this.blur}
					onInput={this.updateInput}
					autoComplete="off"
				/>
				{
					suggestList.length !== 0 ?
						(
							<ui
								className="suggestList"
								style={`display: ${this.state.suggestsHidden ? 'none' : 'block'}`}
							>
								{
									suggestList
								}
							</ui>
						) : ''
				}
			</div>
		);
	}
}

export default ComboBox;
