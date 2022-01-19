import React, {createContext, useContext, useReducer} from "react";
import PropTypes from "prop-types";

export const initialState = {
    shownNodes: [],
};
export const HIDE_NODE = 'APP/NODES/HIDE';
export const SHOW_NODE = 'APP/NODES/SHOW';
export const hideNode = (node) => ({type: HIDE_NODE, node})
export const showNode = (node) => ({type: SHOW_NODE, node})
export const nodeReducer = (state = initialState, action) => {
    if (action.type === SHOW_NODE) {
        return {
            ...state,
            shownNodes: state.shownNodes.concat(action.node)
        }
    }
    if (action.type === HIDE_NODE) {
        return {
            ...state,
            shownNodes: state.shownNodes.filter(item => item !== action.node)
        }
    }
    return {...state}
}
const ShownNodesContext = createContext([]);
export const useShownNodes = () => useContext(ShownNodesContext);
export const ShownNodesProvider = ({children, initialState, reducer}) => {
    const [globalState, dispatch] = useReducer(reducer, initialState);
    return <ShownNodesContext.Provider value={[globalState, dispatch]}>{children}</ShownNodesContext.Provider>
}

ShownNodesProvider.propTypes = {
    /**
     * The subtree that requires access to this context.
     */
    children: PropTypes.any,
    /**
     * The nodes that are shown initially. Is empty I think.
     */
    initialState: PropTypes.array,
    /**
     * The reducer function (TODO: Why is this here?)
     */
    reducer: PropTypes.func
}
