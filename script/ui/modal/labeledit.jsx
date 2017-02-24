import { h, Component, render } from 'preact';
/** @jsx h */

import element from '../../chem/element';
import generics from '../../chem/generics';

import Dialog from '../component/dialog';

function serialize(lc) {
	var charge = Math.abs(lc.charge);
	var radical = ['', ':', '.', '^^'][lc.radical] || '';
	var sign = '';
	if (charge)
		sign = lc.charge < 0 ? '-' : '+';
	return (lc.isotope || '') + lc.label + radical +
		   (charge > 1 ? charge: '') + sign;
}

function deserialize(value) {
	var match = value.match(/^(\d+)?([a-z*]{1,3})(\.|:|\^\^)?(\d+[-+]|[-+])?$/i); // TODO: radical on last place
	if (match) {
		console.info('match', match);
		var label = match[2] == '*' ? 'A' : match[2][0].toUpperCase()+match[2].slice(1).toLowerCase();
		var charge = 0;
		var isotope = 0;
		var radical = 0;
		if (match[1])
			isotope = parseInt(match[1]);
		if (match[3])
			radical = { ':': 1, '.': 2, '^^': 3 }[match[3]];
		if (match[4]) {
			charge = parseInt(match[4]);
			if (isNaN(charge)) // NaN => [-+]
				charge = 1;
			if (match[4].endsWith('-'))
				charge = -charge;
		}
		// Not consistant
		if (label == 'A' || label == 'Q' || label == 'X' || label == 'M' || element.map[label])
			return { label, charge, isotope, radical };
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
				<input type="text" maxlength="20" size="10"
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
