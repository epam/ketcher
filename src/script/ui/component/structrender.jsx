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

import { h, Component } from 'preact';

import Struct from '../../chem/struct';
import molfile from '../../chem/molfile';
import Render from '../../render';

function renderStruct(el, struct, options = {}) {
	if (el) {
		if (struct.prerender) { // Should it sit here?
			el.innerHTML = struct.prerender;
		} else {
			console.info('render!', el.clientWidth, el.clientWidth);
			const rnd = new Render(el, {
				autoScale: true,
				...options
			});
			rnd.setMolecule(struct);
			rnd.update();
			// console.info('render!');//, el.innerHTML);
			// struct.prerender = el.innerHTML;
		}
	}
}

class StructRender extends Component {
	constructor(props) {
		super(props);
		if (!(props.struct instanceof Struct)) {
			try {
				this.props.struct = molfile.parse(props.struct);
			} catch (e) {
				alert('Could not parse structure\n' + e.message); // eslint-disable-line no-undef
				this.props.struct = null;
			}
		}
	}

	shouldComponentUpdate() {
		return false;
	}

	componentDidMount() {
		const el = this.base;
		const { struct, options } = this.props;
		renderStruct(el, struct, options);
	}

	render() {
		const { struct, Tag = 'div', ...props } = this.props;
		return (
			<Tag /* ref="el" */ {...props}>{ struct ? null : 'No molecule' }</Tag>
		);
	}
}

export default StructRender;
