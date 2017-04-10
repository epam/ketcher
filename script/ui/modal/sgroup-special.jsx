import { h } from 'preact';
import { connect } from 'preact-redux';
/** @jsx h */

import { form as Form, Field } from '../component/form';
import Dialog from '../component/dialog';

const sgroupSchema = {
	title: 'S-Group Properties',
	type: 'object',
	required: ["type"],
	oneOf: [
		{
			title: 'Fragment',
			type: 'object',
			required: ["type"],
			oneOf: [
				{
					title: 'MDLBG_FRAGMENT_STEREO',
					key: 'FRG_STR',
					properties: {
						type: { enum: ['DAT'] },
						fieldValue: {
							title: 'Field value',
							enum: [
								'abs',
								'(+)-enantiomer',
								'(-)-enantiomer',
								'racemate',
								'steric',
								'rel',
								'R(a)',
								'S(a)',
								'R(p)',
								'S(p)'
							],
							default: 'abs'
						},
						radiobuttons: {
							enum: [
								'Absolute',
								'Relative',
								'Attached'
							],
							default: 'Absolute'
						}
					},
					required: ['fieldValue', 'radiobuttons']
				},
				{
					title: 'MDLBG_FRAGMENT_COEFFICIENT',
					key: 'FRG_COEFF',
					properties: {
						type: { enum: ['DAT'] },
						fieldValue: {
							title: 'Field value',
							type: 'string',
							default: ''
						},
						radiobuttons: {
							enum: [
								'Absolute',
								'Relative',
								'Attached'
							],
							default: 'Absolute'
						}
					},
					required: ['fieldValue', 'radiobuttons']
				},
				{
					title: 'MDLBG_FRAGMENT_CHARGE',
					key: 'FRG_CHRG',
					properties: {
						type: { enum: ['DAT'] },
						fieldValue: {
							title: 'Field value',
							type: 'string',
							default: ''
						},
						radiobuttons: {
							enum: [
								'Absolute',
								'Relative',
								'Attached'
							],
							default: 'Absolute'
						}
					},
					required: ['fieldValue', 'radiobuttons']
				},
				{
					title: 'MDLBG_FRAGMENT_RADICALS',
					key: 'FRG_RAD',
					properties: {
						type: { enum: ['DAT'] },
						fieldValue: {
							title: 'Field value',
							type: 'string',
							default: ''
						},
						radiobuttons: {
							enum: [
								'Absolute',
								'Relative',
								'Attached'
							],
							default: 'Absolute'
						}
					},
					required: ['fieldValue', 'radiobuttons']
				},
			]
		},
		{
			title: 'Single Bond',
			type: 'object',
			oneOf: [
				{
					title: 'MDLBG_STEREO_KEY',
					key: 'SB_STR',
					properties: {
						type: { enum: ['DAT'] },
						fieldValue: {
							title: 'Field value',
							enum: [
								'erythro',
								'threo',
								'alpha',
								'beta',
								'endo',
								'exo',
								'anti',
								'syn',
								'ECL',
								'STG'
							],
							default: 'erythro'
						},
						radiobuttons: {
							enum: [
								'Absolute',
								'Relative',
								'Attached'
							],
							default: 'Absolute'
						}
					},
					required: ['fieldValue', 'radiobuttons']
				},
				{
					title: 'MDLBG_BOND_KEY',
					key: 'SB_BND',
					properties: {
						type: { enum: ['DAT'] },
						fieldValue: {
							title: 'Field value',
							enum: [
								'Value=4'
							],
							default: 'Value=4'
						},
						radiobuttons: {
							enum: [
								'Absolute',
								'Relative',
								'Attached'
							],
							default: 'Absolute'
						}
					},
					required: ['fieldValue', 'radiobuttons']
				}
			]
		},
		{
			title: 'Atom',
			type: 'object',
			oneOf: [
				{
					title: 'MDLBG_STEREO_KEY',
					key: 'AT_STR',
					properties: {
						type: { enum: ['DAT'] },
						fieldValue: {
							title: 'Field value',
							enum: [
								'RS',
								'SR',
								'P-3',
								'P-3-PI',
								'SP-4',
								'SP-4-PI',
								'T-4',
								'T-4-PI',
								'SP-5',
								'SP-5-PI',
								'TB-5',
								'TB-5-PI',
								'OC-6',
								'TP-6',
								'PB-7',
								'CU-8',
								'SA-8',
								'DD-8',
								'HB-9',
								'TPS-9'
							],
							default: 'RS'
						},
						radiobuttons: {
							enum: [
								'Absolute',
								'Relative',
								'Attached'
							],
							default: 'Absolute'
						}
					},
					required: ['fieldValue', 'radiobuttons']
				}
			]
		},
		{
			title: 'Group',
			type: 'object',
			oneOf: [
				{
					title: 'MDLBG_STEREO_KEY',
					key: 'GRP_STR',
					properties: {
						type: { enum: ['DAT'] },
						fieldValue: {
							title: 'Field value',
							enum: [
								'cis',
								'trans'
							],
							default: 'cis'
						},
						radiobuttons: {
							enum: [
								'Absolute',
								'Relative',
								'Attached'
							],
							default: 'Absolute'
						}
					},
					required: ['fieldValue', 'radiobuttons']
				}
			]
		}
	]
};

