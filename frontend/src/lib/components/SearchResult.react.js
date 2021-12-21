import React, {Component} from "react";
import {make_atoms_string, make_rules_string} from "../utils/index";
import PropTypes from "prop-types";


export class SearchResult extends Component {
    render() {
        const {value, active, onClick} = this.props;
        const classes = ["search_row"];
        console.log(value)
        let display = "UNKNOWN FILTER"
        if (active) {
            classes.push("active");
        }

        if (value._type === "Node") {
            classes.push("search_set")
            display = make_atoms_string(value.atoms)
        }
        if (value._type === "Signature") {
            classes.push("search_signature")
            display = `${value.name}/${value.args}`
        }

        if (value._type === "Transformation") {
            classes.push("search_transformation")
            display = make_rules_string(value.rules)
        }
        const className = classes.join(" ")
        return <li className={className} onClick={onClick}>{display}</li>
    }
}

SearchResult.propTypes = {
    /**
     * The Search Result to be displayed, either a Transformation, a Node or a Signature
     */
    value: PropTypes.oneOfType([
        PropTypes.exact({
            _type: PropTypes.string,
            name: PropTypes.string,
            args: PropTypes.number
        }),
        PropTypes.exact({
            _type: PropTypes.string,
            rules: PropTypes.string
        }),
        PropTypes.exact({
            _type: PropTypes.string,
            atoms: PropTypes.array
        })
    ]),
    /**
     *  Whether the result is highlighted or not.
     */
    active: PropTypes.bool,
    /**
     *  onClick Callback
     */
    onClick: PropTypes.func
}
