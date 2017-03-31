import { h, Component, render } from 'preact';
/** @jsx h */

import { settings as settingsSchema } from '../settings-options.es';
import { Form, Field } from '../component/form';
import Dialog from '../component/dialog';
import Accordion from '../component/accordion';
import SystemFonts from '../component/systemfonts';
import SaveButton from '../component/savebutton';
import OpenButton from '../component/openbutton';
import Input from '../component/input';

function Settings(props) {
	let tabs = ['Rendering customization options', 'Atoms', 'Bonds', '3D Viewer', 'Options for debugging'];
	let activeTabs = {'0': true, '1': false, '2': false, '3': false, '4': false};
	return (
		<Form component={Dialog}
			  buttons={[<OpenOpts server={props.server}/>, <SaveOpts/>, <Reset/>, "OK", "Cancel"]}
			  title="Settings" className="settings"
			  schema={settingsSchema} init={props} params={props}>
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
		this.isUpdate = true;
	}
	handleChange(value, onChange) {
		let convValue = convertValue(value, this.state.meas, 'px');
		onChange(convValue);
		this.isUpdate = false;
	}
	shouldComponentUpdate() {
		if (this.isUpdate) return true;
		this.isUpdate = true;
		return false;
	}

	render() {
		let { name, ...props } = this.props;
		let { schema, stateStore } = this.context;
		let { value, onChange } = stateStore.field(name);
		let convValue = convertValue(value, 'px', this.state.meas);
		return (
			<label {...props} className="measure-field">
				{schema.properties[name].title}:
				<Input type="number" value={convValue} focus={false}
					   onChange={(v) => this.handleChange(v, onChange)} />
				<Input schema={{enum: ['cm', 'px', 'pt', 'inch']}}
					   value={this.state.meas} onChange={(m) => this.setState({meas: m})}/>
			</label>
		);
	}
}

const SaveOpts = (props, {stateStore}) =>
	<SaveButton className="save" data={JSON.stringify(stateStore.state)} filename={'ketcher-settings'}>
		Save To File…
	</SaveButton>;

const OpenOpts = (props, {stateStore}) =>
	<OpenButton className="open" server={props.server}
				onLoad={ newOpts => {
					try {
						stateStore.setState(JSON.parse(newOpts));
					} catch (ex) {
						console.info('Bad file');
					}
				} }>
		Open From File…
	</OpenButton>;

const Reset = (props, {stateStore}) =>
	<button onClick={() => stateStore.setState(defaultOpts())}>
		Reset
	</button>;

function defaultOpts() {
	return Object.keys(settingsSchema.properties).reduce((res, prop) => {
		res[prop] = settingsSchema.properties[prop].default;
		return res;
	}, {});
}

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

export default function dialog(params) {
	var overlay = $$('.overlay')[0];
	return render((
		<Settings {...params}/>
	), overlay);
};
