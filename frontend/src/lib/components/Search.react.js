import React, {useEffect, useState} from 'react';
import "./search.css";
import {SearchResult} from "./SearchResult.react";
import PropTypes from "prop-types";
import {useHighlightedNode} from "../contexts/HighlightedNode";
import {useSettings} from "../contexts/Settings";

const KEY_DOWN = 40;
const KEY_UP = 38;
const KEY_ENTER = 13;

export function Search() {
    const [activeSuggestion, setActiveSuggestion] = useState(0);
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [userInput, setUserInput] = useState("");
    const [, setHighlightedNode] = useHighlightedNode();
    const {backendURL} = useSettings();
    let suggestionsListComponent;
    useEffect(() => {
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

    function handleSubmit(event) {
        event.preventDefault();
    }

    function onClick(e) {
        setActiveSuggestion(0)
        setFilteredSuggestions([])
        setShowSuggestions(false)
        setUserInput(e.currentTarget.innerText)
    }

    function onKeyDown(e) {

        if (e.keyCode === KEY_ENTER) {
            setActiveSuggestion(0);
            setShowSuggestions(false);
            setUserInput("");
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
                                             value={suggestion} onClick={onClick}/>
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
