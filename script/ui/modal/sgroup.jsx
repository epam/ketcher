import { h } from 'preact';
import { connect } from 'preact-redux';
/** @jsx h */

import { sgroup as sgroupSchema } from '../structschema.es';
import { form as Form, Field, SelectOneOf, mapOf } from '../component/form';
import Dialog from '../component/dialog';

const schemes = mapOf(sgroupSchema, 'type');

function Sgroup(props) {
	const { stateForm, valid, ...prop } = props;
	const type = stateForm.type;

	return (
		<Dialog title="S-Group Properties" className="sgroup"
				result={() => stateForm} valid={() => valid} params={prop}>
			<Form storeName="sgroup" schema={schemes[type]} init={prop} params={prop}>
				<SelectOneOf title="Type" name="type" schema={schemes}/>
				<fieldset class={type === 'DAT' ? 'data' : 'base'}>
					{ content(type) }
				</fieldset>
			</Form>
		</Dialog>
	);
}

const content = type => Object.keys(schemes[type].properties)
	.filter(prop => prop !== 'type')
	.map(prop => {
			let props = {};
			if (prop === 'name') props.maxlength = 15;
			if (prop === 'fieldName') props.maxlength = 30;
			if (prop === 'fieldValue') props.type = 'textarea';
			if (prop === 'radiobuttons') props.type = 'radio';

			return <Field name={prop} key={`${type}-${prop}`} {...props}/>;
		}
	);

export default connect((store) => {
	return {
		stateForm: store.sgroup.stateForm,
		valid: store.sgroup.valid
	};
})(Sgroup);
