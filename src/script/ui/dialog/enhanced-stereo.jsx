import { h, Component } from 'preact';
import { connect } from 'preact-redux';

import Dialog from '../component/dialog';

// TODO: correct
class EnhancedStereo extends Component {
	render() {

		return (
			<Dialog
				title="Enhanced Stereo"
				className="enhancedStereo"
				params={this.props}
				result={() => 'Hello'}
				buttons={[
					'OK',
					'Close'
				]}
			>
				{this.props.data}
			</Dialog>
		);
	}
}

export default connect(
	null,
	// (dispatch, props) => ({
	// 	onOk: (res) => {
	// 		props.onOk('Hello');
	// 	}
	// })
)(EnhancedStereo);
