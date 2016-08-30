import { h, Component, render } from 'preact';
/** @jsx h */

import fs from 'filesaver.js';
import Dialog from './dialog';
import defaultOptions from './options';
import Render from '../../render'

class OpenSettings extends Component {
     constructor(props) {
        super(props);
        this.props.opts = defaultOptions();
        var tmp = {};
        for (var i = 0; i < this.props.opts.length; i++) {
            tmp[this.props.opts[i].name] = this.props.opts[i].defaultValue;
        }
        tmp = Object.assign(tmp,  JSON.parse(localStorage.getItem("opts")));
        this.setState({opts: tmp});

        this.changeState = this.changeState.bind(this);
        this.saveState = this.saveState.bind(this);
        this.createSelectListItem = this.createSelectListItem.bind(this);
        this.load = this.load.bind(this);
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
        var reader = new FileReader();
        reader.readAsText(this.state.file);
        reader.onload = function() {
            var userOpts = JSON.parse(reader.result);
            var currentState = Object.assign(this.state.opts, userOpts);
            this.setState({opts: currentState});

            localStorage.setItem("opts",  JSON.stringify(this.state.opts)); //?
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
         localStorage.setItem("opts",  JSON.stringify(this.state.opts));

        //$('#canvas').empty();
        var clientArea = $('#canvas')[0];
        var render = new Render(clientArea, this.state.opts.bondLength, this.state.opts);
        // getFile().then(function (struct) {
        //     $('.loader')[0].style.display = 'none';
        //     render.setMolecule(struct);
        //     render.update();
        // }, function (err) {
        //     console.log('Error: ' + err);
        // });

    }

    createSelectListItem(f, values, type, name) {
        var opts = this.state.opts;
        var listComponents = values.map(function(value) {
            var booleanValue = false;
            if (value === "on")
                booleanValue = true;
            return ( <option value={booleanValue}> {value} </option>);
        });
        return (
            <li>
                <output> { name } </output>
                <select  id={name} onChange = { ev => f(ev, name) } value = {this.getValue(this.state.opts[name], type)}>{listComponents}</select>
            </li>
            );
    }

    getValue (opt, type) {
        if(type == "boolean") {
            if (opt == true)
                return "on";
            else
                return "off";
        } else {
            return opt;
        }
    }

    test(opts, tab) {
        var state = this.state;
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
                // values = elem.values;
                // defaultValue = state.opts[elem.name];
            } else{
                values = elem.values;
                defaultValue = elem.defaultValue;
                //defaultValue = state.opts[elem.name];
                //console.log("defaultValue", state.opts[elem.name]);
            }
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
