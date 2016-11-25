import { h, Component, render } from 'preact';
/** @jsx h */

import Dialog from '../component/dialog';
import Tabs from '../component/tabs';

const checkScheckSchema = [
	{ title: 'Valence', value: 'valence' },
	{ title: 'Radical', value: 'radicals'},
	{ title: 'Pseudoatom', value: 'pseudoatoms'},
	{ title: 'Stereochemistry', value: 'stereo' },
	{ title: 'Query', value: 'query' },
	{ title: 'Overlapping Atoms', value: 'overlapping_atoms'},
	{ title: 'Overlapping Bonds', value: 'overlapping_bonds'},
	{ title: 'R-Groups', value: 'rgroups'},
	{ title: 'Chirality', value: 'chiral'},
	{ title: '3D Structure', value: '3d'}
];

class Check extends Component {
    constructor(props) {
      super(props);
      this.state = {
      	  data: {},
      	  checker: {}
      };
      checkScheckSchema.forEach((item) => {
		  this.state.checker[item.value] = true;
	  });
	  this.onCheck();
  	}
    changeTab(index) {
      	if (index == 0) this.onCheck();
    }
    onCheck() {
    	let checkOpts = [];
		for (let key in this.state.checker)
			if (this.state.checker[key]) checkOpts.push(key);
        this.props.check({ 'types': checkOpts }).then(res => {
			if (Object.keys(res).length == 0) this.setState({ data: 'correct' });
        	else this.setState({ data: res });
		});
    };
    checkItem(val) {
    	this.state.checker[val] = !this.state.checker[val];
    	this.setState({checker: this.state.checker});
    }
    render (props) {
    	var tabs = ['Check', 'Settings'];
        return (
            <Dialog caption="Structure Check"
                    name="check" params={props}
                    buttons={[ "Close"]}>
				<Tabs className="tabs" captions={tabs} changeTab={index => this.changeTab(index)}>
				  <dl className="result">{
						this.state.data == 'correct' ? <li><div className="error-name">No errors found</div></li> :
							checkScheckSchema.filter(item => !!this.state.data[item.value]).map(item =>(
								<div>
								  {/* A wrapper for react */}
								  <dt>{item.title} error : </dt>
								  <dd>{this.state.data[item.value]}</dd>
								</div>
						))
					}</dl>
				<ul className="settings">{
					checkScheckSchema.map((item) => (
						<li><label><input type="checkbox" checked={this.state.checker[item.value]}
										  onClick={ev => this.checkItem(item.value)}/>
							{item.title} check
						</label></li>
						))
					}</ul>
				</Tabs>
            </Dialog>
        );
    }
}

export default function dialog(params) {
    var overlay = $$('.overlay')[0];
    return render((
        <Check {...params}/>
    ), overlay);
};
