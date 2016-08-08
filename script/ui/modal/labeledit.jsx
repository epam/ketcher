import { h, Component, render } from 'preact';
/** @jsx h */

import element from '../../chem/element';
import generics from '../../chem/generics';

import Dialog from './dialog';

function serialize(lc) {
	if (!lc.charge)
		return lc.label;
	var sign = lc.charge < 0 ? '-' : '+';
	var charge = Math.abs(lc.charge);
	return lc.label + (charge > 1 ? charge: '') + sign;
}

function deserialize(value) {
	var match = value.match(/^([a-z*]{1,3})(\d[-+]|[-+]\d|[-+])?$/i);
	if (match) {
		var label = match[1] == '*' ? 'A' : match[1].capitalize();
		var charge = 0;
		if (match[2]) {
			charge = parseInt(match[2]);
			if (isNaN(charge)) // NaN => [-+]
				charge = 1;
			if (match[2].endsWith('-'))
				charge = -charge;
		}
		// Not consistant
		if (label == 'A' || label == 'Q' || label == 'X' || label == 'M' || element.getElementByLabel(label) != null)
			return { label, charge };
	}
	return null;
}

class LabelEdit extends Component {
	constructor({params}) {
		super();
		this.state = {
			input: params.letter || serialize(params)
		};
    }
	result() {
		return deserialize(this.state.input);
	}
	type(value) {
		this.setState({
			input: value
		});
	}
	render (props) {
		return (
			<Dialog caption="" name="labeledit" params={props.params}
					result={() => this.result()}>
				<input type="text" maxlength="5" size="4"
					   onInput={ev => this.type(ev.target.value)}
					   value={this.state.input}
					/>
			</Dialog>
		);
	}
}

export default function dialog(params) {
	var overlay = $$('.overlay')[0];
	return render((
		<LabelEdit params={params}/>
	), overlay);
};
