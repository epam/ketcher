import { h, Component, render } from 'preact';
/** @jsx h */

import Dialog from './dialog';
import defaultOptions from './options';

class OpenSettings extends Component {
    /*opts = [
        {name: 'showAtomIds',
        type: 'boolean',
        defaultValue: false,
        tab: 'atoms'},
        {name: 'hideImplicitHydrogen',
        type: 'boolean',
        defaultValue: false,
        tab: 'atoms'},

        {name: 'Display attached data',
        type: 'boolean',
        defaultValue: false,
        tab: 'attachedData'},

        {name: 'bondLength',
        type: 'number',
        defaultValue: 75,
        values: [75, 100, 150],
        tab: 'bonds'},
        {name: 'showSelectionRegions',
        type: 'boolean',
        defaultValue: false,
        tab: 'bonds'},
        {name: 'showBondIds',
        type: 'boolean',
        defaultValue: false,
        tab: 'bonds'},
        {name: 'showHalfBondIds',
        type: 'boolean',
        defaultValue: false,
        tab: 'bonds'},
        {name: 'showLoopIds',
        type: 'boolean',
        defaultValue: false,
        tab: 'bonds'},

        {name: 'autoScale',
        type: 'boolean',
        defaultValue: false,
        tab: 'scaling'},
        {name: 'autoScaleMargin',
        type: 'number',
        defaultValue: 4,
        values: [2, 4, 8],
        tab: 'scaling'},

        {name: 'Do not show the "Chiral" flag',
        type: 'boolean',
        defaultValue: false,
        tab: 'chemul'},
        {name: 'Show the Data S-Group Tool',
        type: 'boolean',
        defaultValue: false,
        tab: 'chemul'}
    ]*/

     constructor(props) {
        super(props);
        /*this.state = {
            selectedItem: null
        }*/
        this.props.opts = defaultOptions();
    }
    result () {
        return `Yo!`;
    }
    /*showInfo (ev) {
        console.log(ev)
        this.setState({
            selectedItem: true //?
        })
    }*/
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
                        <input type="checkbox" class="menu" id="atoms" checked></input>
                            <label for="atoms">Atoms</label>
                                <ul>
                                    { test(props.opts, "atoms") }
                                </ul>
                    </li>
                    <li class="has-children">
                        <input type="checkbox" class="menu" id="attachedData" checked></input>
                            <label for="attachedData">Attached data</label>
                                <ul>
                                    { test(props.opts, "attachedData") }
                                </ul>
                    </li>
                    <li class="has-children">
                        <input type="checkbox" class="menu" id="bonds" checked></input>
                            <label for="bonds">Bonds</label>
                                <ul>
                                    { test(props.opts, "bonds") }
                                </ul>
                    </li>
                    <li class="has-children">
                        <input type="checkbox" class="menu" id="scaling" checked></input>
                            <label for="scaling">Scaling</label>
                                <ul>
                                    { test(props.opts, "scaling") }
                                </ul>
                    </li>
                    <li class="has-children">
                        <input type="checkbox" class="menu" id="chemul" checked></input>
                            <label for="chemul">Chemul</label>
                                <ul>
                                    { test(props.opts, "chemul") }
                                </ul>
                    </li>    
                </ul>
            </div>
            </Dialog>
        );
    }
}

function createSelectListItem(values, defaultOption) {
    var listComponents = values.map(function(value) {
        if (value === defaultOption) {
            return ( <option value="" selected="selected" > {value} </option>);
        } else {
            return ( <option value=""> {value} </option>);
        }
    });
    return <select>{listComponents}</select>;
}

function test(opts, tab) {
    var optsComponents = opts.map(function(elem) {
        var values;
        var defaultValue;
        if (elem.type === 'boolean') {
            values = ['on', 'off'];
            if (elem.defaultValue === true)
                defaultValue = "on";
             else
                defaultValue = "off";
        } else{
            values = elem.values;
            defaultValue = elem.defaultValue;
        }
        if (elem.tab === tab) {
            return (
            <li>
                <output> { elem.name } </output>
                {createSelectListItem(values, defaultValue)}
            </li>);
        }
    });
    return <div>{optsComponents}</div>;
}


export default function dialog(params) {
    var overlay = $$('.overlay')[0];
    return render((
        <OpenSettings params={params}/>
    ), overlay);
};
