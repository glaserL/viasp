const config = {
    devtool: 'inline-source-map',
    devServer: {
        static: './dist',
    },
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
};

module.exports = config;
