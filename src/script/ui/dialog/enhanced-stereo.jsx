import { h, Component } from 'preact';
import { connect } from 'preact-redux';

import Dialog from '../component/dialog';

// TODO: correct
class EnhancedStereo extends Component {
	constructor(props) {
		super();
		const { type, number } = props.atomStereo;
		this.state = {
			mark: type || '',
			number: number || 0
		};
	}

	render() {
		const { mark, number } = this.state;

		return (
			<Dialog
				title="Enhanced Stereo"
				className="enhancedStereo"
				params={this.props}
				result={() => ({
					newMark: {
						type: mark,
						number
					}
				})}
				buttons={[
					'OK',
					'Close'
				]}
			>
				Mark:
				<select
					value={mark}
					onChange={ev => this.setState({
						mark: ev.target.value
					})}
				>
					<option value="">Пусто =)</option>
					<option value="and">AND</option>
					<option value="or">OR</option>
					<option value="abs">ABS</option>
				</select>
				<br />
				Number:
				<input
					type="number"
					value={number}
					onChange={ev => this.setState({
						number: +ev.target.value
					})}
				/>
				<br />
				{this.props.stereoParity ? this.props.stereoParity : 'Это не стерео атом Хмм'}
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
