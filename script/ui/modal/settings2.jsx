import { h, Component, render } from 'preact';
/** @jsx h */

import { settings as settingsSchema } from './settings-options.es';
import { Form, Field } from '../component/form';
import Dialog from '../component/dialog';
import Accordion from '../component/accordion';
import SystemFonts from '../component/systemfonts';
import SaveButton from '../component/savebutton';
import OpenButton from '../component/openbutton';
import Input from '../component/input';

function Settings(props) {
	let tabs = ['Rendering customization options', '3D Viewer'];
	let activeTabs = {'0': true, '1': false};
	return (
		<Form component={Dialog}
			  buttons={[<OpenOpts server={props.server}/>, <SaveOpts/>, <Reset/>, "OK", "Cancel"]}
			  title="Settings" className="settings-new"
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
				<fieldset className="reaction">
					<Field name="miewMode"/>
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
		onChange(convValue);
	}
	shouldComponentUpdate(nextProp, nextState) {
		return nextState !== this.state;
	}

	render() {
		let { name, ...props } = this.props;
		let { schema, stateStore } = this.context;
		let { value, onChange } = stateStore.field(name);
		let convValue = convertValue(value, 'px', this.state.meas);
		return (
			<label {...props} class="measure-field">
				{schema.properties[name].title}:
				<Input type="number" value={convValue}
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
