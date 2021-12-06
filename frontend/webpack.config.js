const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// {
//   entry: path.join(__dirname, "src", "js", "main.js"),
//   output: {
//     path: path.join(__dirname, "build"),
//     filename: "main.js"
//   },
//   target: "electron-main",
// },
// {
//   entry: path.join(__dirname, "src", "js", "renderer.js"),
//   output: {
//     path: path.join(__dirname, "build"),
//     filename: "renderer.js"
//   },
//   target: "electron-renderer"
// }

module.exports = [{
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
        static: './dist',
    },
    entry: './src/main.ts',
    target: 'electron-main',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'main.html',
            template: 'src/main.html',
        })
    ],
    module: {
        rules: [{
            test: /\.(tsx|ts)?$/,
            use: 'ts-loader',
            exclude: /node_modules/,
        }, {
            test: /\.css$/i,
            use: ['style-loader', 'css-loader'],
        }, {
            test: /\.(png|svg|jpg|jpeg|gif)$/i,
            type: 'asset/resource',
        }
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    }
}, {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
        static: './dist',
    },
    entry: './src/renderer.ts',
    target: 'electron-renderer',
    output: {
        filename: 'renderer.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'main.html',
            template: 'src/main.html',
        })
    ],
    module: {
        rules: [{
            test: /\.(tsx|ts)?$/,
            use: 'ts-loader',
            exclude: /node_modules/,
        }, {
            test: /\.css$/i,
            use: ['style-loader', 'css-loader'],
        }, {
            test: /\.(png|svg|jpg|jpeg|gif)$/i,
            type: 'asset/resource',
        }
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    }
}];
