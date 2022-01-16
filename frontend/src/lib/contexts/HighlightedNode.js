import React, {createContext, useContext, useState} from "react";
import PropTypes from "prop-types";

const defaultHighlightedNode = null;

const HighlightedNodeContext = createContext(defaultHighlightedNode);

export const useHighlightedNode = () => useContext(HighlightedNodeContext);
export const HighlightedNodeProvider = ({children}) => {
    const [highlightedNode, setHighlightedNode] = useState(defaultHighlightedNode);


    return <HighlightedNodeContext.Provider
        value={[highlightedNode, setHighlightedNode]}>{children}</HighlightedNodeContext.Provider>
}

HighlightedNodeProvider.propTypes = {
    children: PropTypes.element,
}
