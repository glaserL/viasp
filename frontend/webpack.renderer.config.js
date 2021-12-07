const path = require("path");
const {merge} = require('webpack-merge');
const HtmlWebpackPlugin = require("html-webpack-plugin");

const base = require("./webpack.base.config");
const buildPath = path.resolve(__dirname, "./dist");
const renderer = merge(base, {
    mode: 'development',
    target: "electron-renderer",
    entry: "./src/renderer.ts",
    output: {
        filename: "renderer.js",
        path: buildPath
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./src/main.html"
        })
    ],
});

module.exports = renderer;
