import { h } from 'preact';
import { connect } from 'preact-redux';
/** @jsx h */

import { form as Form, Field } from '../component/form';
import Dialog from '../component/dialog';

const sgroupSchema = {
	"Fragment": {
		type: "object",
		required: ["type"],
		oneOf: [
			{
				title: "MDLBG_FRAGMENT_STEREO",
				properties: {
					type: { enum: ["DAT"] },
					fieldValue: {
						title: "Field value",
						enum: [
							"abs",
							"(+)-enantiomer",
							"(-)-enantiomer",
							"racemate",
							"steric",
							"rel",
							"R(a)",
							"S(a)",
							"R(p)",
							"S(p)"
						],
						default: "abs"
					},
				},
				required: ["fieldValue", "radiobuttons"]
			},
			{
				title: "MDLBG_FRAGMENT_COEFFICIENT",
				properties: {
					type: { enum: ["DAT"] },
					fieldValue: {
						title: "Field value",
						type: "string",
						default: ""
					}
				},
				required: ["fieldValue", "radiobuttons"]
			},
			{
				title: "MDLBG_FRAGMENT_CHARGE",
				properties: {
					type: { enum: ["DAT"] },
					fieldValue: {
						title: "Field value",
						type: "string",
						default: ""
					}
				},
				required: ["fieldValue", "radiobuttons"]
			},
			{
				title: "MDLBG_FRAGMENT_RADICALS",
				properties: {
					type: { enum: ["DAT"] },
					fieldValue: {
						title: "Field value",
						type: "string",
						default: ""
					}
				},
				required: ["fieldValue", "radiobuttons"]
			},
		]
	},
	"Single Bond": {
		type: "object",
		oneOf: [
			{
				title: "MDLBG_STEREO_KEY",
				properties: {
					type: { enum: ["DAT"] },
					fieldValue: {
						title: "Field value",
						enum: [
							"erythro",
							"threo",
							"alpha",
							"beta",
							"endo",
							"exo",
							"anti",
							"syn",
							"ECL",
							"STG"
						],
						default: "erythro"
					}
				},
				required: ["fieldValue", "radiobuttons"]
			},
			{
				title: "MDLBG_BOND_KEY",
				properties: {
					type: { enum: ["DAT"] },
					fieldValue: {
						title: "Field value",
						enum: [
							"Value=4"
						],
						default: "Value=4"
					}
				},
				required: ["fieldValue", "radiobuttons"]
			}
		]
	},
	"Atom": {
		type: "object",
		oneOf: [
			{
				title: "MDLBG_STEREO_KEY",
				properties: {
					type: { enum: ["DAT"] },
					fieldValue: {
						title: "Field value",
						enum: [
							"RS",
							"SR",
							"P-3",
							"P-3-PI",
							"SP-4",
							"SP-4-PI",
							"T-4",
							"T-4-PI",
							"SP-5",
							"SP-5-PI",
							"TB-5",
							"TB-5-PI",
							"OC-6",
							"TP-6",
							"PB-7",
							"CU-8",
							"SA-8",
							"DD-8",
							"HB-9",
							"TPS-9"
						],
						default: "RS"
					}
				},
				required: ["fieldValue", "radiobuttons"]
			}
		]
	},
	"Group": {
		type: "object",
		oneOf: [
			{
				title: "MDLBG_STEREO_KEY",
				properties: {
					type: { enum: ["DAT"] },
					fieldValue: {
						title: "Field value",
						enum: [
							"cis",
							"trans"
						],
						default: "cis"
					}
				},
				required: ["fieldValue", "radiobuttons"]
			}
		]
	}
};

const radioButtonsSchema = {
	radiobuttons: {
		enum: [
			"Absolute",
			"Relative",
			"Attached"
		],
		default: "Absolute"
	}
};

const fieldNameSchema = {
	fieldName: {
		title: "Field name",
		enum: [
			"MDLBG_FRAGMENT_STEREO",
			"MDLBG_FRAGMENT_COEFFICIENT",
			"MDLBG_FRAGMENT_CHARGE",
			"MDLBG_FRAGMENT_RADICALS",
			"MDLBG_STEREO_KEY",
			"MDLBG_BOND_KEY",
		],
		default: "MDLBG_FRAGMENT_STEREO"
	}
};

const objFirstPropt = obj => Object.keys(obj)[0];
const defaultFieldName = context => objFirstPropt(schemes[context]);
const defaultFieldValue = (context, fieldName) => schemes[context][fieldName].properties.fieldValue.default;

function transformSchema(source) {
	return Object.keys(source)
		.map(schemaTitle => ({
			title: schemaTitle,
			properties: source[schemaTitle].oneOf
				.reduce((acc, item) => {
					acc[item.title] = {
						title: item.title,
						required: item.required,
						properties: Object.assign({}, item.properties, fieldNameSchema, radioButtonsSchema)
					};
					return acc;
				}, {})
		}))
		.reduce((acc, item) => {
				acc[item.title] = item.properties;
				return acc;
			}, {}
		);
}

const schemes = transformSchema(sgroupSchema);

console.info("schemes", schemes);

const SelectOneOf = (props) => {
	const { title, name, schema, ...prop } = props;

	const selectDesc = {
		title: title,
		enum: [],
		enumNames: []
	};

	Object.keys(schema).forEach(item => {
		selectDesc.enum.push(item);
		selectDesc.enumNames.push(schema[item].title || item);
	});

	return <Field name={name} schema={selectDesc} {...prop}/>;
};

function SgroupSpecial(props) {
	const { stateForm, ...prop } = props;
	const context = stateForm.context;
	const fieldName = stateForm.fieldName || defaultFieldName(context);

	return (
		<Form storeName="sgroupSpecial" component={Dialog} title={"S-Group Properties"} className="sgroup"
			  schema={schemes[context][fieldName]} params={prop}
		>
			<SelectOneOf title="Context" name="context" schema={schemes} key={`${context}-context`} />
			<fieldset className={"data"} key={`${context}-${fieldName}-fieldset`}>
				<SelectOneOf title="Field name" name="fieldName" schema={schemes[context]} key={`${context}-${fieldName}-fieldName`} />
				{
					content(context, fieldName)
				}
			</fieldset>
		</Form>
	);
}

const content = (context, fieldName) => Object.keys(schemes[context][fieldName].properties)
	.filter(prop => prop !== "type" && prop !== "context" && prop !== "fieldName")
	.map(prop => prop === "radiobuttons" ?
		<Field name={prop} type="radio" key={`${context}-${fieldName}-${prop}-radio`}/> :
		<Field name={prop} type="textarea" size="10" key={`${context}-${fieldName}-${prop}-select`}/>
	);

export default connect((store) => {
	console.info("store", store.sgroupSpecial);
	return {
		context: store.sgroupSpecial.context,
		stateForm: store.sgroupSpecial.stateForm
	};
})(SgroupSpecial);
