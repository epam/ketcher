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
      }
      this.tabs = ['Check', 'Settings'];
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
    UpdateCheckerList(){

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
                <ul>{[
                	{name:'Valence Check'}
                	].map(v => (
                		<input type="checkbox"><label>{name}</label></input>
                		))
                }
                </ul>
                 <input type="checkbox"/>Valence Check<br />
                 <input type="checkbox"/>Radical Check<br />
                 <input type="checkbox"/>Pseudoatom Check<br />
                 <input type="checkbox"/>Stereochemistry Check<br />
                 <input type="checkbox"/>Query Check<br />
                 <input type="checkbox"/>Overlapping Atoms Check<br />
                 <input type="checkbox"/>3D Structure Check<br />
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
