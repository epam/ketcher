import { h, render } from 'preact';
/** @jsx h */

import { settings as settingsSchema } from './settings-options.es';
import { Form, Field } from '../component/form';
import Dialog from '../component/dialog';
import Accordion from '../component/accordion';
import SystemFonts from '../component/systemfonts';

function Settings(props) {
	let tabs = ['Rendering customization options', '3D Viewer'];
	let activeTabs = {'0': true, '1': false};
	return (
		<Form component={Dialog} title="Settings" className="settings-new"
			  schema={settingsSchema} init={props} params={props}>
			<Accordion className="accordion" captions={tabs} active={activeTabs}>
				<fieldset className="render">
					<Field name="showValenceWarnings"/>
					<Field name="atomColoring"/>
					<Field name="hideChiralFlag"/>
					<SelectFont name="font"/>
					<Field name="fontsz"/>
					<Field name="fontszsub"/>
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

export default function dialog(params) {
	var overlay = $$('.overlay')[0];
	return render((
		<Settings {...params}/>
	), overlay);
};
