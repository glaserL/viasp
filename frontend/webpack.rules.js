module.exports = [

    // Add support for native node modules
    {
        // We're specifying native_modules in the test because the asset relocator loader generates a
        // "fake" .node file which is really a cjs file.
        test: /native_modules\/.+\.node$/,
        use: 'node-loader',
    },
    {
        test: /\.(tsx|ts)?$/,
        exclude: /(node_modules|\.webpack)/,
        use: {
            loader: 'ts-loader'
        }
    }, {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
    }, {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
    }
];
