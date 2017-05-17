import { Provider, connect } from 'preact-redux';

import state from './reducers/state';

import { h, Component, render } from 'preact';
/** @jsx h */
import Toolbar from './toolbar';
import StructEditor from './component/structeditor';

import Settings from './modal/settings';

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

const SettingDialog = connect(
	null,
	(dispatch, props) => ({
		onOk: function (res) {
			console.log('output:', res);
			dispatch({ type: 'CLOSE_DIALOG' })
		},
		onCancel: function () {
			dispatch({ type: 'CLOSE_DIALOG' })
		}
	})
)(Settings);

const App = connect(
	(state) => ({
		modal: state.modal
	}),
	dispatch => ({
		onAction: function (action) {
			console.info('action', action);
			dispatch({ type: 'UPDATE',
					   data: { active: action }});
		},
		onDialog: function (name, title) {
			dispatch({
				type: 'OPEN_DIALOG',
				data: { modal: { name, title } }
			})
		}
	})
)(props => (
   <main role="application">
   <AppEditor id="canvas"/>
   <Toolbar {...props}/>
	   {props.modal ? <SettingDialog title={props.modal.title} /> : null}
   </main>
));


function init(el, options, server) {
	var store = state(options, server);
	return render((
		<Provider store={store}>
		  <App/>
		</Provider>
	), el);
}

export default init;
