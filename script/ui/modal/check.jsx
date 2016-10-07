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
              	<div className="tabs">
					{ tabs.map((caption, index) => (
					  <div className={this.state.tabIndex == index ? 'tab active' : 'tab'} onClick={ ev => this.changeTab(ev, index)}>
						 {caption}
					  </div>
					  ))
					}
              	</div>
				<div className="check-settings">
				  {[(
					<ul>{
						checkScheckSchema.filter(item => !!this.state.data[item.value]).map(item =>(
							<li>
								<div className="error-name">{item.title} error : </div>
								<div className="description">{this.state.data[item.value]}</div>
							</li>
						))
					}
					</ul>
					), (
					<ul>{checkScheckSchema.map((item) =>(
						<li><label><input type="checkbox" checked={this.state.checker[item.value]}
									onClick={ev => this.checkItem(item.value)}/>
						{item.title} check
						</label></li>
						))
					}
					</ul>
				  )][this.state.tabIndex]}
				</div>
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
