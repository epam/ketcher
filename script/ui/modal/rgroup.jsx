import { h, Component, render } from 'preact';
/** @jsx h */

import Dialog from '../component/dialog';

class RGroupBase extends Component {
	constructor({params}) {
		super();
		this.values = params.values ? params.values.map(v => parseInt(v.substr(1)) - 1) : [];
    }
	name (index) {
		return `R${index + 1}`;
	}
	render (props) {
		return (
			<Dialog caption="R-Group"
					name="rgroup" params={props.params}
					result={() => this.result()}>
				<ul>
					{ Array.apply(null, { length: 32 }).map((_, i) => (
						<li>
							<button
								className={ this.selected(i) ? 'selected' : ''}
								onClick={ (ev) => { ev.preventDefault(); this.select(i); } }>
								{this.name(i)}
							</button>
						</li>
					)) }
				</ul>
			</Dialog>
		);
	}
}

class RGroupFragment extends RGroupBase {
	constructor(props) {
		super(props);
		this.state.value = this.values.length ? this.values[0] : null;
    }
	select(index) {
		this.setState({
			value: index !== this.state.value ? index : null
		});
	}
	selected(index) {
		return index === this.state.value;
	}
	result() {
		return { values: this.state.value != null ? [this.name(this.state.value)] : [] };
	}
}

class RGroupAtom extends RGroupBase {
	constructor(props) {
		super(props);
		this.state.values = this.values;
    }
	select(index) {
		var vals = this.state.values;
    var i = vals.indexOf(index);
		if (i < 0)
			vals.push(index);
		else
			vals.splice(i, 1);
		this.setState({
			values: vals
		});
	}
	selected(index) {
		return this.state.values.includes(index);
	}
	result() {
		return { type: 'rlabel', values: this.state.values.map(i => this.name(i)) };
	}
}

export default function dialog(params) {
	var overlay = $$('.overlay')[0];
	return render(params.type == 'rlabel' ? (
		<RGroupAtom params={params}/>
	) : (
		<RGroupFragment params={params}/>
	), overlay);
};
