import React, {Component} from "react";
import PropTypes from "prop-types";


export function RowHeader(props) {
    const {rule, onToggle} = props;
    return <div onClick={onToggle} className="row_header">{rule}</div>
}

RowHeader.propTypes = {
    /**
     * The rule string to be displayed in the header
     */
    rule: PropTypes.array,

    /**
     * A callback function when the user clicks on the RuleHeader
     */
    onToggle: PropTypes.func
};
