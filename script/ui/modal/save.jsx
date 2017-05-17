import { h, Component, render } from 'preact';
/** @jsx h */
import * as structFormat from '../structformat';

import Dialog from '../component/dialog';
import SaveButton from '../component/savebutton';

class Save extends Component {
	constructor(props) {
		super(props);
		this.state = { type: props.struct.hasRxnArrow() ? 'rxn' : 'mol' };
		this.changeType().catch(props.onCancel);
	}

	changeType(ev) {
		let { type } = this.state;
		if (ev) {
			type = ev.target.value;
			ev.preventDefault();
		}
		let converted = structFormat.toString(this.props.struct, type, this.props.server);
		return converted.then(structStr => this.setState({ type, structStr }),
							  e => { alert(e); });
	}

	saveTemplate(ev) {
		this.props.onOk({ event: 'saveTmpl', tmpl: this.state.structStr });
	}

	render () {
	    // $('[value=inchi]').disabled = ui.standalone;
		let { type, structStr } = this.state;
		let format = structFormat.map[type];
		console.assert(format, "Unknown chemical file type");

		return (
			<Dialog title="Save Structure"
					className="save" params={this.props}
					buttons={[(
						<SaveButton className="save"
									data={structStr}
									filename={'ketcher' + format.ext[0]}
									type={format.mime}
									server={this.props.server}
									onSave={ () => this.props.onOk() }>
							Save To File…
						</SaveButton>
					), (
						<button className="save-tmpl"
								onClick={ ev => this.saveTemplate(ev) }>
							Save to Templates</button>
					), "Close"]}>
				<label>Format:
				<select value={type} onChange={ev => this.changeType(ev)}>{
					[this.props.struct.hasRxnArrow() ? 'rxn' : 'mol', 'smiles', 'smarts', 'cml', 'inchi'].map(type => (
						<option value={type}>{structFormat.map[type].name}</option>
					))
				}</select>
				</label>
				<textarea className={type} value={structStr} readonly
			              ref={ el => el && el.select() }/>
			</Dialog>
		);
	}
}

export default Save;
