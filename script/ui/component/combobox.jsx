/****************************************************************************
 * Copyright (C) 2017 EPAM Systems
 *
 * This file is part of the Ketcher
 * The contents are covered by the terms of the BSD 3-Clause license
 * which is included in the file LICENSE.md, found at the root
 * of the Ketcher source tree.
 ***************************************************************************/

import { h, Component } from 'preact';
/** @jsx h */

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
				<input type={type} value={value} onClick={this.click}
					   onBlur={this.blur} onInput={this.updateInput} autocomplete="off"
				/>
				{
					suggestList.length !== 0 ?
						(
							<ui className='suggestList'
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
