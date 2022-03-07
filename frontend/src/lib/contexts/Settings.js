// https://www.thisdot.co/blog/creating-a-global-state-with-react-hooks
import React from "react"
import PropTypes from "prop-types";

export const DEFAULT_BACKEND_URL = "http://localhost:5000";
// REDUCER STUFF
const TOGGLE_SHOW = "APP/SETTINGS/TOGGLE_SHOW"
const SET_BACKEND_URL = "APP/SETTINGS/BACKEND_URL/SET"

export const toggleShowAll = () => ({type: TOGGLE_SHOW})
export const setBackendURL = (url) => ({type: SET_BACKEND_URL, backend_url: url})
const reducer = (state, action) => {
    switch (action.type) {
        case TOGGLE_SHOW:
            return {
                ...state,
                show_all: !state.show_all
            }
        case SET_BACKEND_URL:
            return {
                ...state,
                backend_url: action.backend_url
            }

        default:
            return state
    }
}

export function initSettings(initialArgs) {
    return initialArgs
}

// PROVIDER STUFF
export const Settings = React.createContext({
    state: initSettings(),
    dispatch: () => null
})

export const useSettings = () => {

    const [state, dispatch] = React.useContext(Settings)

    function backendURL(route) {
        return `${state.backend_url}/${route}`
    }

    return {state, dispatch, backendURL}
}
export const SettingsProvider = ({children, backendURL}) => {
    const initialArgs = {show_all: true, backend_url: backendURL}
    const [state, dispatch] = React.useReducer(reducer, initialArgs, initSettings)

    return (
        <Settings.Provider value={[state, dispatch]}>
            {children}
        </Settings.Provider>
    )
}

SettingsProvider.propTypes = {
    /**
     * The subtree that requires access to this context.
     */
    children: PropTypes.element,
    /**
     * The backendURL viASP that provides the graph
     */
    backendURL: PropTypes.string
}
