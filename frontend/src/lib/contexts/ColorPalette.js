import React from "react";
import PropTypes from "prop-types";

export const defaultPalette = {
    // ten: "#FF0032",
    ten: "#2F97C1",
    // thirty: "#AAFFAA",
    thirty: "#000000",
    // sixty: "#FFAAFF",
    sixty: "#F6F4F3",
    // background: "#FF00AA"
    error_ten: "#EB4A4E",
    error_thirty: "#4C191A",
    error_sixty: "#FCE8E8"
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
    children: PropTypes.element,
    colorPalette: PropTypes.exact({
        ten: PropTypes.string,
        thirty: PropTypes.string,
        sixty: PropTypes.string,
        background: PropTypes.string
    })
}
