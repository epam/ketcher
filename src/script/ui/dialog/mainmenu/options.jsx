/****************************************************************************
 * Copyright 2018 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import { h } from 'preact';
import { connect } from 'preact-redux';
import { updateFormState, setDefaultSettings } from '../../state/modal/form';
import { saveSettings } from '../../state/options';

import settingsSchema from '../../data/schema/options-schema';
import { storage } from '../../storage-ext';

import Form, { Field } from '../../component/form/form';
import Dialog from '../../component/dialog';
import Accordion from '../../component/view/accordion';
import SaveButton from '../../component/view/savebutton';
import OpenButton from '../../component/view/openbutton';

import MeasureInput from '../../component/form/measure-input';
import SystemFonts from '../../component/form/systemfonts';
import SelectCheckbox from '../../component/form/select-checkbox';

function Settings(props) {
	const { initState, formState, server, onOpenFile, onReset, appOpts, ...prop } = props;
	const tabs = ['Rendering customization options', 'Atoms', 'Bonds', 'Server', '3D Viewer', 'Options for debugging'];

	return (
		<Dialog
			title="Settings"
			className="settings"
			result={() => formState.result}
			valid={() => formState.valid}
			params={prop}
			buttons={[
				<OpenButton server={server} onLoad={onOpenFile}>
						Open From File…
				</OpenButton>,
				<SaveButton data={JSON.stringify(formState.result)} filename="ketcher-settings">
						Save To File…
				</SaveButton>,
				<button onClick={onReset}>Reset</button>,
				'Cancel', 'OK'
			]}
		>
			<Form schema={settingsSchema} init={initState} {...formState}>
				<Accordion className="accordion" multiple={false} captions={tabs} active={[0]}>
					<fieldset className="render">
						<Field name="resetToSelect" />
						<Field name="rotationStep" />
						<Field name="showValenceWarnings" component={SelectCheckbox} />
						<Field name="atomColoring" component={SelectCheckbox} />
						<Field name="hideChiralFlag" component={SelectCheckbox} />
						<Field name="font" component={SystemFonts} />
						<Field name="fontsz" component={MeasureInput} />
						<Field name="fontszsub" component={MeasureInput} />
					</fieldset>
					<fieldset className="atoms">
						<Field name="carbonExplicitly" component={SelectCheckbox} />
						<Field name="showCharge" component={SelectCheckbox} />
						<Field name="showValence" component={SelectCheckbox} />
						<Field name="showHydrogenLabels" component={SelectCheckbox} />
					</fieldset>
					<fieldset className="bonds">
						<Field name="aromaticCircle" component={SelectCheckbox} />
						<Field name="doubleBondWidth" component={MeasureInput} />
						<Field name="bondThickness" component={MeasureInput} />
						<Field name="stereoBondWidth" component={MeasureInput} />
					</fieldset>
					<fieldset className="server" disabled={!appOpts.server}>
						<Field name="smart-layout" component={SelectCheckbox} />
						<Field name="ignore-stereochemistry-errors" component={SelectCheckbox} />
						<Field name="mass-skip-error-on-pseudoatoms" component={SelectCheckbox} />
						<Field name="gross-formula-add-rsites" component={SelectCheckbox} />
						<Field name="gross-formula-add-isotopes" component={SelectCheckbox} />
					</fieldset>
					<fieldset className="miew" disabled={!window.Miew}>
						<Field name="miewMode" />
						<Field name="miewTheme" />
						<Field name="miewAtomLabel" />
					</fieldset>
					<fieldset className="debug">
						<Field name="showAtomIds" component={SelectCheckbox} />
						<Field name="showBondIds" component={SelectCheckbox} />
						<Field name="showHalfBondIds" component={SelectCheckbox} />
						<Field name="showLoopIds" component={SelectCheckbox} />
					</fieldset>
				</Accordion>
				{ !storage.isAvailable() ? <div className="warning">{storage.warningMessage}</div> : null }
			</Form>
		</Dialog>
	);
}

export default connect(store => ({
	server: store.options.app.server ? store.server : null,
	appOpts: store.options.app,
	initState: store.options.settings,
	formState: store.modal.form
}), (dispatch, props) => ({
	onOpenFile: (newOpts) => {
		try {
			dispatch(updateFormState({ result: JSON.parse(newOpts) }));
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
