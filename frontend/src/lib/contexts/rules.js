import {showError, useMessages} from "./UserMessages";
import {useSettings} from "./Settings";
import React from "react";
import PropTypes from "prop-types";

function fetchRules(backendURL) {
    return fetch(`${backendURL("rules")}`).then(r => {
        if (r.ok) {
            return r.json()
        }
        throw new Error(r.statusText);

    });
}

const initialState = {
    rules: [],
};

const HIDE_RULE = 'APP/RULES/HIDE';
const SHOW_RULE = 'APP/RULES/SHOW';
const TOGGLE_RULE = 'APP/RULES/TOGGLE';
const ADD_RULE = 'APP/RULES/ADD';
const hideRule = (rule) => ({type: HIDE_RULE, rule})
const showRule = (rule) => ({type: SHOW_RULE, rule})
const toggleRule = (rule) => ({type: TOGGLE_RULE, rule})
const addRule = (rule) => ({type: ADD_RULE, rule})
const RulesContext = React.createContext();

const rulesReducer = (state = initialState, action) => {
    if (action.type === ADD_RULE) {
        return {...state, rules: state.rules.concat({rule: action.rule, shown: true})}
    }
    if (action.type === SHOW_RULE) {
        return {
            ...state,
            rules: state.rules.map(container => container.rule === action.rule ? {
                rule: container.rule,
                shown: true
            } : container)
        }
    }
    if (action.type === HIDE_RULE) {
        return {
            ...state,
            rules: state.rules.map(container => container.rule === action.rule ? {
                rule: container.rule,
                shown: false
            } : container)
        }
    }
    if (action.type === TOGGLE_RULE) {
        return {
            ...state,
            rules: state.rules.map(container => container.rule === action.rule ? {
                rule: container.rule,
                shown: !container.shown
            } : container)
        }
    }
    return {...state}
}

const RulesProvider = ({children}) => {
    const [, message_dispatch] = useMessages()
    const {backendURL} = useSettings();
    const [state, dispatch] = React.useReducer(rulesReducer, initialState);

    React.useEffect(() => {
        let mounted = true;
        fetchRules(backendURL).catch(error => {
            message_dispatch(showError(`Failed to get rules: ${error}`))
        })
            .then(items => {
                console.log(`Setting ${items.length} `)
                if (mounted) {
                    items.map((rule) => (dispatch(addRule(rule))))
                }
            })
        return () => mounted = false;
    }, []);
    return <RulesContext.Provider value={{state, dispatch}}>{children}</RulesContext.Provider>
}

const useRules = () => React.useContext(RulesContext);

RulesProvider.propTypes = {
    children: PropTypes.element,
}
export {RulesProvider, RulesContext, useRules, toggleRule}
