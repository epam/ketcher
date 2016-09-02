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
            if (this.defOpts[i].type === "boolean") {
                this.defOpts[i].values = ["on", "off"];
                if (this.defOpts[i].defaultValue === true)
                    this.defOpts[i].defaultValue = "on";
                else
                    this.defOpts[i].defaultValue = "off";
            }
            tmp[this.defOpts[i].name] = this.defOpts[i].defaultValue;
        }

        tmp = Object.assign(tmp, props.opts, JSON.parse(localStorage.getItem("ketcher-opts")));
        this.setState({opts: tmp});

        this.changeState = this.changeState.bind(this);
        this.saveState = this.saveState.bind(this);
        this.createSelectList = this.createSelectList.bind(this);
        this.load = this.load.bind(this);
    }
    result () {
        var opts = {};
        for (var key in this.state.opts) {
          if (this.state.opts.hasOwnProperty(key)) {
            if (this.state.opts[key] === "on")
                opts[key] = true;
            else if (this.state.opts[key] === "off")
                opts[key] = false;
            else
                opts[key] = this.state.opts[key];
          }
        }
        return {
            opts: opts,
            localStorageOpts: this.state.opts
        };
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
         tmp[ev.target.id] = ev.target.value;
         this.state.opts = Object.assign(this.state.opts, tmp);
    }

    createSelectList(f, values, type, name, label) {
        var opts = this.state.opts;
        var listComponents = values.map(function(value) {
            return ( <option value={value}> {value} </option>);
        });
        return (
            <li>
                <output> { label } </output>
                <select  id={name} onChange = { ev => f(ev, name) } value = {this.state.opts[name]}>{listComponents}</select>
            </li>
        );
    }

    draw(opts, tab) {
        var state = this.state;
        var changeState = this.changeState;
        var createSelectList = this.createSelectList;
        var optsComponents = opts.map(function(elem) {
            if (elem.tab === tab) {
                return (
                    createSelectList(changeState, elem.values, elem.type, elem.name, elem.label)
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
                            <label for="atoms">Options for debugging</label>
                                <ul>
                                    { this.draw(this.defOpts, "debug") }
                                </ul>
                    </li>
                    <li class="has-children">
                        <input type="checkbox" class="menu" id="bonds" checked></input>
                            <label for="bonds">Rendering customization options</label>
                                <ul>
                                    { this.draw(this.defOpts, "render") }
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
