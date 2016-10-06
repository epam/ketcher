import { h, Component, render } from 'preact';
/** @jsx h */

import Dialog from '../component/dialog';

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
	  this.doCheck();
  	}
    changeTab(ev, index) {
		ev.preventDefault();
      	this.setState({
      	  tabIndex: index
      	});
      	if (index == 0) this.doCheck();
    }
    doCheck() {
        this.props.check().then(res => {
        	let data = {};
        	for (let key in res)
        		if (this.state.checker[key]) data[key] = res[key];
        	this.setState({	data: data });
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
