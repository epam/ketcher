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
      this.props.checked = [false,false,false,false,false,false,false];
      this.tabs = ['Check', 'Settings'];
      this.checkbox = ['Valence Check','Radical Check','Pseudoatom Check',
      				'Stereochemistry Check','Query Check',
      				'Overlapping Atoms Check','3D Structure Check'];
  }
    changeTab(ev, index) {
      this.setState({
        tabIndex: index,
      });
      ev.preventDefault();
    }
    doAdd(parametr){
    	this.setState({
    		checker:this.state.checker.concat([parametr])
    		})
    };
    doDelete(parametr){
    	this.setState({
    		checker:this.state.checker.splice(this.state.checker.indexOf(parametr),1)
    		})
    };
    doCheck() {
        this.props.server.check({ struct: molfile.stringify(this.props.struct),
                                  checks: this.state.checker})
            .then(res => this.setState({
                	data: res
                })
           	)
           	return JSON.stringify(this.state.data);
    };
    doChecked(index){
    	if (this.props.checked[index] == false){
    		this.props.checked[index] = true;
    	}else{
    		this.props.checked[index] =false;
    	}
    };
    UpdateCheckerList(ev,index){
    	this.doChecked(index);
    	if(index==0){
    		this.doAdd('valence');
    	}else{
    		this.doDelete('valence');
    	}
    	if(index==1){
    		this.doAdd('radicals');
    	}else{
    		this.doDelete('radicals');
    	}
    	if(index==2){
    		this.doAdd('pseudoatoms');
    	}else{
    		this.doDelete('pseudoatoms');
    	}
    	if(index==3){
    		this.doAdd('stereo');
    	}else{
    		this.doDelete('stereo');
    	}
    	if(index==4){
    		this.doAdd('query');
    	}else{
    		this.doDelete('query');
    	}
    	if(index==5){
    		this.doAdd('overlapping_atoms');
    	}else{
    		this.doDelete('overlapping_atoms');
    	}
    	if(index==6){
    		this.doAdd('3d');
    	}else{
    		this.doDelete('3d');
    	}
    	this.doCheck();
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
                    <output>{this.doCheck()}</output>
                </div>
                ), (
                <div tabTitle = "Setting">
                <ul>{this.checkbox.map((caption,index) =>(
                	<label><input type="checkbox" checked={this.props.checked[index]} onChange={ev => this.UpdateCheckerList(ev,index)}/>
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
