import React from "react"
import {reducer, initShowAll} from "./ShowAllReducer"
import PropTypes from "prop-types";
// https://www.thisdot.co/blog/creating-a-global-state-with-react-hooks
export const ShowAllContext = React.createContext({
    state: initShowAll(true),
    dispatch: () => null
})

export const ShowAllProvider = ({children}) => {
    const [state, dispatch] = React.useReducer(reducer, true, initShowAll)

    return (
        <ShowAllContext.Provider value={[state, dispatch]}>
            {children}
        </ShowAllContext.Provider>
    )
}

ShowAllProvider.propTypes = {
    /**
     * The subtree that requires access to this context.
     */
    children: PropTypes.any
}
