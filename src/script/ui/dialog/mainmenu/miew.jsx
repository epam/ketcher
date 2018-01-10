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

const MIEW_DEFAULT_OPTIONS = {
	settings: {
		theme: 'light',
		// atomLabel: 'bright', // old option
		autoPreset: false,
		inversePanning: true
	},
	reps: [{
		mode: 'LN',
		colorer: 'AT',
		selector: 'all'
	}]
};

const MIEW_MODES = {
	lines: 'LN',
	ballsAndSticks: 'BS',
	licorice: 'LC'
};

function getOptions(userOpts) {
	const options = MIEW_DEFAULT_OPTIONS;

	options.settings.theme = userOpts.miewTheme;
	options.settings.atomLabel = userOpts.miewAtomLabel;
	options.reps[0].mode = MIEW_MODES[userOpts.miewMode];

	return options;
}

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
			.then(() => this.viewer.setOptions(getOptions(miewOpts)))
			.catch(ex => console.error(ex.message));
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
					<button	disabled onClick={() => true}> {/* TODO: save after update Miew */}
						Apply
					</button>
				]}
			>
				<div
					ref={(el) => { this.miewContainer = el; }}
					className="miew-container"
					style={{ width: '720px', height: '480px', position: 'relative' }}
				/>
			</Dialog>
		);
	}
}

export default connect(
	store => ({
		miewOpts: pick(MIEW_OPTIONS, store.options.settings),
		server: store.options.app.server ? store.server : null,
		struct: store.editor.struct()
	}),
	(dispatch, props) => ({
		onOk: (cmlStruct) => {
			dispatch(load(cmlStruct));
			props.onOk();
		}
	})
)(MiewComponent);
