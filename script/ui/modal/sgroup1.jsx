import { h, render } from 'preact';
/** @jsx h */

import { sgroup as sgroupSchema } from '../structschema';
import { Form, Field, mapOf, selectListOf } from '../component/form';
import Dialog from '../component/dialog';

const schemes = mapOf(sgroupSchema, 'type');

function SelectOneOf(props, { stateStore }) {
	let desc = {
		title: 'Type',
		enum: [],
		enumNames: []
	};
	Object.keys(schemes).forEach((item) => {
		desc.enum.push(item);
		desc.enumNames.push(schemes[item].title);
	});
	const changeSchema = type => stateStore.changeSchema(schemes[type]);
	return <Field schema={desc}
				  {...stateStore.field(props.name, { onChange: changeSchema })}
				  {...props}/>;
}

function Sgroup (props) {
	let type = props.type || 'GEN';
	let desc = schemes[type];

	const content = Object.keys(desc.properties).map(prop =>
		 prop !== 'type' ? <Field name={prop}/> : null
 	);

	return (
		<Form component={Dialog} title="S-Group Properties" className="sgroup"
			  schema={desc} init={props} params={props}>
			<SelectOneOf name="type" />
			{ content }
		</Form>
	);
}

export default function dialog(params) {
	var overlay = $$('.overlay')[0];
	return render((
		<Sgroup {...params}/>
	), overlay);
};
