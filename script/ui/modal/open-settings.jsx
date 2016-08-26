import { h, Component, render } from 'preact';
/** @jsx h */

import Dialog from './dialog';

class OpenSettings extends Component {
    opts = [
        {name: 'render-atom-ids-visible',
        type: 'boolean',
        defaultValue: false,
        tab: 'chemul'},
        {name: 'render-bond-ids-visible',
        type: 'boolean',
        defaultValue: false,
        tab: 'chemul'}
    ]

     constructor(props) {
        super(props);
        this.state = {
            selectedItem: null
        }
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
    createHtmlCheckbox(value, name, div) {
        var input = $('<input>');
        if (value === true) {
            input.attr({'type': 'checkbox', 'checked': true, 'id': name});
        } else {
            input.attr({'type': 'checkbox', 'checked': false, 'id': name});
        }
        div.append(input);
        input.change(function () {
            onChangeInSetupIndigo();
        });
    }
    createHtmlElement(values, name, container, func) {
        func(values, name, container);
        container.append(name);
        container.append($('<br>'));
    }
    fillHtmlContainer(container) {
        this.props.opts = opts;
          this.state.opts = {
            'render-bond-ids-visible': true,
            'hide-chiral': true
          }
        container.empty();
        for (i = 0; i < opts.length; i++)
            createHtmlElement(opts[i].defaultValue, opts[i].name, container, createHtmlCheckbox);
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
                        <input type="checkbox" class="menu" id="atoms" checked></input>
                            <label for="atoms">Atoms</label>
                                <ul>
                                    <li><output>Atom label margin</output></li>
                                    <li><output>Auto-reset tool Strip to C</output></li>
                                </ul>
                    </li>
                    <li class="has-children">
                        <input type="checkbox" class="menu" id="attachedData" checked></input>
                            <label for="attachedData">Attached data</label>
                                <ul>
                                    <li><output>Diplay attached data</output></li>
                                </ul>
                    </li>
                    <li class="has-children">
                        <input type="checkbox" class="menu" id="bonds" checked></input>
                            <label for="bonds">Bonds</label>
                                <ul>
                                    <li><output>Aromatic bond as circle</output></li>
                                    <li><output>Bond thickness</output></li>
                                </ul>
                    </li>
                    <li class="has-children">
                        <input type="checkbox" class="menu" id="chemul" checked></input>
                            <label for="chemul">Chemul</label>
                                <ul>
                                    { test() }
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

function test() {
    var opts = [
        {name: 'render-atom-ids-visible',
        type: 'boolean',
        defaultValue: false,
        tab: 'chemul'},
        {name: 'render-bond-ids-visible',
        type: 'boolean',
        defaultValue: false,
        tab: 'chemul'}
    ]

    var stationComponents = opts.map(function(station) {
            return (
            <li>
                <output>Some text</output>
                <select>
                <option value="">on</option>
                <option value="" selected="selected">off</option>
                </select>
            </li>);
        });
    return <div>{stationComponents}</div>;
}


export default function dialog(params) {
    var overlay = $$('.overlay')[0];
    var t = test();
    console.info('test', test);
    return render((
        <OpenSettings params={params}/>
    ), overlay);
};