import { h, Component, render } from 'preact';
/** @jsx h */

import { Form, Field, mapOf } from '../component/form';
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
						type: { enum: ["STR"] },
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
						buttons: {
							title: 'Buttons',
							type: 'string',
							enum: [
								'Absolute',
								'Relative',
								'Attached'
							],
							default: 'Absolute'
						}
					},
					required: ['fieldValue']
				},
				{
					title: 'MDLBG_FRAGMENT_COEFFICIENT',
					properties: {
						type: { enum: ["COEF"] },
						fieldValue: {
							title: 'Field value',
							type: 'string',
							enum: [],
							default: ''
						},
						buttons: {
							title: 'Buttons',
							type: 'string',
							enum: [
								'Absolute',
								'Relative',
								'Attached'
							],
							default: 'Absolute'
						}
					},
					required: ['fieldValue']
				},
				{
					title: 'MDLBG_FRAGMENT_CHARGE',
					properties: {
						type: { enum: ["CHRG"] },
						fieldValue: {
							title: 'Field value',
							type: 'string',
							enum: [],
							default: ''
						},
						buttons: {
							title: 'Buttons',
							type: 'string',
							enum: [
								'Absolute',
								'Relative',
								'Attached'
							],
							default: 'Absolute'
						}
					},
					required: ['fieldValue']
				},
				{
					title: 'MDLBG_FRAGMENT_RADICALS',
					properties: {
						type: { enum: ["RAD"] },
						fieldValue: {
							title: 'Field value',
							type: 'string',
							enum: [],
							default: ''
						},
						buttons: {
							title: 'Buttons',
							type: 'string',
							enum: [
								'Absolute',
								'Relative',
								'Attached'
							],
							default: 'Absolute'
						}
					},
					required: ['fieldValue']
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
						type: { enum: ["STRKEY"] },
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
						buttons: {
							title: 'Buttons',
							type: 'string',
							enum: [
								'Absolute',
								'Relative',
								'Attached'
							],
							default: 'Absolute'
						}
					},
					required: ['fieldValue']
				},
				{
					title: 'MDLBG_BOND_KEY',
					properties: {
						type: { enum: ["BNDKEY"] },
						fieldValue: {
							title: 'Field value',
							type: 'string',
							enum: [
								'Value=4'
							],
							default: 'Value=4'
						},
						buttons: {
							title: 'Buttons',
							type: 'string',
							enum: [
								'Absolute',
								'Relative',
								'Attached'
							],
							default: 'Absolute'
						}
					},
					required: ['fieldValue']
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
						type: { enum: ["STRKEY"] },
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
								'TB-5-PI',
								'TP-6',
								'PB-7',
								'CU-8',
								'SA-8',
								'DD-8',
								'HB-9',
								'TPS-9',
								'HB-9'
							],
							default: 'RS'
						},
						buttons: {
							title: 'Buttons',
							type: 'string',
							enum: [
								'Absolute',
								'Relative',
								'Attached'
							],
							default: 'Absolute'
						}
					},
					required: ['fieldValue']
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
						type: { enum: ["STRKEY"] },
						fieldValue: {
							title: 'Field value',
							type: 'string',
							enum: [
								'cis',
								'trans'
							],
							default: 'cis'
						},
						buttons: {
							title: 'Buttons',
							type: 'string',
							enum: [
								'Absolute',
								'Relative',
								'Attached'
							],
							default: 'Absolute'
						}
					},
					required: ['fieldValue']
				}
			]
		}
	]
};

const schemes = sgroupSchema.oneOf
	.map(schema => ({
		title: schema.title,
		properties: mapOf(schema, 'type')
	}))
	.reduce((acc, item) => {
			acc[item.title] = item.properties;
			return acc;
		}, {}
	);

console.info('schemes', schemes);

const defaultContext = 'Fragment';

function toEnumSchema(title, schema) {
	return Object.keys(schema).reduce((acc, propt) => {
			acc.enum.push(propt);
			acc.enumNames.push(schema[propt].title);
			return acc;
		},
		{
			title: title,
			enum: [],
			enumNames: []
		}
	);
}

const SelectContext = (props, { stateStore }) => {
	const { onChange, ...prop } = props;
	const name = 'context';
	const selectDesc = toEnumSchema('Context', schemes);

	const changeSchema = type => {
		onChange(type);
		stateStore.changeSchema(schemes[type]);
	};

	return <Field name={name} schema={selectDesc}
				  {...stateStore.field(name, changeSchema)} {...prop}/>;
};

const SelectOneOf = (props, { stateStore }) => {
	const { context, onChange, ...prop } = props;
	const name = 'fieldName';
	const selectDesc = toEnumSchema('Field name', schemes[context]);

	return <Field name='fieldName' schema={selectDesc}
				  {...stateStore.field(name, onChange)} {...prop}/>;
};

const objFirstPropKey = obj => Object.keys(obj)[0];

class SgroupSpecial extends Component {
	constructor(props) {
		super(props);

		this.state = {
			context: defaultContext,
			fieldName: objFirstPropKey(schemes[defaultContext])
		};
	}

	content = (context, fieldName) => Object.keys(schemes[context][fieldName].properties)
		.filter(prop => prop !== 'type')
		.map(prop => prop === 'buttons' ?
			<Field name={prop} className='pos' type='radio' key={`${context}-${fieldName}-${prop}`}/> :
			<Field name={prop} size={10} key={`${context}-${fieldName}-${prop}`}/>);

	render(props) {
		const { context, fieldName } = this.state;
		const desc = schemes[context][fieldName];

		const initState = {
			context: context,
			fieldName: fieldName
		};

		return (
			<Form component={Dialog} title={'S-Group Properties'} className='sgroup'
				  schema={desc} init={initState} params={props}
			>
				<SelectContext
					onChange={context => this.setState({
						context: context,
						fieldName: objFirstPropKey(schemes[context])
					})}
				/>
				<fieldset key={`${context}-${fieldName}-data`} className={'data'}>
					<SelectOneOf
						context={context}
						onChange={field => this.setState({ fieldName: field })}
					/>
					{
						this.content(context, fieldName)
					}
				</fieldset>
			</Form>
		)
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
