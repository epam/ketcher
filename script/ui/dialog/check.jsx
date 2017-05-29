import { h } from 'preact';
import { connect } from 'preact-redux';
/** @jsx h */

import Dialog from '../component/dialog';
import Tabs from '../component/tabs';
import { form as Form, Field } from '../component/form';
import { checkErrors } from '../state/check';

const checkSchema = {
	title: 'Check',
	type: 'object',
	properties: {
		checkOptions: {
			type: 'array',
			items: {
				type: "string",
				enum: ['valence', 'radicals', 'pseudoatoms', 'stereo', 'query', 'overlapping_atoms',
					'overlapping_bonds', 'rgroups', 'chiral', '3d'],
				enumNames: ['Valence', 'Radical', 'Pseudoatom', 'Stereochemistry', 'Query', 'Overlapping Atoms',
					'Overlapping Bonds', 'R-Groups', 'Chirality', '3D Structure']
			}
		}
	}
};
function getOptionName(opt) {
	let d = checkSchema.properties.checkOptions.items;
	return d.enumNames[d.enum.indexOf(opt)];
}

function Check(props) {
	const tabs = ['Check', 'Settings'];
	let { result, moleculeErrors, check, ...prop } = props;

	return (
		<Dialog title="Structure Check" className="check"
				result={() => result} params={prop}>
			<Form storeName="check" schema={checkSchema}>
				<Tabs className="tabs" captions={tabs}
					  changeTab={(i) => i === 0 ? checkErrors(props.dispatch, check, result.checkOptions) : null}>
					<ErrorsCheck moleculeErrors={moleculeErrors}/>
					<Field name="checkOptions" multiple={true} type="checkbox"/>
				</Tabs>
			</Form>
		</Dialog>
	);
}

function ErrorsCheck(props) {
	let { moleculeErrors } = props;
	let moleculeErrorsTypes = Object.keys(moleculeErrors);
	return (
		<fieldset {...props}>
			{moleculeErrorsTypes.length === 0 ?
				<dt>No errors found</dt> :
				moleculeErrorsTypes.map(type => (
					<div>
						<dt>{getOptionName(type)} error :</dt>
						<dd>{moleculeErrors[type]}</dd>
					</div>
				))}
		</fieldset>
	);
}

export default connect((store) => {
	return {
		check: store.server.check,
		result: store.form.check.stateForm,
		moleculeErrors: store.form.check.moleculeErrors
	};
})(Check);
