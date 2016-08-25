import { h, Component, render } from 'preact';
/** @jsx h */

import Dialog from './dialog';

class OpenSettings extends Component {
     constructor(props) {
        super(props);
        this.state = {
            selectedItem: null
        }
    }
    result () {
        return `Yo!`;
    }
    showInfo (ev) {
        console.log(ev)
        this.setState({
            selectedItem: true //?
        })
    }
    render (props) {
        return (
            <Dialog caption="Settings"
                    name="open-settings" params={props.params}
                    result={() => this.result()}
                     buttons={[
                        <button>Load...</button>,
                        <button>Save as...</button>,
                        <button>Reset</button>,
                        <button>Apply and Save</button>,
                        <button>Apply</button>,
                        "Cancel"]}>
            <div>
                <ul class="accordion-menu">
                    <li class="has-children">
                        <input type="checkbox" id="atoms" checked></input>
                            <label for="atoms">Atoms</label>
                                <ul>
                                    <li><output>Atom label margin</output></li>
                                    <li><output>Auto-reset tool Strip to C</output></li>
                                </ul>
                    </li>
                    <li class="has-children">
                        <input type="checkbox" id="attachedData" checked></input>
                            <label for="attachedData">Attached data</label>
                                <ul>
                                    <li><output>Diplay attached data</output></li>
                                </ul>
                    </li>
                    <li class="has-children">
                        <input type="checkbox" id="bonds" checked></input>
                            <label for="bonds">Bonds</label>
                                <ul>
                                    <li><output>Aromatic bond as circle</output></li>
                                    <li><output>Bond thickness</output></li>
                                </ul>
                    </li>
                    <li class="has-children">
                        <input type="checkbox" id="chemul" checked></input>
                            <label for="chemul">Chemul</label>
                                <ul>
                                    <select>
                                      <option value="">on</option>
                                      <option value="">off</option>
                                    </select>
                                    <li> <output>Do not show the 'Chiral' flag</output> <input type="checkbox" checked/></li>
                                    <li><output>Show the Data S-Group Tool</output></li>
                                </ul>
                    </li>    
                </ul>
            </div>
            </Dialog>
        );
    }
}


export default function dialog(params) {
    var overlay = $$('.overlay')[0];
    return render((
        <OpenSettings params={params}/>
    ), overlay);
};