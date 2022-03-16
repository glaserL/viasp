import React from "react";
import PropTypes from "prop-types";

export const defaultPalette = {
    ten: {dark: "#3FA7D1", bright: "#3FA7E1"},
    thirty: {dark: "#444", bright: "#454545"},
    sixty: {dark: "#F6F4F3", bright: "#FEFEFE"},
    error: {ten: "#EB4A4E", thirty: "#4C191A", sixty: "#FCE8E8"},
    warn: {ten: "#FF9800", thirty: "#653300", sixty: "#FFF1DF"}
};

const ColorPaletteContext = React.createContext([]);
export const updateColorPalette = (custom_colors) => {
    if ("ten" in custom_colors) {
        defaultPalette.ten = custom_colors.ten;
    }
    if ("thirty" in custom_colors) {
        defaultPalette.thirty = custom_colors.thirty;
    }
    if ("sixty" in custom_colors) {
        defaultPalette.sixty = custom_colors.sixty;
    }
    React.useContext(ColorPaletteContext)
    return defaultPalette;
};

export const useColorPalette = () => React.useContext(ColorPaletteContext);
export const ColorPaletteProvider = ({children, colorPalette}) => {
    const updatedColorPalette = updateColorPalette(colorPalette)
    return <ColorPaletteContext.Provider value={updatedColorPalette}>{children}</ColorPaletteContext.Provider>
}

ColorPaletteProvider.propTypes = {
    /**
     * The subtree that requires access to this context.
     */
    children: PropTypes.element,
    /**
     * The color palette to update the color palette with
     */
    colorPalette: PropTypes.exact({
        ten: PropTypes.string,
        thirty: PropTypes.string,
        sixty: PropTypes.string,
        background: PropTypes.string
    })
}
