import {h, Component, render} from 'preact';
/** @jsx h */

import Dialog from '../component/dialog';
import StructEditor from '../component/structeditor';

import sdf from '../../chem/sdf';

class Attach extends Component {
	constructor(props) {
		super(props);
		this.tmpl = props.struct;

		this.setState( {
			attach: {
				atomid: +this.tmpl.props.atomid || 0,
				bondid: +this.tmpl.props.bondid || 0
			}
		});
	}

	result() {
		let tmpl = this.tmpl;
		tmpl.props = Object.assign(tmpl.props, this.state.attach);
		// return sdf.stringify(tmpl);
		return tmpl;
	}

	onAttach(attachPoints) {
		this.setState({
			attach: attachPoints
		});
	}

	render() {
		let {attach} = this.state;
		let {userOpts} = this.props;
		return (
			<Dialog caption="Attach"
					name="attach" result={() => this.result() }
					params={this.props}
					buttons={["Cancel", "OK"]} className="attach">
				<label> Template name:
					<input type="text"/>
				</label>
				<br/>
				<label> Choose attachment atom and bond
				<StructEditor className="struct-editor" struct={this.tmpl.struct} opts={userOpts}
							  onEvent={ (eName, ap) =>  (eName == 'attachEdit') ? this.onAttach(ap) : null }
							  /* tool = {name: .. , opts: ..} */ tool={{ name: 'attach', opts: attach }} />
				</label>
			</Dialog>
		);
	}
}

export default function dialog(params) {
	var overlay = $$('.overlay')[0];
	return render((
		<Attach {...params}/>
	), overlay);
};
