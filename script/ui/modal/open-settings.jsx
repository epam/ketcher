import { h, Component, render } from 'preact';
/** @jsx h */

import fs from 'filesaver.js';
import Dialog from './dialog';
import defaultOptions from './options';
import Render from '../../render'

class OpenSettings extends Component {
     constructor(props) {
        super(props);
        this.defOpts = defaultOptions();
        var tmp = {};
        for (var i = 0; i < this.defOpts.length; i++) {
            tmp[this.defOpts[i].name] = this.defOpts[i].defaultValue;
        }

        //tmp = Object.assign(tmp, props.opts, JSON.parse(localStorage.getItem("opts")));
        tmp = Object.assign(tmp, JSON.parse(localStorage.getItem("opts")));
        this.setState({opts: tmp});

        this.changeState = this.changeState.bind(this);
        this.saveState = this.saveState.bind(this);
        this.createSelectListItem = this.createSelectListItem.bind(this);
        this.load = this.load.bind(this);
    }
    result () {
        return this.state.opts;
    }
    uploadSettings(ev) {
        this.setState({
                file: ev.target.files[0]
        });
    }

    load (ev) {
        var reader = new FileReader();
        reader.readAsText(this.state.file);
        reader.onload = function() {
            var userOpts = JSON.parse(reader.result);
            var currentState = Object.assign(this.state.opts, userOpts);
            this.setState({opts: currentState});
        }.bind(this);
    }

    saveState(ev) {
        var state = this.state.opts;
        var currentState = {};

        Object.keys(state).forEach(function (option) {
            currentState[option] = state[option];
        });
       var blob = new Blob([JSON.stringify(currentState)], {type: 'application/json'});
       fs.saveAs(blob, 'ketcher-settings');
    }

    changeState(ev) {
         var tmp = {};
         console.log(ev.target.name, "ev.target.value", ev.target.value);
         tmp[ev.target.id] = ev.target.value;
         //this.state.opts = Object.assign(this.state.opts, tmp);
         this.setState({opts: Object.assign(this.state.opts, tmp)});
    }

    createSelectListItem(f, values, type, name) {
        var opts = this.state.opts;
        //console.log("values", values);
        var listComponents = values.map(function(value) {
            // var booleanValue = false;
            // if (value === "on")
            //     booleanValue = true;
            // return ( <option value={booleanValue}> {value} </option>);
            var strValue;
            if (type === "boolean") {
                strValue = "off";
                if (value === true)
                    strValue = "on";
            } else {
                strValue = value;
            }
            return ( <option value={value}> {strValue} </option>);
        });
        //console.log(name, this.state.opts[name])
        return (
            <li>
                <output> { name } </output>
                <select  id={name} onChange = { ev => f(ev, name) } value = {this.getValue(this.state.opts[name], type)}>{listComponents}</select>
            </li>
            );
    }

    getValue (opt, type) {
        if(type == "boolean") {
            //console.log("opt", opt, type);
            if (Boolean(opt) == true)
                return "on";
            //else
                return "off";
        } else {
            return opt;
        }
    }

    draw(opts, tab) {
        var state = this.state;
        var f = this.changeState;
        var createItem = this.createSelectListItem;
        var optsComponents = opts.map(function(elem) {
            var values;
            var defaultValue;
            // if (elem.type === 'boolean') {
            //     // values = elem.values;
            //     // defaultValue = elem.defaultValue;
            //     // console.log(elem.name + " values:" + values + " defaultValue:");
            //     values = ['on', 'off'];
            //     if (elem.defaultValue === true)
            //         defaultValue = "on";
            //      else
            //         defaultValue = "off";
            //     // values = elem.values;
            //     // defaultValue = state.opts[elem.name];
            // } else{
            //     values = elem.values;
            //     defaultValue = elem.defaultValue;
            //     //defaultValue = state.opts[elem.name];
            //     //console.log("defaultValue", state.opts[elem.name]);
            // 
            if (elem.type === 'boolean')
                values = [true, false];
            else
                values = elem.values;

            if (elem.tab === tab) {
                return (
                    createItem(f, values, elem.type, elem.name)
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
                        "OK", "Cancel"]}>
            <div>
                <ul class="accordion-menu">
                    <li class="has-children">
                        <input type="checkbox" class="menu" id="atoms" checked></input>
                            <label for="atoms">Atoms</label>
                                <ul>
                                    { this.draw(this.defOpts, "atoms") }
                                </ul>
                    </li>
                    <li class="has-children">
                        <input type="checkbox" class="menu" id="attachedData" checked></input>
                            <label for="attachedData">Attached data</label>
                                <ul>
                                    { this.draw(this.defOpts, "attachedData") }
                                </ul>
                    </li>
                    <li class="has-children">
                        <input type="checkbox" class="menu" id="bonds" checked></input>
                            <label for="bonds">Bonds</label>
                                <ul>
                                    { this.draw(this.defOpts, "bonds") }
                                </ul>
                    </li>
                    <li class="has-children">
                        <input type="checkbox" class="menu" id="scaling" checked></input>
                            <label for="scaling">Scaling</label>
                                <ul>
                                    { this.draw(this.defOpts, "scaling") }
                                </ul>
                    </li>
                    <li class="has-children">
                        <input type="checkbox" class="menu" id="chemul" checked></input>
                            <label for="chemul">Chemul</label>
                                <ul>
                                    { this.draw(this.defOpts, "chemul") }
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
