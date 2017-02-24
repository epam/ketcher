import { h, Component, render } from 'preact';
/** @jsx h */

import element from '../../chem/element';
import Dialog from '../component/dialog';
import Atom from '../component/atom';

const typeSchema = [
	{ title: 'Single', value: 'atom' },
	{ title: 'List', value: 'list'},
	{ title: 'Not List', value: 'not-list'}
];

const beforeSpan = {
	'He': 16,
	'B': 10,
	'Al': 10,
	'Hf': 1,
	'Rf': 1
};

const main = rowPartition(element.filter(el => el && el.type != 'actinide' &&
						                 el.type != 'lanthanide'));
const lanthanides = element.filter(el => el && el.type == 'lanthanide');
const actinides = element.filter(el => el && el.type == 'actinide');

function Header() {
	return (
		<tr>
		  {
			  range(19).map(i => (
				  <th>{i || ''}</th>
			  ))
		  }
		</tr>
	);
}

function TypeChoise({value, onChange, ...props}) {
	return (
		<fieldset>
			{
				typeSchema.map(sc => (
					<label>
					  <input type="radio" value={sc.value} name="type"
							 checked={sc.value == value}
							 onClick={ev => onChange(sc.value) } {...props}/>
						{sc.title}
					</label>
				))
			}
		</fieldset>
	);
}

function MainRow({row, caption, ref, selected, onChange}) {
	return (
		<tr>
		  <th>{caption}</th>
		  {
			  row.map(el => (typeof el != 'number') ? (
				  <td>
					<Atom el={el}
					  className={selected(el.label) ? 'selected' : ''}
					  onClick={ev => onChange(el.label)}/>
				  </td>
			  ) : (
				  ref(el) ? ( <td className="ref">{ref(el)}</td> ) :
				  ( <td colspan={el}/> )
			  ))
		  }
		</tr>
	);
}

function OutinerRow({row, caption, selected, onChange}) {
	return (
		<tr>
		  <th colspan="3" className="ref">{caption}</th>
		  {
			  row.map(el => (
				  <td>
					<Atom el={el}
					  className={selected(el.label) ? 'selected' : ''}
					  onClick={ev => onChange(el.label)}/>
				  </td>
			  ))
		  }
		  <td></td>
		</tr>
	);
}

class PeriodTable extends Component {
	constructor(props) {
		super(props);
		this.state.type = props.type || 'atom';
		this.state.value = props.values || props.label || null;
	}
	changeType(type) {
		let pl = this.state.type == 'atom';
		let l = type == 'atom';
		if (l && pl || !l && !pl)
			this.setState({type});
		else
			this.setState({
				type,
				value: type == 'atom' ? null : []
			});
	}
	selected(label) {
		let {type, value} = this.state;
		return (type == 'atom') ? value == label :
			value.includes(label);
	}
	select(label) {
		let {type, value} = this.state;
		if (type == 'atom')
			this.setState({ value: label });
		else {
			var i = value.indexOf(label);
			if (i < 0)
				value.push(label);
			else
				value.splice(i, 1);
			this.setState({ value });
		}
	}
	result() {
		let {type, value} = this.state;
		if (type == 'atom')
			return value ? { label: value } : null;
		else
			return value.length ? { type, values: value } : null;
	}
	render () {
		return (
			<Dialog caption="Periodic table"
					name="period-table" params={this.props}
					result={() => this.result()}>
			  <table summary="Periodic table of the chemical elements">
				<Header/>
				{
					main.map((row, i) => (
						<MainRow row={row} caption={i + 1}
						  ref={o => o == 1 && (i == 5 ? '*' : '**')}
						  selected={l => this.selected(l)}
						  onChange={l => this.select(l)}/>
					))
				}
				<OutinerRow row={lanthanides} caption="*"
						  selected={l => this.selected(l)}
						  onChange={l => this.select(l)}/>
				<OutinerRow row={actinides} caption="**"
						  selected={l => this.selected(l)}
						  onChange={l => this.select(l)}/>
				</table>
				<TypeChoise value={this.state.type}
			                onChange={t => this.changeType(t) }/>
			</Dialog>
		);
	}
}

function rowPartition(elements) {
	return elements.reduce(function (res, el, index) {
		let row = res[el.period - 1];
		if (!row)
			res.push([el]);
		else {
			if (beforeSpan[el.label])
				row.push(beforeSpan[el.label]);
			row.push(el);
		}
		return res;
	}, []);
}

function range(n, start = 0) {
	// see #574
	return Array.apply(null, { length: n }).map((_, i) => i + start);
}

export default function dialog(params) {
	var overlay = $$('.overlay')[0];
	return render((
		<PeriodTable {...params}/>
	), overlay);
};
