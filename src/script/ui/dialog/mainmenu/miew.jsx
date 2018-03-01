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
import { connect } from 'preact-redux';
import { pick } from 'lodash/fp';

import Dialog from '../../component/dialog';
import * as structFormat from '../../data/convert/structformat';
import { MIEW_OPTIONS } from '../../data/schema/options-schema';
import { load } from '../../state';

/* OPTIONS for MIEW */
const BACKGROUND_COLOR = {
	dark: '0x202020',
	light: '0xcccccc'
};

const MIEW_DEFAULT_OPTIONS = {
	settings: {
		theme: 'light',
		autoPreset: false,
		inversePanning: true
	},
	reps: [{
		mode: 'LN'
	}, {
		colorer: 'EL',
		selector: 'not elem C',
		mode: ['TX', {
			bg: BACKGROUND_COLOR['light'],
			showBg: true,
			template: '{{elem}}'
		}]
	}]
};

function mergeOptions(userOpts) {
	const options = MIEW_DEFAULT_OPTIONS;

	options.settings.theme = userOpts.miewTheme;
	options.reps[0].mode = userOpts.miewMode;

	// TODO: userOpts.miewAtomLabel transform to 'TX' mode settings
	// options.settings.atomLabel = userOpts.miewAtomLabel;
	options.reps[1].mode[1].bg = BACKGROUND_COLOR[userOpts.miewTheme];

	return options;
}
/* ---------------- */

class MiewComponent extends Component {
	componentDidMount() {
		const { struct, server, miewOpts } = this.props;
		const Miew = window.Miew;

		this.viewer = new Miew({
			container: this.miewContainer
		});

		if (this.viewer.init())
			this.viewer.run();

		structFormat.toString(struct, 'cml', server)
			.then(res => this.viewer.load(res, { sourceType: 'immediate', fileType: 'cml' }))
			.then(() => this.viewer.setOptions(miewOpts))
			.catch(ex => console.error(ex.message));
	}

	exportCML() {
		const cmlStruct = this.viewer.exportCML();
		this.props.onExportCML(cmlStruct);
	}

	render() {
		const { miewOpts, server, struct, ...prop } = this.props;

		return (
			<Dialog
				title="Miew"
				className="miew"
				params={prop}
				buttons={[
					'Close',
					<button	onClick={() => this.exportCML()}>
						Apply
					</button>
				]}
			>
				<div
					ref={(el) => { this.miewContainer = el; }}
					className="miew-container"
					style={{ width: '1024px', height: '600px', position: 'relative' }}
				/>
			</Dialog>
		);
	}
}

export default connect(
	store => ({
		miewOpts: mergeOptions(pick(MIEW_OPTIONS, store.options.settings)),
		server: store.options.app.server ? store.server : null,
		struct: store.editor.struct()
	}),
	(dispatch, props) => ({
		onExportCML: (cmlStruct) => {
			dispatch(load(cmlStruct));
			props.onOk();
		}
	})
)(MiewComponent);
