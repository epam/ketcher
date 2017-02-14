import {h, Component, render} from 'preact';
/** @jsx h */

import Dialog from '../component/dialog';
import StructEditor from '../component/structeditor';

import sdf from '../../chem/sdf';

class Attach extends Component {
	constructor(props) {
		super(props);
		this.tmpl = sdf.parse(props.struct)[1];

		console.log("Attach:", this.tmpl);
		debugger;
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
					buttons={["Cancel", "OK"]}>
				<label>
					<input type="text"/>
				</label>
				<StructEditor id="attachment" style="width: 500px;"
							  onEvent={ (eName, ap) =>  (eName == 'attachEdit') ? this.onAttach(ap) : null }
							  struct={this.tmpl.struct} opts={userOpts}
							  /* tool = {name: .. , opts: ..} */ tool={{ name: 'attach', opts: attach }} />
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
