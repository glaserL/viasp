import React, {useState} from "react";
import PropTypes from "prop-types";


export function RowHeader(props) {
    const {rule, onToggle, contentIsHidden} = props;
    const hideOrShowButton = contentIsHidden ? "hide" : "show"
    const [showClose, setShowClose] = useState(false);
    return <div className="row_header">
        <div className="row_header_bar">
            <div className={"row_toggle"} onClick={onToggle}>{hideOrShowButton}</div>
        </div>
        <div className="row_header_rule">{rule}</div>
    </div>
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
