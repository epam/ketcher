import { h, Component, render } from 'preact';
/** @jsx h */

import { map as formatMap } from '../structformat';
import Dialog from '../component/dialog';
import OpenButton from '../component/openbutton';

var ui = global.ui;

class Open extends Component {
	constructor(props) {
		super(props);
		this.state = {
			structStr: '',
			fragment: false
		};
	}
	result() {
		return this.state.structStr ? {
			structStr: this.state.structStr,
			fragment: this.state.fragment
		} : null;
	}
	changeStructStr(target) {
		this.setState({
			structStr: target.value ? target.value.trim() : target
		});
	}
	changeFragment(target) {
		this.setState({
			fragment: target.checked
		});
	}
	render () {
		let { structStr, fragment } = this.state;
		return (
			<Dialog caption="Open Structure"
				name="open" result={() => this.result() }
				params={this.props}
				buttons={[(
					<OpenButton className="open" server={this.props.server}
								type={structAcceptMimes()}
								onLoad={ s => this.changeStructStr(s) }>
						Open From File…
					</OpenButton>
				), "Cancel", "OK"]}>
				<textarea value={structStr}
			              onInput={ ev => this.changeStructStr(ev.target) } />
				<label>
				<input type="checkbox" checked={fragment}
			           onClick={ev => this.changeFragment(ev.target)} />
				    Load as a fragment
			    </label>
			</Dialog>
		);
	}
}

function structAcceptMimes() {
	return Object.keys(formatMap).reduce((res, key) => (
		res.concat(formatMap[key].mime, ...formatMap[key].ext)
	), []).join(',');
}


export default function dialog(params) {
	var overlay = $$('.overlay')[0];
	return render((
		<Open {...params} />
	), overlay);
};
