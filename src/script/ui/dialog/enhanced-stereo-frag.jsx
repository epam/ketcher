import { h, Component } from 'preact';
// import { connect } from 'preact-redux';

import Dialog from '../component/dialog';
import Input from '../component/form/input';

// TODO: correct
class EnhancedStereoFragment extends Component {
	constructor(props) {
		super();
		console.log('UI type:', props.type);

		this.state = {
			stereoFlag: props.stereoFlag !== 'Mixed' ? props.stereoFlag : 'ABS'
		};
	}

	render() {
		const { stereoFlag } = this.state;

		return (
			<Dialog
				title="Enhanced Stereo Fragment"
				className="enhancedStereo"
				params={this.props}
				result={() => stereoFlag}
				buttons={['OK', 'Close']}
			>
				Fragment Stereo Flag:
				<Input
					value={stereoFlag}
					onChange={val => this.setState({
						stereoFlag: val
					})}
					schema={{
						enum: ['AND', 'OR', 'ABS'],
						enumNames: ['AND Enantiomer', 'OR Enantiomer', 'ABS (Chiral)']
					}}
				/>
			</Dialog>
		);
	}
}

export default EnhancedStereoFragment;
