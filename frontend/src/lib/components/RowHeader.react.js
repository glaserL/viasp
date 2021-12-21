import React, {Component} from "react";
import PropTypes from "prop-types";

export class RowHeader extends Component {
    constructor(props, context) {
        super(props, context);
    }


    render() {
        const {rule, onToggle} = this.props;
        return <div onClick={onToggle} className="row_header">{rule}</div>
    }

}

RowHeader.propTypes = {
    /**
     * The rule string to be displayed in the header
     */
    rule: PropTypes.string,

    /**
     * A callback function when the user clicks on the RuleHeader
     */
    onToggle: PropTypes.func
};
