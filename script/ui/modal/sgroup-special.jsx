import { h } from 'preact';
import { connect } from 'preact-redux';
/** @jsx h */

import { form as Form, Field, SelectOneOf } from '../component/form';
import Dialog from '../component/dialog';
import { sgroupSpecial as schemes } from '../structschema.es'

function SgroupSpecial(props) {
	const { stateForm, ...prop } = props;
	const context = stateForm.context;
	const fieldName = stateForm.fieldName;

	return (
		<Form storeName="sgroupSpecial" component={Dialog} title={"S-Group Properties"} className="sgroup"
			  schema={schemes[context][fieldName]} params={prop}
		>
			<SelectOneOf title="Context" name="context"
						 schema={schemes} key={`${context}-context`}
			/>
			<fieldset className={"data"} key={`${context}-${fieldName}-fieldset`}>
				<SelectOneOf title="Field name" name="fieldName"
							 schema={schemes[context]} key={`${context}-${fieldName}-fieldName`}/>
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
	return {
		stateForm: store.sgroupSpecial.stateForm
	};
})(SgroupSpecial);
