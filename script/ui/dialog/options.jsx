import { h } from 'preact';
import { connect } from 'preact-redux';
/** @jsx h */
import { updateFormState, setDefaultSettings } from '../state/form';
import { saveSettings } from '../state/options';

import { settings as settingsSchema } from '../data/options-schema';
import { Form, Field } from '../component/form';

import Dialog from '../component/dialog';
import Accordion from '../component/accordion';
import SystemFonts from '../component/systemfonts';
import SaveButton from '../component/savebutton';
import OpenButton from '../component/openbutton';
import MeasureInput from '../component/measure-input';

function Settings(props) {
	let { server, stateForm, valid, errors, onOpenFile, onReset, ...prop } = props;
	let formProps = { stateForm, errors };
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
			<Form storeName="settings" schema={settingsSchema} {...formProps}>
				<Accordion className="accordion" captions={tabs} active={activeTabs}>
					<fieldset className="render">
						<SelectCheckbox name="resetToSelect"/>
						<Field name="rotationStep"/>
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
	stateForm: store.modal.form.stateForm,
	valid: store.modal.form.valid,
	errors: store.modal.form.errors,
}), (dispatch, props) => ({
	onOpenFile: newOpts => {
		try {
			dispatch(updateFormState({ stateForm: JSON.parse(newOpts) }));
		} catch (ex) {
			console.info('Bad file');
		}
	},
	onReset: () => dispatch(setDefaultSettings()),
	onOk: (res) => {
		dispatch(saveSettings(res));
		props.onOk(res);
	}
}))(Settings);
