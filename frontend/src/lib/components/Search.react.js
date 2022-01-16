import React, {Component, useState} from 'react';
import {backendURL} from "../utils/index";
import "./search.css";
import {SearchResult} from "./SearchResult.react";
import PropTypes, {func} from "prop-types";


// https://blog.logrocket.com/build-react-autocomplete-component/


export function Search(props) {
    const [activeSuggestion, setActiveSuggestion] = useState(0);
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [userInput, setUserInput] = useState("");

    let suggestionsListComponent;

    function onChange(e) {
        const userInput = e.currentTarget.value;

        // Filter our suggestions that don't contain the user's input

        fetch(`${backendURL("query")}?q=` + userInput)
            .then(r => r.json())
            .then(data => {
                setActiveSuggestion(0)
                setFilteredSuggestions(data)
                setShowSuggestions(true)
                setUserInput(userInput)
                console.log(`Saved ${data.length} suggestions.`)
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

        // User pressed the enter key
        if (e.keyCode === 13) {
            setActiveSuggestion(0);
            setShowSuggestions(false);
            setUserInput("");
        }
        // User pressed the up arrow
        else if (e.keyCode === 38) {

            if (activeSuggestion === 0) {
                return;
            }
            setActiveSuggestion(activeSuggestion - 1);
        }
        // User pressed the down arrow
        else if (e.keyCode === 40) {
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
                <div className="no-suggestions">
                    <em>No suggestions, you're on your own!</em>
                </div>
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
