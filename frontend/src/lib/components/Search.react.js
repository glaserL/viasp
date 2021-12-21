import React, {Component} from 'react';
import {backendURL} from "../utils/index";
import "./search.css";
import {SearchResult} from "./SearchResult.react";
import PropTypes from "prop-types";

export class Search extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // The active selection's index
            activeSuggestion: 0,
            // The suggestions that match the user's input
            filteredSuggestions: [],
            // Whether or not the suggestion list is shown
            showSuggestions: false,
            // What the user has entered
            userInput: ""
        };
    }

    render() {
        const {
            onChange,
            onClick,
            onKeyDown,
            state: {
                activeSuggestion,
                filteredSuggestions,
                showSuggestions,
                userInput
            }
        } = this;

        let suggestionsListComponent;
        console.log(`I have ${filteredSuggestions.length} suggestions to display`)

        if (showSuggestions && userInput) {
            if (filteredSuggestions.length) {
                suggestionsListComponent = (
                    <ul className="search_result_list">
                        {filteredSuggestions.map((suggestion, index) => {
                            // Flag the active suggestion with a class
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


    onChange = e => {
        const userInput = e.currentTarget.value;

        // Filter our suggestions that don't contain the user's input

        fetch(`${backendURL("query")}?q=` + userInput)
            .then(r => r.json())
            .then(data => {
                console.log("LOOK AT ME")
                this.setState({
                    activeSuggestion: 0,
                    filteredSuggestions: data,
                    showSuggestions: true,
                    userInput: userInput
                })
                console.log(`Saved ${data.length} suggestions.`)
            })
    };

    onClick = e => {
        this.setState({
            activeSuggestion: 0,
            filteredSuggestions: [],
            showSuggestions: false,
            userInput: e.currentTarget.innerText
        });
    };

    onKeyDown = e => {
        const {activeSuggestion, filteredSuggestions} = this.state;

        // User pressed the enter key
        if (e.keyCode === 13) {
            this.setState({
                activeSuggestion: 0,
                showSuggestions: false,
                userInput: filteredSuggestions[activeSuggestion]
            });
        }
        // User pressed the up arrow
        else if (e.keyCode === 38) {
            if (activeSuggestion === 0) {
                return;
            }

            this.setState({activeSuggestion: activeSuggestion - 1});
        }
        // User pressed the down arrow
        else if (e.keyCode === 40) {
            if (activeSuggestion - 1 === filteredSuggestions.length) {
                return;
            }

            this.setState({activeSuggestion: activeSuggestion + 1});
        }
    };

    handleSubmit(event) {
        event.preventDefault();
    }


}

Search.propTypes = {
    /**
     * The ID used to identify this component in Dash callbacks.
     */
    id: PropTypes.string

}
