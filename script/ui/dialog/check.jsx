import { h } from 'preact';
import { connect } from 'preact-redux';
/** @jsx h */

import Dialog from '../component/dialog';
import Tabs from '../component/tabs';
import { Form, Field } from '../component/form';
import { check } from '../state/server';

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
	const d = checkSchema.properties.checkOptions.items;
	return d.enumNames[d.enum.indexOf(opt)];
}

function Check(props) {
	const tabs = ['Check', 'Settings'];
	const { formState, onCheck, ...prop } = props;
	const { result, moleculeErrors } = formState;

	return (
		<Dialog title="Structure Check" className="check"
				result={() => result} params={prop}>
			<Form schema={checkSchema} {...formState}>
				<Tabs className="tabs" captions={tabs}
					  changeTab={(i) => i === 0 ? onCheck(result.checkOptions) : null}>
					<ErrorsCheck moleculeErrors={moleculeErrors}/>
					<Field name="checkOptions" multiple={true} type="checkbox"/>
				</Tabs>
			</Form>
		</Dialog>
	);
}

function ErrorsCheck(props) {
	const { moleculeErrors } = props;
	const moleculeErrorsTypes = Object.keys(moleculeErrors);

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

export default connect(
	store => ({	formState: store.modal.form }),
	dispatch => ({
		onCheck: (opts) => dispatch(check(opts))
	})
)(Check);
