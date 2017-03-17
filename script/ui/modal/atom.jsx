import { h, render } from 'preact';
/** @jsx h */

import { atom as atomSchema } from '../structschema';
import { Form, DialogForm, Input } from '../component/form';
import Dialog from '../component/dialog';

function Atom(props) {
	return (
		<Form component={Dialog} title="Atom Properties" className="atom-props"
			  schema={atomSchema} init={props} params={props}>
		  <fieldset className="main">
			<Input prop="label"/>
			<Input prop="alias"/>
			<label>Number:
			  <input className="number" type="text"
					 readonly="readonly"/>
			</label>
			<Input prop="charge" maxlength="4"/>
			<Input prop="explicitValence"/>
			<Input prop="isotope"/>
			<Input prop="radical"/>
		  </fieldset>
		  <fieldset className="query">
			<legend>Query specific</legend>
			<Input prop="ringBondCount"/>
			<Input prop="hCount"/>
			<Input prop="substitutionCount"/>
			<Input prop="unsaturatedAtom"/>
		  </fieldset>
		  <fieldset className="reaction">
			<legend>Reaction flags</legend>
			<Input prop="invRet"/>
			<Input prop="exactChangeFlag"/>
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
