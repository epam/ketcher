import { h, Component, render } from 'preact';
/** @jsx h */

import Dialog from '../component/dialog';

function SelectRound({value, onChange}) {
	return (
		<select value={value} onChange={ev => onChange(ev.target.value)}>
		  {
			  range(8).map(i => (
				  <option value={i}>{i + ' decimal places'}</option>
			  ))
		  }
		</select>
	);
}

function FrozenInput({value}) {
	return (
		<input type="text" spellcheck="false" value={value}
			   onKeydown={ev => filterKeyCode(ev, [9, 37, 39, 36, 35])} />
		// tab, left, right, home, end codes
	);
}

class Analyse extends Component {
	constructor() {
		super();
		this.state = {
			roundWeight: 3,
			roundMass: 3
		};
	}

	changeRound(name, value) {
		let newState = {};
		newState[name] = +value;
		this.setState(newState);
	}

	render (props, state) {
		return (
			<Dialog caption="Calculated Values"
					name="analyse" params={this.props}
					buttons={["Close"]}>
				<ul>{[
					{ name: 'Chemical Formula', key: 'gross' },
					{ name: 'Molecular Weight', key: 'molecular-weight', round: 'roundWeight' },
					{ name: 'Exact Mass', key: 'monoisotopic-mass', round: 'roundMass' },
					{ name: 'Elemental Analysis', key: 'mass-composition' }
				].map(item => (
					<li>
					  <label>{item.name}:</label>
					  <FrozenInput
						value={ item.round ? roundOff(props[item.key], state[item.round]) : props[item.key] } />
					  { item.round ? (
						  <SelectRound value={state[item.round]} onChange={val => this.changeRound(item.round, val)}/>
					  ) : null}
					</li>
				))
			}</ul>
			</Dialog>
		);
	}
}

function filterKeyCode(event, allowed) {
	if (allowed.indexOf(event.keyCode) == -1)
		event.preventDefault();
}

function roundOff(value, round) {
	if (typeof value == 'number')
		return value.toFixed(round);
	return value.replace(/[0-9]*\.[0-9]+/g, (str) => (
		(+str).toFixed(round)
	));
}

function range(n, start=0) {
	// not so widely known hack
	return Array.apply(null, { length: n }).map((_, i) => i + start);
}

export default function dialog(params) {
	var overlay = $$('.overlay')[0];
	return render((
		<Analyse {...params}/>
	), overlay);
};
