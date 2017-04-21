import { h } from 'preact';
import { connect } from 'preact-redux';
/** @jsx h */

import { form as Form, Field, SelectOneOf, mapOf } from '../component/form';
import Dialog from '../component/dialog';
import { sgroupSpecial as sgroupSchema } from '../structschema.es'

const schemes = Object.keys(sgroupSchema).reduce((acc, title) => {
	acc[title] = mapOf(sgroupSchema[title], 'fieldName');
	return acc;
}, {});

function SgroupSpecial(props) {
	const { stateForm, valid, ...prop } = props;
	const context = stateForm.context;
	const fieldName = stateForm.fieldName;

	return (
		<Dialog title={"S-Group Properties"} className="sgroup"
				result={() => stateForm} valid={() => valid} params={prop}>
			<Form storeName="sgroupSpecial" schema={schemes[context][fieldName]} init={prop}>
				<SelectOneOf title="Context" name="context" schema={schemes}/>
				<fieldset className={"data"}>
					<SelectOneOf title="Field name" name="fieldName" schema={schemes[context]}/>
					{
						content(context, fieldName)
					}
				</fieldset>
			</Form>
		</Dialog>
	);
}

const content = (context, fieldName) => Object.keys(schemes[context][fieldName].properties)
	.filter(prop => prop !== "type" && prop !== "context" && prop !== "fieldName")
	.map(prop => prop === "radiobuttons" ?
		<Field name={prop} type="radio" key={`${context}-${fieldName}-${prop}-radio`}/> :
		<Field name={prop} type="textarea" size="10" key={`${context}-${fieldName}-${prop}-select`}/>
	);

export default connect((store) => {
	return {
		stateForm: store.sgroupSpecial.stateForm,
		valid: store.sgroupSpecial.valid,
	};
})(SgroupSpecial);
