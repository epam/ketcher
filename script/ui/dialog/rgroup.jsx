import { range } from 'lodash/fp';

import { h, Component } from 'preact';
/** @jsx h */

import Dialog from '../component/dialog';

function RGroup({ selected, onSelect, result, ...props }) {
	return (
		<Dialog title="R-Group"
				className="rgroup" params={props}
				result={() => result()}>
		  <ul>
			{ range(1, 33).map(i => (
				<li>
				  <button
					className={ selected(i) ? 'selected' : ''}
					onClick={ev => onSelect(i)}>
					{`R${i}`}
				  </button>
				</li>
			)) }
		  </ul>
		</Dialog>
	);
}

class RGroupFragment extends Component {
	constructor({label}) {
		super();
		this.state.label = label || null;
    }
	onSelect(label) {
		this.setState({
			label: label !== this.state.label ? label : null
		});
	}
	selected(label) {
		return label === this.state.label;
	}
	result() {
		return { label: this.state.label };
	}
	render() {
		return (
			<RGroup selected={i => this.selected(i)}
			  onSelect={i => this.onSelect(i)}
			  result={() => this.result()} {...this.props}/>
		);
	}
}

class RGroupAtom extends Component {
	constructor({values}) {
		super();
		this.state.values = values || [];
    }
	onSelect(index) {
		const {values} = this.state;
		const i = values.indexOf(index);
		if (i < 0)
			values.push(index);
		else
			values.splice(i, 1);
		this.setState({ values });
	}
	selected(index) {
		return this.state.values.includes(index);
	}
	result() {
		return {
			type: 'rlabel',
			values: this.state.values
		};
	}
	render() {
		return (
			<RGroup selected={i => this.selected(i)}
			  onSelect={i => this.onSelect(i)}
			  result={() => this.result() } {...this.props}/>
		);
	}
}

export default params => params.type === 'rlabel' ? (<RGroupAtom {...params}/>) : (<RGroupFragment {...params}/>);
