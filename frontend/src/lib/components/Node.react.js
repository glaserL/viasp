import React, {Component} from "react";
import {make_atoms_string} from "./util";
import './node.css'

export class Node extends Component {

    constructor(props, context) {
        super(props, context);

        this.state = {
            externalData: null,
            error: null,
        };
    }


    render() {
        const {id, notifyClick} = this.props;
        let atomString = make_atoms_string(id.diff)
        atomString = atomString.length === 0 ? "Ø" : atomString;
        const classNames = `set_container ${id.uuid}`
        return <div className={classNames} onClick={() => notifyClick(id)}>
            <div className={"set_value"}>{atomString}</div>
        </div>
    }

}

