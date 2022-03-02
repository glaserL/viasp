import React, {useState} from "react";
import PropTypes from "prop-types";
import styles from './row.css'
import styled from 'styled-components';
import {useColorPalette} from "../contexts/ColorPalette";

const ColoredRowHeaderToggle = styled.div`
color: ${props => props.colorPalette.ten};
backgroundColor: ${props => props.colorPalette.sixty};
    width: -moz-fit-content;
    width: fit-content;
&:hover {
    color: ${props => props.colorPalette.sixty}; 
    backgroundColor: ${props => props.colorPalette.ten};
  };
`


export function RowHeader(props) {
    const {rule, onToggle, contentIsShown} = props;
    const colorPalette = useColorPalette();
    const hideOrShowButton = contentIsShown ? "hide" : "show"
    return <div className="row_header">
        <div className="row_header_bar" style={{"backgroundColor": colorPalette.sixty}}>
            <ColoredRowHeaderToggle colorPalette={colorPalette}>
                <div className={"row_toggle noselect"} onClick={onToggle}>{hideOrShowButton}</div>
            </ColoredRowHeaderToggle>
        </div>
        <div style={{"backgroundColor": colorPalette.sixty, "color": colorPalette.thirty}}
             className="row_header_rule">{rule}
        </div>
    </div>
}

RowHeader.propTypes = {
    /**
     * The rule string to be displayed in the header
     */
    rule: PropTypes.array,
    /**
     * Whether the user has decided to show or hide the content of the row
     */
    contentIsShown: PropTypes.bool,

    /**
     * A callback function when the user clicks on the RuleHeader
     */
    onToggle: PropTypes.func
};
