import { h, Component, render } from 'preact';
/** @jsx h */

import generics from '../../chem/generics';
import Dialog from '../component/dialog';

var viewSchema = {
	'atom': {
		caption: 'Atom Generics',
		order: ['any', 'no-carbon', 'metal', 'halogen']
	},
	'group': {
		caption: 'Group Generics',
		order: ['acyclic', 'cyclic']
	},
	'group/acyclic': {
		caption: 'Acyclic',
		order: ['carbo', 'hetero']
	},
	'group/cyclic': {
		caption: 'Cyclic',
		order: ['no-carbon', 'carbo', 'hetero']
	},
	'group/acyclic/carbo': {
		caption: 'Carbo',
		order: ['alkynyl', 'alkyl', 'alkenyl']
	},
	'group/acyclic/hetero': {
		caption: 'Hetero',
		order: ['alkoxy']
	},
	'group/cyclic/carbo': {
		caption: 'Carbo',
		order: ['aryl', 'cycloalkyl', 'cycloalkenyl']
	},
	'group/cyclic/hetero': {
		caption: 'Hetero',
		order: ['aryl']
	},
	'atom/any': 'any atom',
	'atom/no-carbon': 'except C or H',
	'atom/metal': 'any metal',
	'atom/halogen': 'any halogen',
	'group/cyclic/no-carbon': 'no carbon',
	'group/cyclic/hetero/aryl': 'hetero aryl'
};

function GenSet({labels, caption='', selected, onSelect, ...props}) {
	return (
		<fieldset {...props}>
		  {
			  labels.map(label => (
				  <button onClick={e => onSelect(label)}
					      className={selected(label) ? 'selected' : ''}>
					{label}</button>
			  ))
		  }
		  {
			caption ? (
				<legend>{caption}</legend>
			) : null
		  }
		</fieldset>
	);
}

function GenGroup({gen, key, path, selected, onSelect}) {
	let group = gen[key];
	let pk = path ? `${path}/${key}` : key;
	let schema = viewSchema[pk];

	return (schema && schema.caption) ? (
		<fieldset className={key}>
		  <legend>{schema.caption}</legend>
		  {
			  group.labels ? (
				  <GenSet labels={group.labels}
						  selected={selected} onSelect={onSelect} />
			  ) : null
		  }
		  {
			  schema.order.map(child => ( // TODO:order = Object.keys ifndef
				  <GenGroup gen={group} key={child} path={pk}
						    selected={selected} onSelect={onSelect}/>
			  ))
	      }
		</fieldset>
	) : (
		<GenSet labels={group.labels}
				caption={schema || key} className={key}
				selected={selected} onSelect={onSelect} />
	);
}

class GenericGroups extends Component {
	constructor({label=null}) {
		super();
		this.state.label = label;
	}
	onSelect(label) {
		this.setState({ label });
	}
	selected(label) {
		return label == this.state.label;
	}
	result() {
		let { label } = this.state;
		return label ? { label } : null;
	}
	render () {
		return (
			<Dialog title="Generic Groups"
					className="generic-groups"
					params={this.props}
					result={() => this.result()}>
			  <GenGroup gen={generics} key='atom'
						selected={l => this.selected(l)}
				        onSelect={l => this.onSelect(l)}/>
			  <GenGroup gen={generics} key='group'
					    selected={l => this.selected(l)}
			            onSelect={l => this.onSelect(l)}/>
			</Dialog>
		);
	}
}

export default function dialog(params) {
	var overlay = $$('.overlay')[0];
	return render((
		<GenericGroups {...params}/>
	), overlay);
};