const contextSchema = {
	title: 'Context',
	enum: [
		'Fragment',
		'Single Bond',
		'Atom',
		'Group'
	],
	default: 'Fragment'
};

const fieldNameSchema = {
	title: 'Field name',
	enum: [
		'MDLBG_FRAGMENT_STEREO',
		'MDLBG_FRAGMENT_COEFFICIENT',
		'MDLBG_FRAGMENT_CHARGE',
		'MDLBG_FRAGMENT_RADICALS',
		'MDLBG_STEREO_KEY',
		'MDLBG_BOND_KEY',
	],
	default: 'MDLBG_FRAGMENT_STEREO'
};

function transformSchema(source) {
	const injectSchemes = (dest, schemes) => {
		schemes.forEach(schema => {
			dest.properties[schema.title] = schema.schema
		});

		return dest;
	};

	return source.oneOf
		.map(schema => ({
			title: schema.title,
			properties: schema.oneOf.reduce((acc, item) => {
				acc[item.title] = injectSchemes(item, [
						{ title: 'context', schema: contextSchema },
						{ title: 'fieldName', schema: fieldNameSchema }
					]
				);
				return acc;
			}, {})
		}))
		.reduce((acc, item) => {
				acc[item.title] = item.properties;
				return acc;
			}, {}
		);
}

function toEnumSchema(title, schema) {
	return Object.keys(schema).reduce((acc, propt) => {
			acc.enum.push(propt);
			acc.enumNames.push(schema[propt].title || propt);
			return acc;
		},
		{
			title: title,
			type: 'string',
			enum: [],
			enumNames: []
		}
	);
}

const objFirstPropKey = obj => Object.keys(obj)[0];
const defaultContext = () => objFirstPropKey(schemes);
const defaultFieldName = context => objFirstPropKey(schemes[context]);
const defaultFieldValue = (context, fieldName) => schemes[context][fieldName].properties.fieldValue.default;

const schemes = transformSchema(sgroupSchema);

const SelectContext = (props, { stateStore }) => {
	const { name, context, ...prop } = props;
	const selectDesc = toEnumSchema('Context', schemes);

	const onChange = context => {
		const data = {
			context
		};

		data.fieldName = defaultFieldName(context);
		data.fieldValue = defaultFieldValue(context, data.fieldName);

		stateStore.forceUpdateFormState(data);
	};

	return <Field schema={selectDesc} key={`context-${context}-select`} {...stateStore.field(name, onChange)} {...prop}/>;
};

const SelectOneOf = (props, { stateStore }) => {
	const { name, context, ...prop } = props;
	const selectDesc = toEnumSchema('Field name', schemes[context]);

    const onChange = fieldName => {
    	const data = {
    		context,
			fieldName
		};

    	data.fieldValue = defaultFieldValue(context, fieldName);

		stateStore.forceUpdateFormState(data);
	};

	return <Field schema={selectDesc} key={`${context}-fn`} {...stateStore.field(name, onChange)} {...prop}/>;
};

function SgroupSpecial(props) {
	const { stateForm, ...prop } = props;
	const context = stateForm.context || defaultContext();
	const fieldName = stateForm.fieldName || defaultFieldName(context);

	return (
		<Form storeName='sgroupSpecial' component={Dialog} title={'S-Group Properties'} className='sgroup'
			  schema={schemes[context][fieldName]} init={prop} params={prop}
		>
			<SelectContext key={`${context}-context`} name='context' context={context}/>
			<fieldset className={'data'} key={`${context}-${fieldName}-fieldset`}>
				<SelectOneOf key={`${context}-${fieldName}-fieldName`} name={`fieldName`} context={context}/>
				{
					content(context, fieldName)
				}
			</fieldset>
		</Form>
	);
}

const content = (context, fieldName) => Object.keys(schemes[context][fieldName].properties)
	.filter(prop => prop !== 'type' && prop !== 'context' && prop !== 'fieldName')
	.map(prop => prop === 'radiobuttons' ?
		<Field name={prop} type='radio' key={`${context}-${fieldName}-${prop}-radio`}/> :
		<Field name={prop} type='textarea' size='10' key={`${context}-${fieldName}-${prop}-select`}/>
	);

export default connect((store) => {
	return {
		stateForm: store.sgroupSpecial.stateForm
	};
})(SgroupSpecial);
