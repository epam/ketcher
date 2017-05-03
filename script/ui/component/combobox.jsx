import { h, Component } from 'preact';
/** @jsx h */

class ComboBox extends Component {
	constructor(props) {
		super(props);
		this.state = { suggestsHidden: true };

		this.click = this.click.bind(this);
		this.blur = this.blur.bind(this);
		this.updateInput = this.updateInput.bind(this);
		this.val = this.val.bind(this);
	}

	updateInput(event) {
		this.setState({ suggestsHidden: true });
		const value = this.val(event, this.props.schema);
		this.props.onChange(value);
	}

	click(event) {
		if (event.detail !== 0) // difference between real click on input and click after value updated
			this.setState({ suggestsHidden: false });
	}

	blur() {
		this.setState({ suggestsHidden: true });
	}

	val(event, schema) {
		const input = event.target;
		const value = input.value || input.textContent;

		const isNumber = (input.type == 'number' || input.type == 'range') ||
			(schema && (schema.type == 'number' || schema.type == 'integer'));
		return (isNumber && !isNaN(value - 0)) ? value - 0 : value;
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
					suggestList.length != 0 ?
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
