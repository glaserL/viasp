import React from "react";
import {make_atoms_string, make_rules_string} from "../utils/index";
import PropTypes from "prop-types";
import {NODE, SIGNATURE, TRANSFORMATION} from "../types/propTypes";
import {useSettings} from "../contexts/Settings";

function SuggestionContent(props) {
    const {value} = props;
    const {state} = useSettings()
    let className = "";
    let display = "UNKNOWN FILTER"

    if (value._type === "Node") {
        className = "search_node"
        display = make_atoms_string(state.show_all ? value.atoms : value.diff)
    }
    if (value._type === "Signature") {
        className = "search_signature"
        display = `${value.name}/${value.args}`
    }

    if (value._type === "Transformation") {
        className = "search_transformation"
        display = make_rules_string(value.rules)
    }
    return <span className={className}>{display}</span>
}


SuggestionContent.propTypes = {
    /**
     * The Search Result to be displayed, either a Transformation, a Node or a Signature
     */
    value: PropTypes.oneOfType([
        SIGNATURE,
        TRANSFORMATION,
        NODE
    ]),
}

export function Suggestion(props) {
    const {value, active, select} = props;

    const classes = ["search_row"];
    if (active) {
        classes.push("active")
    }
    return <li className={classes.join(" ")} renameme={value} onClick={() => select(value)}><SuggestionContent
        value={value}/>
    </li>

}

Suggestion.propTypes = {
    /**
     * The Search Result to be displayed, either a Transformation, a Node or a Signature
     */
    value: PropTypes.oneOfType([
        SIGNATURE,
        TRANSFORMATION,
        NODE
    ]),
    /**
     *  Whether the result is highlighted or not.
     */
    active: PropTypes.bool,
    /**
     *  onClick Callback
     */
    select: PropTypes.func
}
