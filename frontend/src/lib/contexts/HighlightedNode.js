import React from "react";
import PropTypes from "prop-types";

const defaultHighlightedNode = null;

const HighlightedNodeContext = React.createContext(defaultHighlightedNode);

export const useHighlightedNode = () => React.useContext(HighlightedNodeContext);
export const HighlightedNodeProvider = ({children}) => {
    const [highlightedNode, setHighlightedNode] = React.useState(defaultHighlightedNode);


    return <HighlightedNodeContext.Provider
        value={[highlightedNode, setHighlightedNode]}>{children}</HighlightedNodeContext.Provider>
}

HighlightedNodeProvider.propTypes = {
    /**
     * The subtree that requires access to this context.
     */
    children: PropTypes.element,
}
