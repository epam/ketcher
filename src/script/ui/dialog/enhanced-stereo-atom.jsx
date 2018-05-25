import { h, Component } from 'preact';
// import { connect } from 'preact-redux';

import Dialog from '../component/dialog';
import Input from '../component/form/input';

class EnhancedStereoAtom extends Component {
	constructor(props) {
		super();
		console.log('UI type:', props.type);

		const { type, number } = props.stereoLabel;
		this.state = {
			type,
			number
		};
	}

	render() {
		const { type, number } = this.state;
		// const usedLabels = this.props.usedLabels;

		return (
			<Dialog
				title="Enhanced Stereo Atom"
				className="enhancedStereo"
				params={this.props}
				result={() => ({
					type,
					number: type === 'abs' ? 0 : number
				})}
				buttons={['OK',	'Close']}
			>
				StereoLabel:
				<Input
					value={type}
					onChange={val => this.setState({
						type: val
					})}
					schema={{
						enum: ['abs', 'and', 'or'],
						enumNames: ['ABS (Chiral)', 'AND Enantiomer', 'OR Enantiomer']
					}}
				/>
				<hr />
				Number:
				<Input
					disabled={type === 'abs'}
					type="number"
					value={type === 'abs' ? 0 : number}
					onChange={val => this.setState({
						number: val
					})}
				/>
			</Dialog>
		);
	}
}

export default EnhancedStereoAtom;
