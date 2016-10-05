import { h, Component, render } from 'preact';
/** @jsx h */

import fs from 'filesaver.js';
import Dialog from '../component/dialog';
import defaultOptions from './options';
import Render from '../../render'

class OpenSettings extends Component {
     constructor(props) {
        super(props);
        this.defOpts = defaultOptions();

        this.state = {
            onlyCurrentSession: false
        }

        var opts = this.getDefOpts (this.defOpts);
        opts = Object.assign(opts, props.opts, JSON.parse(localStorage.getItem("ketcher-opts")));
        this.setState({opts: opts});

        this.changeState = this.changeState.bind(this);
        this.saveState = this.saveState.bind(this);
        this.createSelectList = this.createSelectList.bind(this);
        this.load = this.load.bind(this);
    }

    getDefOpts (defOpts) {
        var tmp = {};
        for (var i = 0; i < defOpts.length; i++) {
            if (defOpts[i].type === "boolean") {
                this.defOpts[i].values = ["on", "off"];
                if (defOpts[i].defaultValue === true)
                    defOpts[i].defaultValue = "on";
                else
                    defOpts[i].defaultValue = "off";
            }
            tmp[defOpts[i].name] = defOpts[i].defaultValue;
        }

        return tmp;

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
            localStorageOpts: this.state.opts,
            onlyCurrentSession: this.state.onlyCurrentSession
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
            <tr>
				<td><output> { label } </output></td>
                <td><select id={name} onChange = { ev => f(ev, name) } value = {this.state.opts[name]}>{listComponents}</select></td>
            </tr>
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
        return <table className="settings-table"> {optsComponents} </table>;
    }

    reset(ev) {
        var opts = this.getDefOpts (this.defOpts);
        this.setState({opts: opts});
    }

    apply(ev) {
        this.setState({onlyCurrentSession: true});
    }

    render (props, state) {
        return (
            <Dialog caption="Settings"
                    name="open-settings" params={props.params}
                    result={() => this.result()}
                     buttons={[
                     <div className="choose-wrapper">
                     	<div className="choose-file">
                     		<input id="input-file" type="file" onChange={ ev => this.uploadSettings(ev) }/>
                     		<label for="input-file">Choose file ...</label>
                     	</div>
                     	<span>{state.file ? state.file.name : ''}</span>
                     </div>,
                     <button onClick={ ev => this.load(ev) }>Load</button>,
                     <button onClick={ ev => this.saveState(ev) }>Save as...</button>,
                     <button onClick={ ev => this.reset(ev) }>Reset</button>,
                     "OK", "Cancel"]} >
            <div className="accordion-wrapper">
                <ul class="accordion-menu">
                    <li className="has-children">
                        <input type="checkbox" className="menu" id="bonds"></input>
						<label for="bonds">Rendering customization options</label>
						<ul>
							{ this.draw(this.defOpts, "render") }
						</ul>
                    </li>
					<li className="has-children">
						<input type="checkbox" className="menu" id="atoms" checked></input>
						<label for="atoms">Options for debugging</label>
						<ul>
							{ this.draw(this.defOpts, "debug") }
						</ul>
					</li>
                </ul>
				<label className="current">
					<input type="checkbox" onChange={ ev => this.apply(ev) }></input>
					Apply settings only for current session
				</label>
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
