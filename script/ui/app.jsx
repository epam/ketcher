/****************************************************************************
 * Copyright 2017 EPAM Systems
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

import { Provider, connect } from 'preact-redux';
import { omit } from 'lodash/fp';

import state, { onAction, load } from './state';
import { initTmplLib } from './state/templates';
import { initEditor } from './state/editor';
import { checkServer } from './state/server';
import { initKeydownListener, initClipboard } from './state/hotkeys';
import { initResize } from './state/toolbar';

import { h, Component, render } from 'preact';
/** @jsx h */
import Toolbar from './toolbar';
import StructEditor from './component/structeditor';
import ClipArea from './component/cliparea';

import modals from './dialog';

const AppEditor = connect(
	state => ({
		options: state.options.settings
	}),
	dispatch => dispatch(initEditor)
)(StructEditor);

const AppModal = connect(
	state => ({
		modal: state.modal
	}),
	dispatch => ({
		onOk: function (res) {
			console.info('Output:', res);
			dispatch({ type: 'MODAL_CLOSE' });
		},
		onCancel: function () {
			dispatch({ type: 'MODAL_CLOSE' });
		}
	}),
	(stateProps, dispatchProps) => {
		let prop = stateProps.modal && stateProps.modal.prop;
		let initProps = prop ? omit(['onResult', 'onCancel'], prop) : {};
		return {
			modal: stateProps.modal,
			...initProps,
			onOk: function (res) {
				if (prop && prop.onResult) prop.onResult(res);
				dispatchProps.onOk(res);
			},
			onCancel: function () {
				if (prop && prop.onCancel) prop.onCancel();
				dispatchProps.onCancel();
			}
		};
	}
)(({modal, ...props}) => {
	if (!modal)
		return null;

	let Modal = modals[modal.name];

	if (!Modal)
		throw new Error(`There is no modal window named ${modal.name}`);

	return (
		<div className="overlay">
			<Modal {...props}/>
		</div>
	);
});

const AppTemplates = connect(
	null,
	dispatch => ({
		onInitTmpls: (cacheEl) => initTmplLib(dispatch, '', cacheEl)
	})
)(class extends Component {
	componentDidMount() {
		this.props.onInitTmpls(this.cacheEl);
	}
	render = () => (<div className="cellar" ref={c => this.cacheEl = c} />)
});

const AppCliparea = connect(
	null,
	dispatch => (dispatch(initClipboard))
)(ClipArea);

const App = connect(
	null,
	{ onAction, checkServer }
)(class extends Component {
	componentDidMount() {
		this.props.checkServer();
	}
	render = props => (
		<main role="application">
			<AppEditor id="canvas" />
			<Toolbar {...props}/>
			<AppCliparea/>
			<AppModal/>
			<AppTemplates/>
		</main>
	)
});

function init(el, options, server) {
	const store = state(options, server);
	store.dispatch(initKeydownListener(el));
	store.dispatch(initResize());

	render((
		<Provider store={store}>
		  <App/>
		</Provider>
	), el);

	return {
		load: (structStr, options) => store.dispatch(load(structStr, options))
	}
}

export default init;
