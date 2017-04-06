import { h, Component } from 'preact';
import { connect } from 'preact-redux';
/** @jsx h */
import { updateFormState } from '../actions/form-action.es';
import { setDefaultSettings } from '../actions/settings-action.es';

import { settings as settingsSchema } from '../settings-options.es';
import { form as Form, Field } from '../component/form';
import Dialog from '../component/dialog';
import Accordion from '../component/accordion';
import SystemFonts from '../component/systemfonts';
import SaveButton from '../component/savebutton';
import OpenButton from '../component/openbutton';
import Input from '../component/input';

function Settings(props) {
	let { server, stateForm, dispatch, ...prop } = props;
	let tabs = ['Rendering customization options', 'Atoms', 'Bonds', '3D Viewer', 'Options for debugging'];
	let activeTabs = {'0': true, '1': false, '2': false, '3': false, '4': false};
	return (
		<Form storeName="settings" component={Dialog} title="Settings" className="settings"
			  buttons={[
				  <OpenOpts server={server} dispatch={dispatch}/>,
				  <SaveOpts opts={stateForm}/>,
				  <Reset dispatch={dispatch}/>,
				  "OK", "Cancel"]}
			  schema={settingsSchema} params={prop}>
			<Accordion className="accordion" captions={tabs} active={activeTabs}>
				<fieldset className="render">
					<Field name="showValenceWarnings"/>
					<Field name="atomColoring"/>
					<Field name="hideChiralFlag"/>
					<SelectFont name="font"/>
					<FieldMeasure name="fontsz"/>
					<FieldMeasure name="fontszsub"/>
				</fieldset>
				<fieldset className="atoms">
					<Field name="carbonExplicitly"/>
					<Field name="showCharge"/>
					<Field name="showValence"/>
					<Field name="showHydrogenLabels"/>
				</fieldset>
				<fieldset className="bonds">
					<Field name="aromaticCircle"/>
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
					<Field name="showAtomIds"/>
					<Field name="showBondIds"/>
					<Field name="showHalfBondIds"/>
					<Field name="showLoopIds"/>
				</fieldset>
			</Accordion>
		</Form>
	);
}

function SelectFont(props, {schema, stateStore}) {
	let {name} = props;
	let title = schema.properties[name].title;
	return (
		<label>
			{title}:<SystemFonts {...stateStore.field(name)} />
		</label>
	);
}

class FieldMeasure extends Component {
	constructor(props) {
		super(props);
		this.state = { meas: 'px' };
	}
	handleChange(value, onChange) {
		let convValue = convertValue(value, this.state.meas, 'px');
		this.state.cust = value;
		onChange(convValue);
	}
	render() {
		let { meas, cust } = this.state;
		let { name, ...props } = this.props;
		let { schema, stateStore } = this.context;
		let { value, onChange } = stateStore.field(name);
		let convValue = (!cust || value === schema.properties[name].default)
			? convertValue(value, 'px', meas)
			: cust;
		return (
			<label {...props} className="measure-field">
				{schema.properties[name].title}:
				<Input schema={schema.properties[name]} value={convValue} focus={false}
					   step={meas === 'px' || meas === 'pt' ? '1' : '0.001'}
					   onChange={(v) => this.handleChange(v, onChange)} />
				<Input schema={{enum: ['cm', 'px', 'pt', 'inch']}}
					   value={meas}
					   onChange={(m) => this.setState({ meas: m, cust: convertValue(cust, 'px', m)})}/>
			</label>
		);
	}
}

const SaveOpts = ({opts}) =>
	<SaveButton className="save" data={JSON.stringify(opts)} filename={'ketcher-settings'}>
		Save To File…
	</SaveButton>;

const OpenOpts = ({server, dispatch}) =>
	<OpenButton className="open" server={server}
				onLoad={ newOpts => {
					try {
						dispatch(updateFormState('settings', JSON.parse(newOpts)));
					} catch (ex) {
						console.info('Bad file');
					}
				} }>
		Open From File…
	</OpenButton>;

const Reset = ({dispatch}) =>
	<button onClick={() => dispatch(setDefaultSettings())}>
		Reset
	</button>;

function convertValue(value, measureFrom, measureTo) {
	if (!value) return null;
	var measureMap = {
		'px': 1,
		'cm': 37.795278,
		'pt': 1.333333,
		'inch': 96,
	};
	return (measureTo === 'px' || measureTo === 'pt')
		? (value * measureMap[measureFrom] / measureMap[measureTo]).toFixed( ) - 0
		: (value * measureMap[measureFrom] / measureMap[measureTo]).toFixed(3) - 0;
}

export default connect((store) => {
	return {
		stateForm: store.settings.stateForm
	};
})(Settings);
