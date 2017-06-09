import { h, Component } from 'preact';
import { connect } from 'preact-redux';
/** @jsx h */
import { updateFormState } from '../actions/form-action.es';
import { setDefaultSettings, cancelChanges } from '../actions/settings-action.es';

import { settings as settingsSchema } from '../settings-options.es';
import { form as Form, Field } from '../component/form';

import Dialog from '../component/dialog';
import Accordion from '../component/accordion';
import SystemFonts from '../component/systemfonts';
import SaveButton from '../component/savebutton';
import OpenButton from '../component/openbutton';
import MeasureInput from '../component/measure-input';

function Settings(props) {
	let { server, stateForm, valid, onOpenFile, onReset, ...prop } = props;
	const tabs = ['Rendering customization options', 'Atoms', 'Bonds', '3D Viewer', 'Options for debugging'];
	let activeTabs = {'0': true, '1': false, '2': false, '3': false, '4': false};
	return (
		<Dialog title="Settings" className="settings"
				result={() => stateForm} valid={() => valid} params={prop}
				buttons={[
					<OpenButton className="open" server={ server } onLoad={ onOpenFile }>
						Open From File…
					</OpenButton>,
					<SaveButton className="save" data={JSON.stringify(stateForm)} filename={'ketcher-settings'}>
						Save To File…
					</SaveButton>,
					<button onClick={ onReset }>Reset</button>,
					"OK", "Cancel"]} >
			<Form storeName="settings" schema={settingsSchema}>
				<Accordion className="accordion" captions={tabs} active={activeTabs}>
					<fieldset className="render">
						<SelectCheckbox name="resetToSelect"/>
						<SelectCheckbox name="showValenceWarnings"/>
						<SelectCheckbox name="atomColoring"/>
						<SelectCheckbox name="hideChiralFlag"/>
						<Field name="font" component={SystemFonts}/>
						<FieldMeasure name="fontsz"/>
						<FieldMeasure name="fontszsub"/>
					</fieldset>
					<fieldset className="atoms">
						<SelectCheckbox name="carbonExplicitly"/>
						<SelectCheckbox name="showCharge"/>
						<SelectCheckbox name="showValence"/>
						<Field name="showHydrogenLabels"/>
					</fieldset>
					<fieldset className="bonds">
						<SelectCheckbox name="aromaticCircle"/>
						<FieldMeasure name="doubleBondWidth"/>
						<FieldMeasure name="bondThickness"/>
						<FieldMeasure name="stereoBondWidth"/>
					</fieldset>
					<fieldset className="3dView">
						<Field name="miewMode"/>
						<Field name="miewTheme"/>
						<Field name="miewAtomLabel"/>
					</fieldset>
					<fieldset className="debug">
						<SelectCheckbox name="showAtomIds"/>
						<SelectCheckbox name="showBondIds"/>
						<SelectCheckbox name="showHalfBondIds"/>
						<SelectCheckbox name="showLoopIds"/>
					</fieldset>
				</Accordion>
			</Form>
		</Dialog>
	);
}

function SelectCheckbox(props, {schema}) {
	let desc = {
		title: schema.properties[props.name].title,
		enum: [true, false],
		enumNames: ['on', 'off'],
	};
	return <Field schema={desc} {...props}/>;
}

function FieldMeasure(props, {schema}) {
	return <Field schema={schema.properties[props.name]} component={MeasureInput} {...props}/>
}

export default connect(store => ({
	stateForm: store.settings.stateForm,
	valid: store.settings.valid
}), (dispatch, props) => ({
	onOpenFile: newOpts => {
		try {
			dispatch(updateFormState('settings', { stateForm: JSON.parse(newOpts) }));
		} catch (ex) {
			console.info('Bad file');
		}
	},
	onReset: () => dispatch(setDefaultSettings()),
	onCancel: () => {
		dispatch(cancelChanges());
		props.onCancel();
	}
}))(Settings);
