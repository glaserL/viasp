import React from "react";
import {showError, useMessages} from "./UserMessages";
import {useSettings} from "./Settings";
import PropTypes from "prop-types";

function fetchTransformations(backendURL) {
    return fetch(`${backendURL("graph/transformations")}`).then(r => {
        if (r.ok) {
            return r.json()
        }
        throw new Error(r.statusText);

    });
}

const initialState = {
    transformations: [],
};

const HIDE_TRANSFORMATION = 'APP/TRANSFORMATIONS/HIDE';
const SHOW_TRANSFORMATION = 'APP/TRANSFORMATIONS/SHOW';
const TOGGLE_TRANSFORMATION = 'APP/TRANSFORMATIONS/TOGGLE';
const SHOW_ONLY_TRANSFORMATION = 'APP/TRANSFORMATIONS/ONLY';
const ADD_TRANSFORMATION = 'APP/TRANSFORMATIONS/ADD';
const hideTransformation = (t) => ({type: HIDE_TRANSFORMATION, t})
const showTransformation = (t) => ({type: SHOW_TRANSFORMATION, t})
const toggleTransformation = (t) => ({type: TOGGLE_TRANSFORMATION, t})
const showOnlyTransformation = (t) => ({type: SHOW_ONLY_TRANSFORMATION, t})
const addTransformation = (t) => ({type: ADD_TRANSFORMATION, t})
const TransformationContext = React.createContext();

const transformationReducer = (state = initialState, action) => {
    if (action.type === ADD_TRANSFORMATION) {
        return {
            ...state,
            transformations: state.transformations.concat({transformation: action.t, shown: true})
        }
    }
    if (action.type === SHOW_ONLY_TRANSFORMATION) {
        return {
            ...state,
            transformations: state.transformations.map(container => container.transformation.id !== action.t.id ? {
                transformation: container.transformation,
                shown: false
            } : {
                transformation: container.transformation,
                shown: true
            })
        }
    }
    if (action.type === SHOW_TRANSFORMATION) {
        return {
            ...state,
            transformations: state.transformations.map(container => container.transformation === action.t ? {
                transformation: container.transformation,
                shown: true
            } : container)
        }
    }
    if (action.type === HIDE_TRANSFORMATION) {
        return {
            ...state,
            transformations: state.transformations.map(container => container.transformation === action.t ? {
                transformation: container.transformation,
                shown: false
            } : container)
        }
    }
    if (action.type === TOGGLE_TRANSFORMATION) {
        return {
            ...state,
            transformations: state.transformations.map(container => container.transformation === action.t ? {
                transformation: container.transformation,
                shown: !container.shown
            } : container)
        }
    }
    return {...state}
}

const TransformationProvider = ({children}) => {
    const [, message_dispatch] = useMessages()
    const {backendURL} = useSettings();
    const [state, dispatch] = React.useReducer(transformationReducer, initialState);

    React.useEffect(() => {
        let mounted = true;
        fetchTransformations(backendURL).catch(error => {
            message_dispatch(showError(`Failed to get transformations: ${error}`))
        })
            .then(items => {
                if (mounted) {
                    items.map((t) => (dispatch(addTransformation(t))))
                }
            })
        return () => mounted = false;
    }, []);
    return <TransformationContext.Provider value={{state, dispatch}}>{children}</TransformationContext.Provider>
}

const useTransformations = () => React.useContext(TransformationContext);

TransformationProvider.propTypes = {
    /**
     * The subtree that requires access to this context.
     */
    children: PropTypes.element,
}
export {TransformationProvider, TransformationContext, useTransformations, toggleTransformation, showOnlyTransformation}
