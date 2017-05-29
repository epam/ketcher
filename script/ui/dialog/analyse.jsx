import { range } from 'lodash/fp';

import { h } from 'preact';
import { connect } from 'preact-redux';
/** @jsx h */

import keyName from 'w3c-keyname';
import { changeRound } from '../state/analyse';
import Dialog from '../component/dialog';
import Input from '../component/input';

function FrozenInput({value}) {
	return (
		<input type="text" spellcheck="false" value={value}
			   onKeyDown={ev => allowMovement(ev)}/>
	);
}

function FormulaInput({value}) {
	var content = [];
	var regExp = /\b([A-Z][a-z]{0,3})(\d*)\s*\b/g;
	var cnd;
	var pos = 0;
	while (cnd = regExp.exec(value)) {
		content.push(value.substring(pos, cnd.index) + cnd[1]);
		if (cnd[2].length > 0) content.push(<sub>{cnd[2]}</sub>);
		pos = cnd.index + cnd[0].length;
	}
	if (pos == 0) content.push(value);
	else content.push(value.substring(pos, value.length));
	return (
		<div className="chem-input" spellcheck="false" contenteditable="true"
			 onKeyDown={ev => allowMovement(ev)}>{content}</div>
	);
}

function Analyse(props) {
	return (
		<Dialog title="Calculated Values" className="analyse"
				buttons={["Close"]} params={props}>
			<ul>{[
				{name: 'Chemical Formula', key: 'gross'},
				{name: 'Molecular Weight', key: 'molecular-weight', round: 'roundWeight'},
				{name: 'Exact Mass', key: 'monoisotopic-mass', round: 'roundMass'},
				{name: 'Elemental Analysis', key: 'mass-composition'}
			].map(item => (
				<li>
					<label>{item.name}:</label>
					{ item.key === 'gross'
						? <FormulaInput value={ props[item.key] }/>
						: <FrozenInput value={ roundOff(props[item.key], props[item.round]) }/>
					}
					{ item.round
						? <Input schema={{
									 enum: range(0, 8),
									 enumNames: range(0, 8).map(i => `${i} decimal places`)
						  }} value={props[item.round]} onChange={val => props.dispatch(changeRound(item.round, val))}/>
						: null
					}
				</li>
			))
			}</ul>
		</Dialog>
	);
}

function allowMovement(event) {
	const movementKeys = ['Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
	var key = keyName(event);
	if (movementKeys.indexOf(key) === -1)
		event.preventDefault();
}

function roundOff(value, round) {
	if (typeof value === 'number')
		return value.toFixed(round);
	return value.replace(/[0-9]*\.[0-9]+/g, (str) => (
		(+str).toFixed(round)
	));
}

export default connect((store) => {
	return {
		roundWeight: store.form.analyse.roundWeight,
		roundMass: store.form.analyse.roundMass
	};
})(Analyse);
