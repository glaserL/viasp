import React, {createContext, useContext} from "react";
import PropTypes from "prop-types";

export const defaultPalette = {
    ten: "#FF0032",
    // ten: "#2F97C1",
    thirty: "#AAFFAA",
    // thirty: "#000000",
    sixty: "#FFAAFF",
    // sixty: "#F6F4F3",
    background: "#FF00AA"
};

const ColorPaletteContext = createContext([]);
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
    useContext(ColorPaletteContext)
    return defaultPalette;
};

export const useColorPalette = () => useContext(ColorPaletteContext);
export const ColorPaletteProvider = ({children, colorPalette}) => {
    console.log(colorPalette)
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
