import React from 'react';
import "./search.css";
import {SearchResult} from "./SearchResult.react";
import PropTypes from "prop-types";
import {useHighlightedNode} from "../contexts/HighlightedNode";
import {useSettings} from "../contexts/Settings";
import {addSignature, clear, useFilters} from "../contexts/Filters";
import {NODE, SIGNATURE, TRANSFORMATION} from "../types/propTypes";
import {showOnlyTransformation, useTransformations} from "../contexts/transformations";


const KEY_DOWN = 40;
const KEY_UP = 38;
const KEY_ENTER = 13;

function ActiveFilters() {
    const [{activeFilters},] = useFilters();
    return <ul className="active_filters_list">{activeFilters.map(function (filter, index) {
        return <ActiveFilter key={index} filter={filter}/>
    })}</ul>

}

function CloseButton(props) {
    const {onClose} = props;
    return <span className='close' onClick={onClose}>X</span>
}

CloseButton.propTypes = {
    /**
     * The function to call when the close button is clicked.
     */
    onClose: PropTypes.func
}

function ActiveFilter(props) {
    const {filter} = props;
    const [, dispatch] = useFilters();
    const classes = ["filter", "search_row"]
    if (filter._type === "Transformation") {
        classes.push("search_rule")
    }
    if (filter._type === "Node") {
        classes.push("search_node")
    }
    if (filter._type === "Signature") {
        classes.push("search_signature")
    }

    function onClose() {
        dispatch(clear(filter))
    }

    return <li className={classes.join(" ")} key={filter.name}>{filter.name}<CloseButton onClose={onClose}/>
    </li>
}

ActiveFilter.propTypes = {
    filter: PropTypes.oneOfType([TRANSFORMATION, NODE, SIGNATURE])
}


export function Search() {
    const [activeSuggestion, setActiveSuggestion] = React.useState(0);
    const [filteredSuggestions, setFilteredSuggestions] = React.useState([]);
    const [showSuggestions, setShowSuggestions] = React.useState(false);
    const [userInput, setUserInput] = React.useState("");
    const [, setHighlightedNode] = useHighlightedNode();
    const [, dispatch] = useFilters();
    const {dispatch: dispatchT} = useTransformations()
    const {backendURL} = useSettings();
    let suggestionsListComponent;
    React.useEffect(() => {
        const highlighted = filteredSuggestions[activeSuggestion]

        if (highlighted && highlighted._type === "Node") {
            setHighlightedNode(highlighted.uuid);
        }
    }, [activeSuggestion])

    function onChange(e) {
        const userInput = e.currentTarget.value;
        fetch(`${backendURL("query")}?q=` + userInput)
            .then(r => r.json())
            .then(data => {
                setActiveSuggestion(0)
                setFilteredSuggestions(data)
                setShowSuggestions(true)
                setUserInput(userInput)
            })
    }


    function select(transformation) {
        handleSelection(transformation)
        reset()
    }

    function handleSelection(selection) {
        if (selection._type === "Signature") {
            dispatch(addSignature(selection))
        }
        if (selection._type === "Node") {

        }
        if (selection._type === "Transformation") {
            dispatchT(showOnlyTransformation(selection))
        }
    }

    function reset() {
        setActiveSuggestion(0)
        setFilteredSuggestions([])
        setShowSuggestions(false)
        setUserInput("")
    }

    function onKeyDown(e) {
        if (e.keyCode === KEY_ENTER) {
            select(filteredSuggestions[activeSuggestion])
            setHighlightedNode(null);
        } else if (e.keyCode === KEY_UP) {

            if (activeSuggestion === 0) {
                return;
            }
            setActiveSuggestion(activeSuggestion - 1);
        } else if (e.keyCode === KEY_DOWN) {
            if (activeSuggestion - 1 === filteredSuggestions.length) {
                return;
            }
            setActiveSuggestion(activeSuggestion + 1);
        }
    }

    if (showSuggestions && userInput) {
        if (filteredSuggestions.length) {
            suggestionsListComponent = (
                <ul className="search_result_list">
                    {filteredSuggestions.map((suggestion, index) => {
                        return <SearchResult active={index === activeSuggestion} key={index}
                                             value={suggestion} select={select}/>
                    })}
                </ul>
            );
        } else {
            suggestionsListComponent = (
                <div className="no-suggestions"/>
            );
        }
    }
    return (
        <div className="search">
            {suggestionsListComponent}
            <ActiveFilters/>
            <input
                type="text"
                onChange={onChange}
                onKeyDown={onKeyDown}
                value={userInput}
            />
        </div>
    );
}


Search.propTypes = {
    /**
     * The ID used to identify this component in Dash callbacks.
     */
    id: PropTypes.string

}
