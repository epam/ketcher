import { h, Component, render } from 'preact';
/** @jsx h */

import fs from 'filesaver.js';
import Dialog from './dialog';
import defaultOptions from './options';

class OpenSettings extends Component {
     constructor(props) {
        super(props);
        this.props.opts = defaultOptions();
        var tmp = {};
        for (var i = 0; i < this.props.opts.length; i++) {
            tmp[this.props.opts[i].name] = this.props.opts[i].defaultValue;
        }
        this.setState(tmp);
        //Object.assign... from localstorage
        console.log("state", this.state);

        this.changeState = this.changeState.bind(this);
        this.saveState = this.saveState.bind(this);
    }
    result () {
        return `Yo!`;
    }
    uploadSettings(ev) {
        this.setState({
                file: ev.target.files[0]
        });
    }
    load (ev) {
        var file = toString(this.state.file);
        var userOpts = file.split('},');
        console.log("userOpts: ", userOpts)
        //
        //this.props.opts = Object.assign(this.props.opts, userOpts);
    }

    saveState(ev) {
        var state = this.state;
        var currentState = {};

        Object.keys(state).forEach(function (option) {
            //console.log("state1", state);
           //console.info(option + " " + state[option]);

            // currentState[i] = {};
            // currentState[i][option.name] = option.value;
            currentState[option] = state[option];
        });
       // for (i = 0; i < currentState.length; i++)
            //console.info("currentState " + JSON.stringify(currentState));

       var blob = new Blob([JSON.stringify(currentState)], {type: 'application/json'});
       fs.saveAs(blob, 'ketcher1');
    }

    changeState(ev) {
        console.log("ev", ev.target.id);
        console.log("state1", this.state);
        console.log("11111111111");
        var tmp = {};
        tmp[ev.target.id] = ev.target.value;
        Object.assign(this.state, tmp);
        console.log("state1", this.state);
        console.log("22222222222");
    }

    createSelectListItem(f, values, defaultOption, name) {
        var listComponents = values.map(function(value) {
            var booleanValue = false;
            if (value === "on")
                booleanValue = true;

            if (value === defaultOption) {
                return ( <option value={booleanValue} selected="selected" > {value} </option>);
            } else {
                return ( <option value={booleanValue}> {value} </option>);
            }
        });
        return (
            <li>
                <output> { name } </output>
                <select  id={name} onChange = { ev => f(ev, name) }>{listComponents}</select>
            </li>
            );
    }

    test(opts, tab) {
        var f = this.changeState;
        var createItem = this.createSelectListItem;
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
                    createItem(f, values, defaultValue, elem.name)
                );
            }
        });
        return <div>{optsComponents}</div>;
    }

    render (props) {
        return (
            <Dialog caption="Settings"
                    name="open-settings" params={props.params}
                    result={() => this.result()}
                     buttons={[
                        <input type="file" onChange={ ev => this.uploadSettings(ev) }/>,
                        <button onClick={ ev => this.load(ev) }>Load</button>,
                        <button onClick={ ev => this.saveState(ev) }>Save as...</button>,
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
                                    { this.test(props.opts, "atoms") }
                                </ul>
                    </li>
                    <li class="has-children">
                        <input type="checkbox" class="menu" id="attachedData" checked></input>
                            <label for="attachedData">Attached data</label>
                                <ul>
                                    { this.test(props.opts, "attachedData") }
                                </ul>
                    </li>
                    <li class="has-children">
                        <input type="checkbox" class="menu" id="bonds" checked></input>
                            <label for="bonds">Bonds</label>
                                <ul>
                                    { this.test(props.opts, "bonds") }
                                </ul>
                    </li>
                    <li class="has-children">
                        <input type="checkbox" class="menu" id="scaling" checked></input>
                            <label for="scaling">Scaling</label>
                                <ul>
                                    { this.test(props.opts, "scaling") }
                                </ul>
                    </li>
                    <li class="has-children">
                        <input type="checkbox" class="menu" id="chemul" checked></input>
                            <label for="chemul">Chemul</label>
                                <ul>
                                    { this.test(props.opts, "chemul") }
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
