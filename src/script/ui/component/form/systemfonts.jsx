/****************************************************************************
 * Copyright 2018 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import { h, Component } from 'preact';
import FontFaceObserver from 'font-face-observer';
import Input from './input';

const commonFonts = [
	'Arial',
	'Arial Black',
	'Comic Sans MS',
	'Courier New',
	'Georgia',
	'Impact', 'Charcoal',
	'Lucida Console', 'Monaco',
	'Palatino Linotype', 'Book Antiqua', 'Palatino',
	'Tahoma', 'Geneva',
	'Times New Roman', 'Times',
	'Verdana',
	'Symbol',
	'MS Serif', 'MS Sans Serif', 'New York',
	'Droid Sans', 'Droid Serif', 'Droid Sans Mono', 'Roboto'
];

function checkInSystem() {
	const availableFontsPromises = commonFonts.map((fontName) => {
		const observer = new FontFaceObserver(fontName);
		return observer.check().then(() => fontName, () => null);
	});

	return Promise.all(availableFontsPromises);
}

let cache = null;

class SystemFonts extends Component {
	constructor(props) {
		super(props);
		this.state = { availableFonts: [subfontname(props.value)] };
		this.setAvailableFonts();
	}

	setAvailableFonts() {
		if (cache) {
			this.setState({ availableFonts: cache });
		} else {
			checkInSystem().then((results) => {
				cache = results.filter(i => i !== null);
				this.setState({ availableFonts: cache });
			});
		}
	}

	render() {
		const { ...props } = this.props;

		const desc = {
			enum: [],
			enumNames: []
		};

		this.state.availableFonts.forEach((font) => {
			desc.enum.push(`30px ${font}`);
			desc.enumNames.push(font);
		});

		return desc.enum.length !== 1
			? <Input {...props} schema={desc} />
			: <select><option>{desc.enumNames[0]}</option></select>;
	}
}

function subfontname(name) {
	return name.substring(name.indexOf('px ') + 3);
}

export default SystemFonts;
