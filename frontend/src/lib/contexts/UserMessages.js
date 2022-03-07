import PropTypes from "prop-types";
import React, {createContext, useContext, useReducer} from "react";

export const initialState = {activeMessages: []}
export const ERROR = 'APP/MESSAGES/ERROR';
export const WARN = 'APP/MESSAGES/WARN';
export const showError = (message) => ({type: ERROR, text: message})
export const showWarn = (message) => ({type: WARN, text: message})
export const messageReducer = (state = initialState, action) => {
    if (action.type === ERROR) {
        return {
            ...state,
            activeMessages: state.activeMessages.concat({text: action.text, level: "error"})
        }
    }
    if (action.type === WARN) {
        return {
            ...state,
            activeMessages: state.activeMessages.concat({text: action.text, level: "warn"})
        }
    }
    return {...state}
}
const UserMessagesContext = createContext([]);
export const useMessages = () => useContext(UserMessagesContext);
export const UserMessagesProvider = ({children}) => {
    const [state, dispatch] = useReducer(messageReducer, initialState);
    return <UserMessagesContext.Provider value={[state, dispatch]}>{children}</UserMessagesContext.Provider>
}

UserMessagesProvider.propTypes = {
    children: PropTypes.element
}
