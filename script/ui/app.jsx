import { Provider, connect } from 'preact-redux';

import state from './reducers/state';

import { h, Component, render } from 'preact';
/** @jsx h */
import Toolbar from './toolbar';
import StructEditor from './component/structeditor';

const AppEditor = connect(
	(state, props) => ({
		tool: state.tool
	}),
	(dispatch, props) => ({
		onInit: function (editor) {
			console.info('init');
			global._ui_editor = editor;
			dispatch({ type: 'UPDATE', data: { editor }});
		}
	})
)(StructEditor);

function App() {
	return (
		<main role="application">
		  <AppEditor id="canvas"/>
		  <Toolbar/>
		</main>
	)
};

function init(el, options, server) {
	var store = state(options, server);
	return render((
		<Provider store={store}>
		  <App/>
		</Provider>
	), el);
}

export default init;
