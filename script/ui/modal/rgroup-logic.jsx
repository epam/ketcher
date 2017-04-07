import { h, render } from 'preact';
/** @jsx h */

import { rgroup as rgroupSchema } from '../structschema';
import { form as Form, Field } from '../component/form';
import Dialog from '../component/dialog';
import Input from '../component/input';

function IfThenSelect(props, {schema, stateStore}) {
	let { name, rgids } = props;
	let title = schema.properties[name].title;
	let desc = {
		enum: [0],
		enumNames: ['Always']
	};

	rgids.forEach((label) => {
		if (props.label !== label) {
			desc.enum.push(label);
			desc.enumNames.push(`IF R${props.label} THEN R${label}`);
		}
	});

	return (
		<label {...props}>
			{title}:
			<Input name={name} schema={desc} {...stateStore.field(name)} />
		</label>
	);
}

function RgroupLogic (props) {
	let { label, rgroupLabels } = props;
	return (
		<Form storeName="rgroup-logic" component={Dialog} title="R-Group Logic" className="rgroup-logic"
			  schema={rgroupSchema} customValid={{ range: r => rangeConv(r) }} init={props} params={props}>
			<Field name="range"/>
			<Field name="resth"/>
			<IfThenSelect name="ifthen" className="cond"  label={label} rgids={rgroupLabels}/>
		</Form>
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

export default RgroupLogic;
