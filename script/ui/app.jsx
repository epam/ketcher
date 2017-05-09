import { Provider, connect } from 'preact-redux';

import state from './reducers/state';

import { h, Component, render } from 'preact';
/** @jsx h */
import Toolbar from './toolbar';
import StructEditor from './component/structeditor';

const AppEditor = connect(
	(state) => ({
		tool: state.active.tool,
		toolOpts: state.active.opts
	}),
	(dispatch, props) => ({
		onInit: function (editor) {
			console.info('init');
			global._ui_editor = editor;
			dispatch({ type: 'UPDATE', data: { editor }});
		}
	})
)(StructEditor);

const App = connect(
	null,
	dispatch => ({
		onAction: function (action) {
			console.info('action', action);
			dispatch({ type: 'UPDATE',
					   data: { active: action }});
		}
	})
)(props => (
   <main role="application">
   <AppEditor id="canvas"/>
   <Toolbar {...props}/>
   </main>
))


function init(el, options, server) {
	var store = state(options, server);
	return render((
		<Provider store={store}>
		  <App/>
		</Provider>
	), el);
}

export default init;
