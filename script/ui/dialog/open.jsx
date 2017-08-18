import { h, Component } from 'preact';
import { connect } from 'preact-redux';
/** @jsx h */

import { map as formatMap } from '../structformat';
import Dialog from '../component/dialog';
import OpenButton from '../component/openbutton';

class Open extends Component {
	constructor(props) {
		super(props);
		this.state = {
			structStr: '',
			fragment: false
		};
	}
	result() {
		let { structStr, fragment } = this.state;
		return structStr ? { structStr, fragment } : null;
	}
	changeStructStr(structStr) {
		this.setState({ structStr });
	}
	changeFragment(target) {
		this.setState({
			fragment: target.checked
		});
	}
	render () {
		let { structStr, fragment } = this.state;
		return (
			<Dialog title="Open Structure"
				className="open" result={() => this.result() }
				params={this.props}
				buttons={[(
					<OpenButton className="open" server={this.props.server}
								type={structAcceptMimes()}
								onLoad={ s => this.changeStructStr(s) }>
						Open From File…
					</OpenButton>
				), "Cancel", "OK"]}>
				<textarea value={structStr}
			              onInput={ ev => this.changeStructStr(ev.target.value) } />
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


export default connect(
	store => ({	server: store.server })
)(Open);
