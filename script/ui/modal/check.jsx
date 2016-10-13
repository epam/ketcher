import { h, Component, render } from 'preact';
/** @jsx h */

import Dialog from '../component/dialog';
import Tabs from '../component/tabs'

const checkScheckSchema = [
	{ title: 'Valence', value: 'valence' },
	{ title: 'Radical', value: 'radicals'},
	{ title: 'Pseudoatom', value: 'pseudoatoms'},
	{ title: 'Stereochemistry', value: 'stereo' },
	{ title: 'Query', value: 'query' },
	{ title: 'Overlapping Atoms', value: 'overlapping_atoms'},
	{ title: 'Overlapping Bonds', value: 'overlapping_bonds'},
	{ title: '3D Structure', value: '3d'}
];

class CheckStruct extends Component {
    constructor(props) {
      super(props);
      this.state = {
      	  tabIndex: 0,
      	  data: {},
      	  checker: {}
      };
      checkScheckSchema.map((item) => {
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
        	this.setState({	data: res });
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
                    name="check-struct" params={props}
                    buttons={[ "Cancel"]}>
				<Tabs className="check-tabs" captions={tabs} changeTab={index => this.changeTab(index)}>
					<ul className="check-settings">{
						checkScheckSchema.filter(item => !!this.state.data[item.value]).map(item =>(
							<li>
								<div className="error-name">{item.title} error : </div>
								<div className="description">{this.state.data[item.value]}</div>
							</li>
						))
					}</ul>
					<ul className="check-settings">{checkScheckSchema.map((item) =>(
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
        <CheckStruct {...params}/>
    ), overlay);
};
