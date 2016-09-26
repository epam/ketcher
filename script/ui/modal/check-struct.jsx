import { h, Component, render } from 'preact';
/** @jsx h */

import Dialog from '../component/dialog';
import molfile from '../../chem/molfile';

const checkScheckSchema = [
	{ title: 'Valence', value: 'valence' },
	{ title: 'Radical', value: 'radicals'},
	{ title: 'Pseudoatom', value: 'pseudoatoms'},
	{ title: 'Stereochemistry', value: 'stereo' },
	{ title: 'Query', value: 'query' },
	{ title: 'Overlapping Atoms', value: 'overlapping_atoms'},
	{ title: '3D Structure', value: '3d'},
	{ title: 'Overlapping Bonds', value: 'ovrlapping_bonds'}
];

class CheckStruct extends Component {
    constructor(props) {
      super(props);
      this.state = {
      		tabIndex: 0,
      		data: {},
      		checker: {},
      	}
  	}
    changeTab(ev, index) {
      this.setState({
        tabIndex: index,
      });
      if (index == 0)
      	  this.doCheck();
      ev.preventDefault();
    }
    doCheck() {
    	var checks = Object.keys(this.state.checker).filter(v => this.state.checker[v]);
        this.props.server.check({ struct: molfile.stringify(this.props.struct),
                                  checks: checks})
            .then(res => this.setState({
                	data: res
                })
           	)
    };
    checkItem(val) {
    	this.state.checker[val] = !this.state.checker[val];
    	this.setState(this.state.checker);
    }
    render (props) {
    	var tabs = ['Check', 'Settings'];
        return (
            <Dialog caption="Structure Check"
                    name="check-struct" params={props}
                    buttons={[ "Cancel"]}>
              <ul class="tabs">
                { tabs.map((caption, index) => (
                  <li class={this.state.tabIndex == index ? 'active' : ''}>
                     <a onClick={ ev => this.changeTab(ev, index) }>{caption}</a>
                  </li>
                  ))
                }
              </ul>
              {[(
                <div>
                <ul>{
					checkScheckSchema.filter(item => !!this.state.data[item.value]).map(item =>(
                		<li><label>{item.title} Error<input type="text" disabled="true"
                		                        value={this.state.data[item.value]}/></label></li>
                	))
                }
                </ul>
                </div>
                ), (
                <div>
                <ul>{checkScheckSchema.map((item) =>(
                	<li><label><input type="checkbox" checked={this.state.checker[item.value]}
                				onClick={ev => this.checkItem(item.value)}/>
                	{item.title} Check
                	</label></li>
                	))
                }
                </ul>
                </div>
              )][this.state.tabIndex]}
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
