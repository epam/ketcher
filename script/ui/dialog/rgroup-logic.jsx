import { h } from 'preact';
import { connect } from 'preact-redux';
/** @jsx h */

import { rgroup as rgroupSchema } from '../structschema';
import { Form, Field } from '../component/form';
import Dialog from '../component/dialog';

function IfThenSelect(props, { schema }) {
	let { name, rgids } = props;
	let desc = {
		title: schema.properties[name].title,
		enum: [0],
		enumNames: ['Always']
	};

	rgids.forEach((label) => {
		if (props.label !== label) {
			desc.enum.push(label);
			desc.enumNames.push(`IF R${props.label} THEN R${label}`);
		}
	});

	return <Field name={name} schema={desc} {...props}/>;
}

function RgroupLogic (props) {
	let { stateForm, valid, errors, label, rgroupLabels, ...prop } = props;
	let formProps = { stateForm, errors };
	return (
		<Dialog title="R-Group Logic" className="rgroup-logic"
				result={() => stateForm} valid={() => valid} params={prop}>
			<Form storeName="rgroup-logic" schema={rgroupSchema}
				  customValid={{range: r => rangeConv(r)}} init={props} {...formProps}>
				<Field name="range"/>
				<Field name="resth"/>
				<IfThenSelect name="ifthen" className="cond" label={label} rgids={rgroupLabels}/>
			</Form>
		</Dialog>
	);
}

function rangeConv(range) { // structConv
	let res = range.replace(/\s*/g, '').replace(/,+/g, ',')
		.replace(/^,/, '').replace(/,$/, '');
	return res.split(',').all(function (s) {
		return s.match(/^[>,<,=]?[0-9]+$/g) ||
			s.match(/^[0-9]+\-[0-9]+$/g);
	});
}

export default connect((store) => ({
		stateForm: store.modal.form.stateForm,
		valid: store.modal.form.valid,
		errors: store.modal.form.errors
	})
)(RgroupLogic);
