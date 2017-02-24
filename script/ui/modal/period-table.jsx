import { h, Component, render } from 'preact';
/** @jsx h */

import element from '../../chem/element';
import Dialog from '../component/dialog';

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

function TypeChoise() {
	return (
		<fieldset>
			{
				typeSchema.map(sc => (
					<label>
						<input type="radio" value={sc.value} name="type"/>
						{sc.title}
					</label>
				))
			}
		</fieldset>
	);
}

const metPrefix = ['alkali', 'alkaline-earth', 'transition',
				   'post-transition'];

function atomClass(el) {
	let own = `atom-${el.label.toLowerCase()}`;
	let type = metPrefix.indexOf(el.type) >= 0 ? `${el.type} metal` :
		(el.type || 'unknown-props');
	return [own, type, el.state || 'unknown-state', el.origin];
}

function Atom({el}) {
	return (
		<button title={el.title} className={atomClass(el).join(' ')}
				value={element.map[el.label]}>
		  {el.label}
		</button>
	);
}

function MainRow({row, caption, ref}) {
	return (
		<tr>
		  <th>{caption}</th>
		  {
			  row.map(el => (typeof el != 'number') ? (
				  <td><Atom el={el}/></td>
			  ) : (
				  ref(el) ? ( <td class="ref">{ref(el)}</td> ) :
				  ( <td colspan={el}/> )
			  ))
		  }
		</tr>
	);
}

function OutinerRow({row, caption}) {
	return (
		<tr>
		  <th colspan="3" class="ref">{caption}</th>
		  {
			  row.map(el => (
				  <td><Atom el={el}/></td>
			  ))
		  }
		  <td></td>
		</tr>
	);
}

const typeSchema = [
	{ title: 'Single', value: 'atom' },
	{ title: 'List', value: 'list'},
	{ title: 'Not List', value: 'not-list'}
];

class PeriodTable extends Component {
	render (props) {
		return (
			<Dialog caption="Periodic table"
					name="period-table" params={props.params}>
			  <table summary="Periodic table of the chemical elements">
				<Header/>
				{
					partitionRows().map((row, i) => (
						<MainRow row={row} caption={i + 1}
								 ref={o => o == 1 && (i == 5 ? '*' : '**')}/>
					))
				}
                <OutinerRow row={element.filter(el => el && el.type== 'lanthanide')}
                            caption="*"/>
                <OutinerRow row={element.filter(el => el && el.type == 'actinide')}
                            caption="**"/>
			  </table>
			  <TypeChoise/>
			</Dialog>
		);
	}
}

const beforeSpan = {
	'He': 16,
	'B': 10,
	'Al': 10,
	'Hf': 1,
	'Rf': 1
};

function partitionRows() {
	return element.reduce(function (res, el, index) {
		if (el && ['lanthanide', 'actinide'].indexOf(el.type) < 0) {
			let row = res[el.period - 1];
			if (!row)
				res.push([el]);
			else {
				if (beforeSpan[el.label])
					row.push(beforeSpan[el.label]);
				row.push(el);
			}
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
		<PeriodTable params={params}/>
	), overlay);
};
