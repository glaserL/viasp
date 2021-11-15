const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
        static: './dist',
    },
    entry: {
        index: './src/index.ts',
        print: './src/cool.ts',
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'main.html',
            template: 'src/main.html',
        }),
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
    },
};
