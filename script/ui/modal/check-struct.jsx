import { h, Component, render } from 'preact';
/** @jsx h */

import Dialog from './dialog';

class CheckStruct extends Component {
    constructor(props) {
      super(props);
      this.state.tabIndex = 0;
      this.tabs = ['Check', 'Settings'];
    }
    changeTab(ev, index) {
      this.setState({
        tabIndex: index
      });
      ev.preventDefault();
    }
    result () {
        return `Yo!`;
    }
    render (props) {
        return (
            <Dialog caption="Structure Check"
                    name="check-struct" params={props.params}
                    result={() => this.result()}>
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
                  <button>Hello Check!</button>
                </div>
                ), (
                <div tabTitle = "Setting">
                 <input type="checkbox"/>Valence Check
                 <input type="checkbox"/>Radical Check
                 <input type="checkbox"/>Pseudoatom Check
                 <input type="checkbox"/>Stereochemistry Check
                 <input type="checkbox"/>Query Check
                 <input type="checkbox"/>Overlapping Atoms Check
                 <input type="checkbox"/>3D Structure Check
                  <button>Hello Settings!</button>
                </div>
              )][this.state.tabIndex]}
            </Dialog>
        );
    }
}


export default function dialog(params) {
    var {server, struct} = params;
    server.check({struct}).then(res => {
      console.info('check result', res);
    })
    var overlay = $$('.overlay')[0];
    return render((
        <CheckStruct params={params}/>
    ), overlay);
};
