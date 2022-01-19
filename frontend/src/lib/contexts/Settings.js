// https://www.thisdot.co/blog/creating-a-global-state-with-react-hooks
import React, {createContext, useContext, useReducer} from "react"
import PropTypes from "prop-types";
// REDUCER STUFF

const TOGGLE_SHOW = "APP/SETTINGS/TOGGLE_SHOW"
const SET_BACKEND_URL = "APP/SETTINGS/BACKEND_URL/SET"

export const toggleShowAll = () => ({type: TOGGLE_SHOW})
export const setBackendURL = (url) => ({type: SET_BACKEND_URL, url})
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

export function initSettings(initialShowAll) {
    return {show_all: initialShowAll, backend_url: "http://localhost:5000"}
}

// PROVIDER STUFF
export const Settings = createContext({
    state: initSettings(),
    dispatch: () => null
})
export const useSettings = () => useContext(Settings)
export const SettingsProvider = ({children}) => {
    const [state, dispatch] = useReducer(reducer, true, initSettings)

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
    children: PropTypes.any
}
