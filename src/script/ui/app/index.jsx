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

import { h, Component, render } from 'preact';
import { Provider, connect } from 'preact-redux';

import { AppCliparea, AppHidden } from './hidden';
import AppEditor from './editor';
import AppModal from './modal';
import Toolbar from './toolbar';

import createStore, { onAction, load } from '../state';
import { checkServer } from '../state/server';
import { initKeydownListener } from '../state/hotkeys';
import { initResize } from '../state/toolbar';

const App = connect(
	null,
	{ onAction, checkServer }
)(class extends Component { // eslint-disable-line
	componentDidMount() {
		this.props.checkServer();
	}
	render = props => (
		<main role="application">
			<AppHidden />
			<AppEditor id="canvas" />
			<Toolbar {...props} />
			<AppCliparea />
			<AppModal />
		</main>
	)
});

function init(el, options, server) {
	const store = createStore(options, server);
	store.dispatch(initKeydownListener(el));
	store.dispatch(initResize());

	render((
		<Provider store={store}>
			<App />
		</Provider>
	), el);

	return {
		load: (structStr, opts) => store.dispatch(load(structStr, opts))
	};
}

export default init;
