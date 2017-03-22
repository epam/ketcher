import { h, render } from 'preact';
/** @jsx h */

import { atom as atomSchema } from '../structschema';
import { Form, DialogForm, Field } from '../component/form';
import Dialog from '../component/dialog';

import element from '../../chem/element';

function ElementNumber(props, {stateStore}) {
	let {state} = stateStore;
	return (
		<label>Number:
		  <input className="number" type="text"
				 readonly="readonly"
				 value={element.map[state.label] || ''}/>
		</label>
	);
}

function Atom(props) {
	return (
		<Form component={Dialog} title="Atom Properties" className="atom-props"
			  schema={atomSchema} customValid={{ label: l => l.startsWith('B') }} init={props} params={props}>
		  <fieldset className="main">
			<Field name="label"/>
			<Field name="alias"/>
			<ElementNumber/>
			<Field name="charge" maxlength="5"/>
			<Field name="explicitValence"/>
			<Field name="isotope"/>
			<Field name="radical"/>
		  </fieldset>
		  <fieldset className="query">
			<legend>Query specific</legend>
			<Field name="ringBondCount"/>
			<Field name="hCount"/>
			<Field name="substitutionCount"/>
			<Field name="unsaturatedAtom"/>
		  </fieldset>
		  <fieldset className="reaction">
			<legend>Reaction flags</legend>
			<Field name="invRet"/>
			<Field name="exactChangeFlag"/>
		  </fieldset>
		</Form>
	);
}

export default function dialog(params) {
	var overlay = $$('.overlay')[0];
	return render((
		<Atom {...params}/>
	), overlay);
};
