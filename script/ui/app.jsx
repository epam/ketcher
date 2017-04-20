import { h, Component, render } from 'preact';
/** @jsx h */
import Toolbar from './toolbar';
import StructEditor from './component/structeditor';

var atoms = ['H', 'C', 'N', 'O', 'S', 'P', 'F', 'Cl', 'Br', 'I'];

function App({ options, server, onEditor }) {
	return (
		<main role="application">
		  <StructEditor id="canvas"
						onInit={onEditor} tool={ { name: 'chain' } }/>
		  <Toolbar atoms={atoms}/>
		</main>
	)
};

function init(el, options, server) {
	var ui = new Promise(resolve => render((
		<App onEditor={resolve}/>
	), el));
	ui.then(editor => {
		global._ui_editor = editor;
	});
	return ui;
}

export default init;
