import { h, Component, render } from 'preact';
/** @jsx h */

import Dialog from './dialog';
import molfile from '../../chem/molfile';

class CheckStruct extends Component {
    constructor(props) {
      super(props);
      this.state = {
      		tabIndex: 0,
      		data: null,
      		checker:[],
      		checkboxIndex:0
      }
      this.tabs = ['Check', 'Settings'];
      this.checkbox = ['Valence Check','Radical Check','Pseudoatom Check',
      				'Stereochemistry Check','Query Check',
      				'Overlapping Atoms Check','3D Structure Check'];
  }
    changeTab(ev, index) {
      this.setState({
        tabIndex: index,
        //checker:this.state.checker.concat(['overlapping_atoms'])
      });
     console.info('data',this.state.data);
     console.info('cheker',this.state.checker);
      ev.preventDefault();
    }
     doAdd(parametr){
    	this.setState({
    		checker:this.state.checker.concat([parametr])
    		})
    };
    doCheck() {
        this.props.server.check({ struct: molfile.stringify(this.props.struct),
                                  checks: this.state.checker})
            .then(res => this.setState({
                	data: res
                })
           	)
    };
    UpdateCheckerList(ev,index){

    };

    result () {
        return `Yo!`;
    }
    render (props) {
        return (
            <Dialog caption="Structure Check"
                    name="check-struct" params={props}
                    result={() => this.result()} buttons={[ "Cancel"]}>
              <ul class="tabs">
                { this.tabs.map((caption, index) => (
                  <li class={this.state.tabIndex == index ? 'active' : ''}>
                     <a onClick={ ev => this.changeTab(ev, index) }>{caption}</a>
                  </li>
                  ))
                }
              </ul>
              {[(
                <div tabTitle = "Check">
                    <output>info</output>
                    <button onClick={() => this.doCheck() }>Do Checks</button>
                     <button onClick={() => this.doAdd('overlapping_atoms') }>Do Add</button>
                </div>
                ), (
                <div tabTitle = "Setting">
                <ul>{this.checkbox.map((caption,index) =>(
                	<label><input type="checkbox" onClick={ev => this.UpdateCheckerList(ev,index)}/>
                	{caption}<br />
                	</label>
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
