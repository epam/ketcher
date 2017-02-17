import {h, Component, render} from 'preact';
/** @jsx h */

import Dialog from '../component/dialog';
import StructEditor from '../component/structeditor';

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
			<Dialog caption="Template Edit"
					name="attach" result={() => this.result() }
					params={this.props}
					buttons={["Cancel", "OK"]} className="attach">
				<label> Choose attachment atom and bond:
					&#123; atomid {attach.atomid || 0}; bondid: {attach.bondid || 0} &#125;</label>
				<StructEditor className="struct-editor" struct={this.tmpl.struct} opts={userOpts}
							  onEvent={ (eName, ap) =>  (eName == 'attachEdit') ? this.onAttach(ap) : null }
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
