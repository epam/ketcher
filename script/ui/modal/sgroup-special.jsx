import { h, Component, render } from 'preact';
/** @jsx h */

import { Form, Field } from '../component/form';
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
					properties: {
						type: { enum: ['DAT'] },
						fieldValue: {
							title: 'Field value',
							type: 'string',
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
							type: 'string',
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
					properties: {
						type: { enum: ['DAT'] },
						fieldValue: {
							title: 'Field value',
							type: 'string',
							enum: [''],
							default: ''
						},
						radiobuttons: {
							type: 'string',
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
					properties: {
						type: { enum: ['DAT'] },
						fieldValue: {
							title: 'Field value',
							type: 'string',
							enum: [''],
							default: ''
						},
						radiobuttons: {
							type: 'string',
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
					properties: {
						type: { enum: ['DAT'] },
						fieldValue: {
							title: 'Field value',
							type: 'string',
							enum: [''],
							default: ''
						},
						radiobuttons: {
							type: 'string',
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
					properties: {
						type: { enum: ['DAT'] },
						fieldValue: {
							title: 'Field value',
							type: 'string',
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
							type: 'string',
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
					properties: {
						type: { enum: ['DAT'] },
						fieldValue: {
							title: 'Field value',
							type: 'string',
							enum: [
								'Value=4'
							],
							default: 'Value=4'
						},
						radiobuttons: {
							type: 'string',
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
					properties: {
						type: { enum: ['DAT'] },
						fieldValue: {
							title: 'Field value',
							type: 'string',
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
							type: 'string',
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
					properties: {
						type: { enum: ['DAT'] },
						fieldValue: {
							title: 'Field value',
							type: 'string',
							enum: [
								'cis',
								'trans'
							],
							default: 'cis'
						},
						radiobuttons: {
							type: 'string',
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
	type: 'string',
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
	type: 'string',
	enum: [
		'MDLBG_FRAGMENT_STEREO',
		'MDLBG_FRAGMENT_COEFFICIENT',
		'MDLBG_FRAGMENT_CHARGE',
		'MDLBG_FRAGMENT_RADICALS',
		'MDLBG_STEREO_KEY',
		'MDLBG_BOND_KEY'
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
	const { name, onChange, ...prop } = props;
	const selectDesc = toEnumSchema('Context', schemes);

	const changeSchema = context => {
		const defaultField = defaultFieldName(context);
		onChange(context);
		stateStore.pushState('fieldName', defaultField);
		stateStore.pushState('fieldValue', defaultFieldValue(context, defaultField));
		stateStore.changeSchema(schemes[context]);
	};

	return <Field name={name} schema={selectDesc} key='context-value'
				  {...stateStore.field(name, changeSchema)} {...prop}/>;
};

const SelectOneOf = (props, { stateStore }) => {
	const { name, context, onChange, ...prop } = props;
	const selectDesc = toEnumSchema('Field name', schemes[context]);

	const changeSchema = fieldName => {
		onChange(fieldName);
		stateStore.pushState('fieldValue', defaultFieldValue(context, fieldName));
		stateStore.changeSchema(schemes[context][fieldName]);
	};

	return <Field name={name} schema={selectDesc} key={`${context}-fn`}
				  {...stateStore.field(name, changeSchema)} {...prop}/>;
};

class SgroupSpecial extends Component {
	constructor(props) {
		super(props);

		this.state = {};
		this.state.context = props.context || defaultContext();
		this.state.fieldName = props.fieldName || defaultFieldName(this.state.context);
	}

	content = (context, fieldName) => Object.keys(schemes[context][fieldName].properties)
		.filter(prop => prop !== 'type' && prop !== 'context' && prop !== 'fieldName')
		.map(prop => prop === 'radiobuttons' ?
			<Field name={prop} type='radio' key={`${context}-${fieldName}-${prop}-radio`}/> :
			<Field name={prop} size='10' key={`${context}-${fieldName}-${prop}-select`}/>);

	componentDidMount() {
		document.querySelector("select[name='context']").value = this.state.context;
		document.querySelector("select[name='fieldName']").value = this.state.fieldName;
	}

	render(props) {
		const { context, fieldName } = this.state;
		const desc = schemes[context][fieldName];

		return (
			<Form component={Dialog} title={'S-Group Properties'} className='sgroup'
				  schema={desc} init={props} params={props}
			>
				<SelectContext key={`${context}-context`}
							   name='context'
							   onChange={context => this.setState({
								   context: context,
								   fieldName: defaultFieldName(context)
							   })}
				/>
				<fieldset className={'data'} key={`${context}-${fieldName}-fieldset`}>
					<SelectOneOf key={`${context}-${fieldName}-fieldName`}
								 name={`fieldName`}
								 context={context}
								 onChange={fieldName => this.setState({
									 fieldName: fieldName
								 })}
					/>
					{
						this.content(context, fieldName)
					}
				</fieldset>
			</Form>
		);
	}
}

function dialog(params) {
	const overlay = $$('.overlay')[0];
	return render((
		<SgroupSpecial {...params}/>
	), overlay);
}

module.exports = {
	sgroupSpecialDialog: dialog
};
