import { h, Component, render } from 'preact';
/** @jsx h */
import fs from 'filesaver.js';

import * as structFormat from '../structformat';

import Dialog from './dialog';

var ui = global.ui;

class Save extends Component {
	constructor(props) {
		super(props);
		this.changeType(props.struct.rxnArrows.count() > 0 ? 'rxn' : 'mol');
		fileSaver(props.server).then(f => {
			this.setState({
				fileSaver: f
			});
		}, ui.echo);
	}

	changeType(ev) {
		var type = ev.target ? ev.target.value : ev;
		if (ev.target)
			ev.preventDefault();
		structFormat.toString(this.props.struct, type, this.props.server)
			.then(structStr => this.setState({ type, structStr }),
				  e => ui.echo(e));
	}

	save(ev) {
		if (this.state.fileSaver) {
			this.state.fileSaver(this.state.structStr,
								 this.state.type);
			this.props.onOk();
		}
		ev.preventDefault();
	}
	saveTemplate(ev) {
		var storage = JSON.parse(localStorage['ketcher-tmpl'] || 'null') || [];
		storage.push(this.molStr);
		localStorage['ketcher-tmpl'] = JSON.stringify(storage);
		this.props.onOk();
	}
	render () {
	    // $('[value=inchi]').disabled = ui.standalone;
		return (
			<Dialog caption="Save Structure"
					name="save" params={this.props}
					buttons={[(
						<a className={!this.state.fileSaver ? "disabled save" : "save"} onClick={ev => this.save(ev)} download>Save To File…</a>
					), (
						<button className="save-tmpl"
								onClick={ ev => this.saveTemplate(ev) }>
							Save to Templates</button>
					), "Close"]}>
				<label>Format:
				<select value={this.state.type} onChange={ev => this.changeType(ev)}>{
					[this.props.struct.rxnArrows.count() > 0 ? 'rxn' : 'mol', 'smiles', 'cml', 'inchi'].map(type => (
						<option value={type}>{structFormat.map[type].name}</option>
					))
				}</select>
				</label>
				<textarea className={ this.state.type } readonly
			              value={ this.state.structStr } focus={ ev => ev.target.select() }/>
			</Dialog>
		);
	}
}

function fileSaver(server) {
	return new Promise((resolve, reject) => {
		if (global.Blob && fs.saveAs)
			resolve((data, type) => {
				console.assert(structFormat.map[type], 'Unknown chemical file type');
				var blob = new Blob([data], { type: structFormat.map[type] });
				fs.saveAs(blob, 'ketcher' + structFormat.map[type].ext[0]);
			});
		else
			resolve(server.then(() => {
				throw "Server doesn't still support echo method";
			}, () => {
				throw new Error("Standalone mode!");
			}));
	});
}

export default function dialog(params) {
	var overlay = $$('.overlay')[0];
	return render((
		<Save {...params} />
	), overlay);
};
