import React from "react";
import {make_atoms_string} from "../utils/index";
import './node.css'
import PropTypes from "prop-types";
import {ShowAllContext} from "../contexts/ShowAllProvider";

export function Node(props) {

    const [state] = React.useContext(ShowAllContext)

    const {id, notifyClick} = props;
    let atomString = ""
    if (state.show_all) {
        atomString = make_atoms_string(id.atoms)
    } else {
        atomString = make_atoms_string(id.diff)
    }
    atomString = atomString.length === 0 ? "Ø" : atomString;
    const classNames = `set_container ${id.uuid}`
    return <div className={classNames} onClick={() => notifyClick(id)}>
        <div className={"set_value"}>{atomString}</div>
    </div>
}


Node.propTypes = {
    id: PropTypes.exact({
        diff: PropTypes.array,
        atoms: PropTypes.array,
        uuid: PropTypes.string,
        _type: PropTypes.string,
        rule_nr: PropTypes.number
    }),
    notifyClick: PropTypes.func
}

