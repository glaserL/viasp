import PropTypes from "prop-types";
import React, {createContext, useContext, useReducer} from "react";

export const initialState = {activeFilters: []}
export const ADD_SIGNATURE = 'FILTERS/SIGNATURE/ADD';
export const REMOVE_SIGNATURE = 'FILTERS/SIGNATURE/CLEAR';
export const ADD_MODEL = 'FILTERS/MODEL/ADD';
export const CLEAR_MODEL = 'FILTERS/MODEL/CLEAR';
export const REMOVE = 'FILTERS/REMOVE';

export const addSignature = (signature) => ({type: ADD_SIGNATURE, signature: signature})
export const clearSignature = () => ({type: REMOVE_SIGNATURE})
const clear = (filter) => ({type: REMOVE, filter: filter})
export const filterReducer = (state = initialState, action) => {
    console.log(`Reducing ${JSON.stringify(state)}, ${JSON.stringify(action)}`)
    if (action.type === ADD_SIGNATURE) {
        return {
            ...state,
            activeFilters: state.activeFilters.concat(action.signature)
        }
    }
    if (action.type === REMOVE) {
        return {
            ...state,
            activeFilters: state.activeFilters.filter(filter => filter !== action.filter)
        }
    }
    return {...state}
}
const FilterContext = createContext([]);
export const useFilters = () => useContext(FilterContext);
export const FilterProvider = ({children}) => {
    const [state, dispatch] = useReducer(filterReducer, initialState);
    return <FilterContext.Provider value={[state, dispatch]}>{children}</FilterContext.Provider>
}

FilterProvider.propTypes = {
    children: PropTypes.element
}

export {clear}
